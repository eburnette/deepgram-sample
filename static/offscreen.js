/**
 * This file contains the offscreen script that handles audio recording and transcription.
 */

// Don't check in your real keys
// TODO: Switch to temporary tokens
//    Deepgram doc:
//      https://deepgram.com/learn/protecting-api-key
//      https://developers.deepgram.com/reference/create-key
//      See time_to_live_in_seconds on the "v1/projects/{project_id}/keys endpoint.
//    AssemblyAI doc:
//      https://www.assemblyai.com/docs/speech-to-text/streaming#authenticate-with-a-temporary-token .
const assemblyAiKey = "";
const deepgramKey = "48e3830a53f9d054f9a787e7bf90496501845c70";

// ATTN
// Amount of time to gather audio data before sending it to be transcribed
// 300 and 1000 does not work, I don't get any transcription data back from Deepgram
const TRANSCRIPT_INTERVAL = 2000; // milliseconds

// Feature flags. Note the code only supports one transcript method at a time.
const useAssemblyAI = false;
const useDeepgram = true;
const useDeepgramSocket = false;
// const aiEnabled = true;

// AbortController for the fetch requests
// https://developer.mozilla.org/en-US/docs/Web/API/AbortController
var abortController = new AbortController();

// ===== Global Variables =====
// I'm not a fan of global variables but I can't think of an alternative right now
var mediaRecorder;  // MediaRecorder instance, has combined streams
var mediaStream;    // Combined stream of mic and tab audio
var micStream;      // Stream from the microphone
var tabStream;      // Stream from the tab
var rt;             // Real-time transcription service
var userInfo;       // User information

var texts;          // Array of partial transcripts
var transcript;     // The current transcript
var lastPartial;    // Remember last partial transcription to eliminate duplicates
var aiInterval;     // Interval timer for checking the transcript and sending it to the AI

// Status flags
var isListening;    // Flag to indicate if audio recording is turned on
var isTranscribing; // Flag to indicate if transcription is turned on

resetGlobals();

/**
 * Resets all global variables to their default values.
 */
function resetGlobals() {
  mediaRecorder = null;
  mediaStream = null;
  micStream = null;
  tabStream = null;
  rt = null;
  userInfo = null;

  texts = [];
  transcript = "";
  lastPartial = "";

  isListening = false;
  isTranscribing = false;
  isAIProcessing = false;

  // Debugging indicators
  sendDebugState("stt", "off");
  sendDebugState("ai", "off");
}

// /**
//  * Cleans up and resets the global state.
//  */
// function cleanupAndReset() {
//   console.debug("OFFSCREEN: Cleaning up and resetting...");
//   stopListening();
//   stopTranscribing();
//   stopAI();
//   resetGlobals();
// }

/**
 * Event listener for messages from the extension.
 * @param {Object} request - The message request.
 * @param {Object} sender - The sender of the message.
 * @param {function} sendResponse - Callback function to send a response.
 * @returns {boolean} - Indicates whether the response should be asynchronous.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ignore messages not meant for the offscreen script
  if (request?.message?.target != "offscreen") {
    return;
  }

  switch (request?.message?.type) {
    case "CHECK_PERMISSIONS":
      console.debug("OFFSCREEN: Checking permissions...");
      checkAudioPermissions()
        .then((data) => {
          sendResponse({ message: { status: "success", data: data } });
        })
        .catch((error) => {
          sendResponse({ message: { status: "error", data: error } })
        });
      return true; // expect async response

    case "START_LISTENING":
      console.debug("OFFSCREEN: Starting listening...");
      startListening(request?.message?.data)
        .then((data) => {
          console.debug("OFFSCREEN: Listening started successfully");
          sendResponse({ message: { status: "success", data: data } })
        })
        .catch((error) => {
          console.error("OFFSCREEN: Error starting listening:", error.message);
          sendResponse({ message: { status: "error", data: error.message } })
        });
      return true; // expect async response

    case "STOP_LISTENING":
      console.debug("OFFSCREEN: Stopping listening...");
      stopListening();
      sendResponse({});
      break;

    case "START_TRANSCRIPT":
      console.debug("OFFSCREEN: Starting Transcription...");
      startTranscribing()
        .then((data) => {
          console.debug("OFFSCREEN: Transcription started successfully");
          sendResponse({ message: { status: "success", data: data } })
        })
        .catch((error) => {
          console.error("OFFSCREEN: Error starting transcription:", error.message);
          sendResponse({ message: { status: "error", data: error.message } })
        });
      return true; // expect async response

    case "STOP_TRANSCRIPT":
      console.debug("OFFSCREEN: Stopping Transcription...");
      stopTranscribing();
      sendResponse({});
      break;

    case "SET_USER_INFO":
      console.debug("OFFSCREEN: Setting user info to", request?.message?.data);
      userInfo = request?.message?.data;
      sendResponse({});
      break;

    // case "SHOW_ERROR_OFFSCREEN":
    //   // Data has: { error: "Error message" }
    //   console.debug("OFFSCREEN: Reporting error", request?.message?.data?.error);
    //   window.alert(request?.message?.data?.error);
    //   sendResponse({});
    //   break;

    default:
      sendResponse({});
      break;
  }
});

async function sendMessageToSidepanel(type, data) {
  console.debug("OFFSCREEN: Sending message to sidepanel:", type, data);
  chrome?.runtime?.sendMessage({
    message: {
      type: type,
      target: "sidepanel",
      data: data
    }
  },
    (response) => {
      if (chrome.runtime.lastError) {
        // Make this a log because it's quite common
        console.debug("OFFSCREEN: Error sending message to sidepanel:", chrome.runtime.lastError.message);
        return;
      }
      console.debug("OFFSCREEN: Response from sidepanel:", response);
    });
};

async function sendDebugState(key, value) {
  console.debug("OFFSCREEN: Sending message to debug panel:", key, value);

  // Validate key and value (make sure it matches types/index.ts)
  if (!["tab", "mic", "stt", "ai"].includes(key)) {
    console.error("OFFSCREEN: Invalid key for debug state:", key);
    return;
  }
  if (!["default", "off", "on", "active", "warn", "error"].includes(value)) {
    console.error("OFFSCREEN: Invalid value for debug state:", value);
    return;
  }

  chrome?.runtime?.sendMessage({
    message: {
      type: "DEBUG_STATE",
      target: "debug",
      data: { key, value }
    }
  },
    (response) => { // underscore means it's unused
      if (chrome.runtime.lastError) {
        // Make this a log because it's quite common
        console.debug("OFFSCREEN: Error sending debug state to debug panel:", chrome.runtime.lastError.message);
        return;
      }
      // console.debug("OFFSCREEN: Response from debug panel:", response);
    });
};

/**
 * Initiates the audio recording process using MediaRecorder.
 */
async function startListening(data) {
  if (isListening) {
    console.debug("OFFSCREEN: Already listening, nothing to do");
    return;
  }

  console.debug("OFFSCREEN: startListening(): setting listening to TRUE");
  isListening = true;

  var { tabStreamId, tabId } = data;

  console.debug("OFFSCREEN: Starting recording tabs... tabStreamId is", tabStreamId, "and tabId is", tabId);
  tabStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: tabStreamId
      }
    }
  });
  sendDebugState("tab", "on");

  // Capturing the tab mutes the speakers so we need to connect it to the output
  // const output = new AudioContext();
  const audioContext = new AudioContext();
  const tabNode = audioContext.createMediaStreamSource(tabStream);
  tabNode.connect(audioContext.destination);
  console.debug("OFFSCREEN: Got tab audio stream", tabStream);

  console.debug("OFFSCREEN: Starting recording mic...");
  // const audioInputDevices = await getAudioInputDevices()
  // const deviceId = audioInputDevices[0].deviceId;
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  console.debug("OFFSCREEN: Got mic audio stream", micStream);
  sendDebugState("mic", "on");

  mediaStream = merge(audioContext, micStream, tabStream);
  mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" })

  // When data is available, send it for transcription
  mediaRecorder.ondataavailable = (event) => {
    if (mediaRecorder?.state === "recording") {
      sendDebugState("mic", "active");
      sendDebugState("tab", "active");
      // TODO: Handle case where the data stops coming
      transcribe(event.data);
    }
  };
  mediaRecorder.onstop = () => {
    try {
      console.debug("OFFSCREEN: Received mediaRecorder.stop event");
      // TODO: Handle premature stop
      sendDebugState("mic", "off");
      sendDebugState("tab", "off");
    } catch (error) {
      console.error("OFFSCREEN: Error in mediaRecorder.stop", error)
      sendDebugState("mic", "error");
      sendDebugState("tab", "error");
    }
  }

  // Start MediaRecorder and capture chunks
  console.debug("OFFSCREEN: Starting mediaRecorder...");
  mediaRecorder.start(TRANSCRIPT_INTERVAL); // audio data chunks
}

/**
 * Terminates the audio recording process and cleans up so it can be started again later.
 */
function stopListening() {
  if (!isListening) {
    console.debug("OFFSCREEN: isListening is off already, but we'll turn it off again");
  }
  console.debug("OFFSCREEN: stopListening(): setting listening to false");
  isListening = false;

  console.debug("OFFSCREEN: Cleaning up media...");
  if (mediaRecorder) {
    console.debug("OFFSCREEN: Stopped recording in offscreen...");
    mediaRecorder.stop(); // will trigger the stop event
    mediaRecorder = null;
  }
  if (mediaStream) {
    console.debug("OFFSCREEN: Cleaning up mediaStream...");
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  if (micStream) {
    console.debug("OFFSCREEN: Cleaning up micStream...");
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
  if (tabStream) {
    console.debug("OFFSCREEN: Cleaning up tabStream...");
    tabStream.getTracks().forEach(track => track.stop());
    tabStream = null;
  }
}

/**
 * Fetches audio input devices using the `navigator.mediaDevices.enumerateDevices` API.
 * @returns {Promise<Object[]>} - Promise that resolves to an array of audio input devices.
 */
function getAudioInputDevices() {
  return new Promise((resolve, reject) => {
    console.debug("OFFSCREEN: Getting audio input devices...");
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        // Filter the devices to include only audio input devices
        console.debug("OFFSCREEN: Got devices", devices);
        const audioInputDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );
        resolve(audioInputDevices);
      })
      .catch((error) => {
        console.debug("OFFSCREEN: Error getting audio input devices", error);
        reject(error);
      });
  });
}

/**
 * Checks microphone permissions using the `navigator.permissions.query` API.
 * @returns {Promise<Object>} - Promise that resolves to an object containing permission status.
 */
function checkAudioPermissions() {
  console.debug("OFFSCREEN: Checking audio permissions...");
  return new Promise((resolve, reject) => {
    navigator.permissions
      .query({ name: "microphone" })
      .then((result) => {
        if (result.state === "granted") {
          console.debug("OFFSCREEN: Mic permissions granted");
          resolve({
            message: { status: "success" }
          });
        } else {
          console.debug("OFFSCREEN: Mic permissions missing", result.state);
          reject({
            message: { status: "error", data: result.state }
          });
        }
      })
      .catch((error) => {
        console.warn("OFFSCREEN: Permissions error", error);
        reject({
          message: { status: "error", data: error }
        });
      });
  });
}

/**
 * Start real-time transcription
 */
async function startTranscribing() {
  console.debug("OFFSCREEN: startTranscribing() called");
  if (isTranscribing) {
    console.debug("OFFSCREEN: Already transcribing, ignoring call");
    return;
  }

  console.debug("OFFSCREEN: startTranscribing(): setting transcribing to true");
  isTranscribing = true;

  console.debug("OFFSCREEN: Initializing real-time transcription pipeline");
  transcript = "";

  // try {
  if (useDeepgram) {
    const deepgramAiToken = deepgramKey; // TODO: Use a temporary token
    const client = deepgram.createClient(deepgramAiToken);

    // Options documented at https://developers.deepgram.com/reference/listen-live
    // Multichannel transcript is described at https://developers.deepgram.com/docs/multichannel
    const tag = `${userInfo?.user?.email}` + (userInfo?.org?.slug ? ` (${userInfo?.org?.slug})` : "");
    console.debug("OFFSCREEN: tag is ", tag);
    const extra = JSON.stringify(userInfo);
    rt = client.listen.live({
      model: "nova-2",
      channels: 2,
      smart_format: true, // TODO: See if this is desired
      // sample_rate: 16_000,
      // encoding: "linear16",
      multichannel: true,
      keep_alive: true, // TODO: See if this is desired
      tag: tag, // might be undefined if this is the first time for the user
      extra: extra
    });
  }

  if (useDeepgramSocket) {
    const deepgramAiToken = deepgramKey;

    // Options documented at https://developers.deepgram.com/reference/listen-live
    // Multichannel transcript is described at https://developers.deepgram.com/docs/multichannel
    rt = new WebSocket("wss://api.deepgram.com/v1/listen?model=general-enhanced&encoding=linear16&sample_rate=16000&channels=2&multichannel=true&keep_alive=true",
      //model: "nova-2",
      //smart_format: true,
      ["token", deepgramAiToken])
  }

  if (useAssemblyAI) {
    // console.debug("OFFSCREEN: Getting token");
    const assemblyAiToken = assemblyAiKey; // TODO: Use a temporary token
    console.debug("OFFSCREEN: Token is", assemblyAiToken)
    console.debug("OFFSCREEN: Creating RealtimeTranscriber instance")
    rt = new assemblyai.RealtimeTranscriber({
      token: assemblyAiToken,
    });
    console.debug("OFFSCREEN: RealtimeService is", rt)
    // handle incoming messages to display transcription to the DOM

    console.debug("OFFSCREEN: Connecting to transcript service...")
    await rt.connect();
  }
  console.debug("OFFSCREEN: Connected to transcript service");

  // console.debug("OFFSCREEN: Initializing callbacks")
  initTranscriptionCallbacks();
  // console.debug("OFFSCREEN: Callbacks initialized");

  // console.debug("OFFSCREEN: Real-time transcription pipeline initialized");
  // } catch (error) {
  //   console.error("OFFSCREEN: Error starting transcription:", error.message);
  //   sendDebugState("stt", "error");
  //   sendMessageToSidepanel("SHOW_ERROR", { error: `Error starting transcription: ${error.message}` });
  //   stopTranscribing();
  // }
}

/**
 * Stop real-time transcription.
 */
function stopTranscribing() {
  console.debug("OFFSCREEN: stopTranscribing() called");
  if (!isTranscribing) {
    console.debug("OFFSCREEN: Transcription is already off, ignoring call");
    return;
  }

  console.debug("OFFSCREEN: stopTranscribing(): setting transcribing to false");
  isTranscribing = false;

  if (useDeepgram) {
    if (rt) {
      console.debug("OFFSCREEN: Stopping deepgram transcription...");
      rt.finish();
    }
  }
  if (useDeepgramSocket) {
    if (rt) {
      console.debug("OFFSCREEN: Stopping deepgram socket transcription...");
      rt.close();
    }
  }
  if (useAssemblyAI) {
    if (rt) {
      console.debug("OFFSCREEN: Closing transcript service")
      rt.close();
    }
  }
}

/**
 * Transcribes audio data. This won't do anything if transcription is
 * currently off.
 */
async function transcribe(audioData) {
  if (!isTranscribing) {
    //console.debug("OFFSCREEN: Transcribe size", audioData.size, "ignored because transcription is off");
    return;
  }

  // Show the first few bytes of audio data to make sure it's not zero
  console.debug("OFFSCREEN: Sending audio data to transcript", Array.from(new Int16Array(await audioData.slice(0, 10).arrayBuffer())));

  if (useDeepgram || useDeepgramSocket) {
    if (!rt) {
      console.debug("OFFSCREEN: Not live in onAudioData, ignoring...");
      return;
    }

    try {
      rt.send(audioData);
    } catch (error) {
      console.error("OFFSCREEN: Error sending audio data to Deepgram", error.message);
      sendDebugState("stt", "error");
      sendMessageToSidepanel("SHOW_ERROR", { error: `Error sending audio data to Deepgram: ${error.message}` });
      stopTranscribing();
      return;
    }
  }
  if (useAssemblyAI) {
    if (!rt) {
      console.debug("OFFSCREEN: rt null in onAudioData");
      sendDebugState("stt", "error");
      sendMessageToSidepanel("SHOW_ERROR", { error: "Unexpected state, please report to support: rt == null" });
      stopTranscribing();
      return;
    }

    try {
      rt.sendAudio(audioData); // this method is synchronous
    } catch (error) {
      console.error("OFFSCREEN: Error sending audio data to AssemblyAI", error.message);
      sendDebugState("stt", "error");
      sendMessageToSidepanel("SHOW_ERROR", { error: `Error sending audio data to AssemblyAI: ${error.message}` });
      stopTranscribing();
      return;
    }
  }
}

/**
 * Initializes the callbacks for the real-time transcription service.
 */
function initTranscriptionCallbacks() {
  console.debug("OFFSCREEN: Initializing callbacks");
  if (useDeepgram) {
    // Deepgram version
    rt.on("open", async () => {
      console.debug("OFFSCREEN: Live connected to deepgram");
      sendDebugState("stt", "on");
    });

    // Results contain this info:
    // https://github.com/deepgram/deepgram-js-sdk/blob/main/src/lib/types/LiveTranscriptionEvent.ts
    rt.on("Results", (data) => {
      console.debug("OFFSCREEN: Live results from deepgram:", data);

      // TODO: Handle the case where the transcript updates just stop (could just be quiet period)
      // In some cases we can get the response after the user stopped the call
      // so we need to check if we're still transcribing
      if (!isListening || !isTranscribing) {
        console.debug("OFFSCREEN: Skipping this result because we're not listening or transcribing");
      } else {
        sendDebugState("stt", "active");
        const alt = data.channel.alternatives[0];
        const partial = alt.transcript; // TODO: sort by timestamp
        const source = Math.min(data.channel_index[0], 1); // only 2 channels

        if (partial && partial.length > 0) {
          if (partial === lastPartial) {
            console.debug("OFFSCREEN: Live Skipping duplicate partial transcript");
          } else {
            lastPartial = partial;
            transcript = `${transcript}\n${source}: ${partial}`;
            console.debug(`OFFSCREEN: deepgram live transcript so far: <<${transcript}>>`);
            sendMessageToSidepanel("TRANSCRIPT", { transcript });
          }
        }
      }
    });

    rt.on("error", (e) => {
      console.error("OFFSCREEN: Live error", e)
      sendDebugState("stt", "error");
      sendMessageToSidepanel("SHOW_ERROR", { error: `An error occurred during transcription: ${e}` });
      stopTranscribing();
    });

    rt.on("warning", (e) => {
      console.warn("OFFSCREEN: Live warning", e)
      sendDebugState("stt", "warn");
    });

    rt.on("Metadata", (e) => {
      console.debug("OFFSCREEN: Live metadata", e)
    });

    rt.on("close", (e) => {
      console.debug("OFFSCREEN: Live close", e)
      // if (isTranscribing) {
      //   // Premature close
      //   console.error("OFFSCREEN: Deepgram connection closed prematurely:", e);
      //   sendDebugState("stt", "error");
      //   window.alert("There was a connection issue with the transcription service, please reopen the extension and try again.");
      //   sendMessageToSidepanel("CLOSE_YOURSELF", {});
      //   stopTranscribing();
      //   resetGlobals();
      //   // sendMessageToSidepanel("SHOW_ERROR", { error: `Deepgram connection closed prematurely: ${e}` });
      //   // This doesn't work:
      //   // console.debug("OFFSCREEN: Trying to restart transcription...");
      //   // startTranscribing();
      //   return;
      // }
      sendDebugState("stt", "off");
    });
  }
  if (useDeepgramSocket) {
    // Deepgram version
    rt.addEventListener("open", async (event) => {
      console.debug("OFFSCREEN: Socket: connected to websocket", event);
      sendDebugState("stt", "on");

      // Results contain this info:
      // https://github.com/deepgram/deepgram-js-sdk/blob/main/src/lib/types/LiveTranscriptionEvent.ts
      rt.addEventListener("Results", (event) => {
        console.debug("OFFSCREEN: Socket Results from deepgram socket:", event);
        sendDebugState("stt", "active");
        let data = event.data;
        console.debug("OFFSCREEN: Socket from deepgram:", data);

        const alt = data.channel.alternatives[0];
        const partial = alt.transcript; // TODO: sort by timestamp
        const source = Math.min(data.channel_index[0], 1); // only 2 channels

        if (partial && partial.length > 0) {
          transcript = `${transcript}\n${source}: ${partial}`;
          console.debug(`OFFSCREEN: Socket deepgram socket transcript so far: <<${transcript}>>`);
        }
      });
    });

    rt.addEventListener("error", (e) => {
      console.error("OFFSCREEN: Socket error", e)
      sendDebugState("stt", "error");
      sendMessageToSidepanel("SHOW_ERROR", { error: `Socket error: ${e}` });
      stopTranscribing();
    });


    rt.addEventListener("warning", (e) => {
      console.warn("OFFSCREEN: Socket warning", e)
      sendDebugState("stt", "warn");
    });

    rt.addEventListener("Metadata", (e) => {
      console.debug("OFFSCREEN: Socket metadata", e)
    });

    rt.addEventListener("close", (e) => {
      sendDebugState("stt", "off");
    });
  }
  if (useAssemblyAI) {
    rt.on("transcript", (message) => {
      console.debug("OFFSCREEN: AssemblyAI Partial transcript ", message);
      sendDebugState("stt", "active");
      let partial = "";
      texts[message.audio_start] = message.text;
      const keys = Object.keys(texts);
      keys.sort((a, b) => a - b);
      for (const key of keys) {
        if (texts[key]) {
          partial += ` ${texts[key]}`;
        }
      }
      if (partial.length > 0) {
        console.debug(`OFFSCREEN: AssemblyAI transcript so far: <<${partial}>>`);
      }

      // Set the global transcript
      transcript = partial;
    });

    rt.on("error", async (error) => {
      console.error("OFFSCREEN: Error occured in AssemblyAI transcript service:", error);
      sendDebugState("stt", "error");
      sendMessageToSidepanel("SHOW_ERROR", { error: `Error occured in AssemblyAI transcript service: ${error}` });
      stopTranscribing();
    });

    rt.on("close", (event) => {
      sendDebugState("stt", "off");
    });

    rt.on("open", (event) => {
      console.debug("OFFSCREEN: AssemblyAI Transcript opened:", event);
      sendDebugState("stt", "on");
    });

    rt.on("session_information)", (event) => {
      console.debug("OFFSCREEN: AssemblyAI Session information:", event);
    });
  }
}

// https://stackoverflow.com/a/47071576
function merge(audioContext, leftStream, rightStream) {
  console.debug("OFFSCREEN: merging", leftStream, rightStream);

  const merger = new ChannelMergerNode(audioContext, {
    numberOfInputs: 2
  });
  const leftNode = new MediaStreamAudioSourceNode(audioContext, {
    mediaStream: leftStream
  });
  const rightNode = new MediaStreamAudioSourceNode(audioContext, {
    mediaStream: rightStream
  });
  console.debug("OFFSCREEN: merger", merger);
  leftNode.connect(merger, 0, 0);
  rightNode.connect(merger, 0, 1);
  const dest = audioContext.createMediaStreamDestination();
  merger.connect(dest);
  return dest.stream
}
