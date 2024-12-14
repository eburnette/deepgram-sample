/* eslint-disable @typescript-eslint/no-explicit-any */

// import PropTypes from "prop-types";
import React, {
  // Dispatch,
  // SetStateAction,
  // createContext,
  // useCallback,
  // useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import InactivityModal from './InactivityModal'; // Import the modal component
import { Routes, Route } from 'react-router-dom';

import { Close } from "../../icons/Close";
import { Icon147 } from "../../icons/Icon147";
// import { Info3 } from "../../icons/Info3";
// import { Info9 } from "../../icons/Info9";
import { FeedbackPanel } from "../../components/FeedbackPanel";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { TranscriptionPanel } from "../../components/TranscriptionPanel";
import { TimerPanel } from "../../components/TimerPanel";
import { DebugPanel } from "../../components/DebugPanel";
import "./style.css";

const INACTIVITY_TIMER = 60 * 60 * 1000; // 60 minutes
const AUTO_CLOSE_TIMER = 2 * 60 * 1000; // 2 minutes

interface Props {
  headerHeaderClassName?: any;
  headerIconButtonIcon?: JSX.Element;
  override?: JSX.Element;
  timerPanelPanelBarInfoButtonVariantPrimaryWrapperIcon?: JSX.Element;
  suggestionsPanelPanelBarInfoButtonVariantPrimaryWrapperIcon?: JSX.Element;
  qPanelPanelBarInfoButtonVariantPrimaryWrapperIcon?: JSX.Element;
  feedbackPanelPanelBarInfoButtonVariantPrimaryWrapperIcon?: JSX.Element;
  aiTest?: any;
  errorTest?: any;
}

// // Function to send a message to the background script
// async function sendMessageToBackground(type: string, data: any) {
//   console.debug("DEEPSAMPLEUI: Sending message to background:", type, data);
//   chrome?.runtime?.sendMessage({
//     message: {
//       type: type,
//       target: "background",
//       data: data
//     }
//   },
//     (response) => {
//       if (chrome.runtime.lastError) {
//         console.error("DEEPSAMPLEUI: Error sending message to background:", chrome.runtime.lastError.message);
//         return;
//       }
//       console.debug("DEEPSAMPLEUI: Response from background:", response);
//     });
// };

// Function to send a message to the offscreen script
async function sendMessageToOffscreenDocument(type: string, data: any) {
  console.debug("DEEPSAMPLEUI: Sending message to offscreen:", type, data);
  chrome?.runtime?.sendMessage({
    message: {
      type: type,
      target: "offscreen",
      data: data
    }
  },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("DEEPSAMPLEUI: Error sending message to offscreen:", chrome.runtime.lastError.message);
        return;
      }
      console.debug("DEEPSAMPLEUI: Response from offscreen:", response);
    });
};

export const DeepSampleUi = ({
  headerHeaderClassName,
  headerIconButtonIcon = <Close className="icon-2" color="white" />,
  override = <Icon147 className="icon-2" />,
  aiTest,
  errorTest,
}: Props): JSX.Element => {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);
  const [error, setError] = useState<any>(errorTest);
  const [recording, setRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("No transcript yet");
  const [userInfo, setUserInfo] = useState<any>(null);
  const transcriptRef = useRef(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  console.debug("DEEPSAMPLEUI: Rendering sidepanel with transcript", transcript);

  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      setShowPopup(true);
    }, INACTIVITY_TIMER);
  };

  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  const handleContinue = () => {
    setShowPopup(false);
    resetInactivityTimer();
  };

  const handleClose = () => {
    window.close();
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    // Initial setup
    resetInactivityTimer();

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Set up the interval
    const interval = setInterval(() => {
      //console.debug("DEEPSAMPLEUI: Timer tick", timer);
      if (recording) {
        setTimer(prevTimer => prevTimer + 1); // Increment the timer by 1 second
      }
    }, 1000); // Every 1000 milliseconds (1 second)

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [recording]); // Re-evaluate when the recording state changes

  useEffect(() => {
    const fetchUserInfo = async () => {
      // Get info about the current extension
      const manifest = chrome.runtime.getManifest();
      console.debug("DEEPSAMPLEUI: manifest", manifest);

      // Get info about the platform
      const platformInfo = await chrome.runtime.getPlatformInfo();
      console.debug("DEEPSAMPLEUI: platformInfo", platformInfo);

      // Get info about the browser
      console.debug("DEEPSAMPLEUI: navigator", navigator);

      // Put it all together
      const newInfo = {
        // User info
        user: {
          // id: user?.id,
          // email: user?.primaryEmailAddress?.emailAddress,
          // metadata: user?.publicMetadata,
        },

        // Organization info
        org: {
          // id: organization?.id,
          // name: organization?.name,
          // slug: organization?.slug
        },

        // Extension info
        extension: {
          id: chrome.runtime.id,
          version: manifest.version
        },

        // Browser info
        browser: {
          language: navigator?.language,
          userAgent: navigator?.userAgent,
        },

        // Platform info
        platform: platformInfo
      };
      setUserInfo(newInfo);
    };

    fetchUserInfo();


  }, []);

  useEffect(() => {
    console.debug("DEEPSAMPLEUI: userInfo", userInfo);
    // Send this info to the offscreen script
    sendMessageToOffscreenDocument("SET_USER_INFO", userInfo);
  }, [userInfo]);

  useEffect(() => {
    console.debug("DEEPSAMPLEUI: Hello from DeepSampleUi");
    stopRecording();

    // We use this for the background script to know when the sidepanel is open
    // https://stackoverflow.com/questions/77089404/chrom-extension-close-event-not-available-on-sidepanel-closure
    chrome.runtime.connect({ name: 'DeepSampleSidepanel' });

    const handleMessage = (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      // Ignore messages not meant for the sidepanel script
      if (request?.message?.target != "sidepanel") {
        return;
      }

      // console.debug("DEEPSAMPLEUI: Request received:", request?.message, "from sender:", sender);
      switch (request?.message?.type) {
        case "TRANSCRIPT":
          console.debug("DEEPSAMPLEUI: Received TRANSCRIPT2", request?.message);
          console.debug("DEEPSAMPLEUI: Received TRANSCRIPT", request?.message?.data?.transcript);
          setTranscript(request?.message?.data?.transcript);
          sendResponse({});
          break;

        case "AI_RESPONSE":
          console.debug("DEEPSAMPLEUI: Received AI_RESPONSE2", request?.message);
          console.debug("DEEPSAMPLEUI: Received AI_RESPONSE", request?.message?.data?.aiResponse);
          // setAIResponse(request?.message?.data?.aiResponse);
          sendResponse({});
          break;

        case "SHOW_ERROR":
          setError(`Internal error:\n\n${request?.message?.data?.error}`);
          sendResponse({});
          break;

        case "CLOSE_YOURSELF":
          console.debug("DEEPSAMPLEUI: Received CLOSE_YOURSELF");
          // Close the side panel
          window.close();
          sendResponse({});
          break;

        default:
          sendResponse({});
          break;
      }
    }
    chrome?.runtime?.onMessage?.addListener(handleMessage);

    // Try doing this in background script instead, because it gets called multiple
    // times because of React magic.
    //// Start transcription when the component mounts (side panel opens)
    // sendMessageToOffscreenDocument("START_TRANSCRIPT", {});

    //// Note: This doesn't work.
    // const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    //   event.preventDefault();
    //   // Stop transcription when the window is about to close
    //   console.error("DEEPSAMPLEUI: Window is about to close");
    //   sendMessageToOffscreenDocument("STOP_AI", {});
    //   sendMessageToOffscreenDocument("STOP_TRANSCRIPT", {});
    // };
    //
    // window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Stop transcription when the component unmounts (side panel closes)
      console.debug("DEEPSAMPLEUI: Component unmounting");
      // The order of these might be important
      //// This doesn't work:
      // sendMessageToOffscreenDocument("STOP_AI", {});
      // sendMessageToOffscreenDocument("STOP_TRANSCRIPT", {});
      // sendMessageToOffscreenDocument("STOP_LISTENING", {});      
      chrome?.runtime?.onMessage?.removeListener(handleMessage);
      // window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Empty dependency array means this effect runs only once on mount (sadly it gets run several times)

  // useEffect(() => {
  //   console.debug("DEEPSAMPLEUI: AI Response updated", aiResponse);
  // }), [aiResponse]

  const startRecording = () => {
    console.debug("DEEPSAMPLEUI: Starting recording...");
    // ATTN
    // Can't do this here because it has to be done within 3 seconds of the side panel opening
    // sendMessageToOffscreenDocument("START_TRANSCRIPT", {});
    sendMessageToOffscreenDocument("START_AI", {});
    setTimer(0); // TODO: Use actual timing data
    setError(null);
    // setAIResponse(callStartedState);
    setRecording(true);
  }

  const stopRecording = () => {
    console.debug("DEEPSAMPLEUI: Stopping recording...");

    // Do these in reverse order of startRecording()
    setRecording(false);
    // setAIResponse(initialState);
    setError(null);
    setTimer(0);
    sendMessageToOffscreenDocument("STOP_AI", {});
    // Doesn't work because transcription has to be on all the time: sendMessageToOffscreenDocument("STOP_TRANSCRIPT", {});
  }

  return (

    <div className={`deepsample-UI ${error ? "error" : ""}`}>
      {/* It would have been cleaner to separate out the Routes and Signup/Signin but the sidepanel
      is tied up with the audio and transcription lifecycle so it's easier to put everything here. */}
      <Routes>
        {/* <Route
          path='/sign-up/*'
          element={
            <div className="login-container">
              <SignUp signInUrl='/' />
            </div>
          }
        /> */}
        <Route
          path='/'
          element={
            <>

              {!error && showHeader && <Header
                className={headerHeaderClassName}
                iconButtonIcon={override}
                override={headerIconButtonIcon}
                title="DeepSample Copilot"
              />}

              {/* {!error && showLogin && (
                  <LoginPanel
                    className="panel-instance"
                    title="DeepSample"
                    onSubmit={() => console.debug("DEEPSAMPLEUI: LoginPanel onSubmit")}
                  />
                )} */}

              {showTimer && ( /* show even when there's an error */
                <TimerPanel
                  className="panel-instance"
                  title="DeepSample Copilot"
                  tooltipText="Timer Panel tooltip."
                  time={timer}
                  recording={recording}
                  onStartStop={(event) => {
                    console.debug("DEEPSAMPLEUI: TimerPanel onSubmit");
                    if (recording) {
                      // TODO: Put in a confirmation Yes/No button.
                      // Originally we had window.confirm() here but it paused everything.
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                />
              )}

              {!error && transcript && (
                <TranscriptionPanel
                  className="panel-instance"
                  transcript={transcript}
                  title="Transcription"
                  tooltipText="Transcription Panel tooltip."
                />
              )}

              {/* {error && <audio src="error.wav" autoPlay />}
                {!error && aiResponse?.overallClassification === "green" && (
                  <audio src="success.wav" autoPlay />
                )}
                {!error && aiResponse?.overallClassification === "red" && (
                  <audio src="failure.wav" autoPlay />
                )} */}
              {error && (

                <FeedbackPanel
                  className="panel-instance"
                  tooltipText="Feedback Panel tooltip."
                  description={error
                    ? "An error occurred in DeepSample. Please report it to DeepSample support (support@deepsamplelegal.com) and include the following information:"
                    : "Provide more details to improve DeepSample (optional)"}
                  title={error
                    ? "Report Error"
                    : "Rate DeepSample"}
                  numStars={error ? 0 : 4}
                  feedbackText={String(error)}
                  onSubmit={() => console.debug("DEEPSAMPLEUI: FeedbackPanel onSubmit")}
                />
              )}

              {true && (
                <DebugPanel
                  className="panel-instance"
                  title="Diagnostics"
                  tooltipText="Debug Panel tooltip."
                />
              )}

            </>
          }
        />
      </Routes>
      {showPopup && <InactivityModal onContinue={handleContinue} onClose={handleClose} timeout={AUTO_CLOSE_TIMER} />}

    </div>
  );
};
