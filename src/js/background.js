/**
 * This file is the service worker for the extension.
 */

import UAParser from "ua-parser-js"

// These web pages are loaded by the extension to help the user when certain
// events occur. They are not part of the extension itself.
const HELP_BASE_URL = "https://deepsamplelegal.com/copilot";
const HELP_INSTALLED_URL = `${HELP_BASE_URL}/installed`;
const HELP_UNINSTALLED_URL = `${HELP_BASE_URL}/uninstalled`;
const HELP_NOT_SUPPORTED_URL = `${HELP_BASE_URL}/not-supported`;
const HELP_PERMISSION_DENIED_URL = `${HELP_BASE_URL}/permission-denied`;
const HELP_IN_PROGRESS_URL = `${HELP_BASE_URL}/in-progress`;
const HELP_ERROR_URL = `${HELP_BASE_URL}/error`;

/**
 * Path to the offscreen HTML document.
 * @type {string}
 */
const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";

/**
 * Key used to store the active tab in local storage.
 * @type {string}
 */
const ACTIVE_TAB_KEY = "activeTab";

/*
 * We also save it in a global variable because we can't do await to get the value in the action click handler.
 */
let activeTab = null;

/**
 * Listener for extension installation.
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.debug("BACKGROUND: Extension installed...", details);
  // Cache the activeTab in a global variable
  await initActiveTabCache();
  console.debug("BACKGROUND: Active tab:", getActiveTab());

  // Create the offscreen document
  await createOffscreenDocument();

  // Display a help document when the extension is installed
  if (details?.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    showHelpTab(HELP_INSTALLED_URL);
  }

  // Display a different help document when the extension is uninstalled
  // chrome.runtime.setUninstallURL(HELP_UNINSTALLED_URL);
});

/**
 * Detect if the sidepanel is open.
 * https://stackoverflow.com/questions/77089404/chrom-extension-close-event-not-available-on-sidepanel-closure
 */
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'DeepSampleSidepanel') {
    port.onDisconnect.addListener(async () => {
      console.debug('BACKGROUND: Sidepanel was closed.');
      await closeSidepanelSafely();
    });
  }
});

/**
 * Detect if the active tab is closed, and if so, close the sidepanel.
 */
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  if (tabId === getActiveTab()) {
    console.debug("BACKGROUND: Active tab %d was closed, so we need to close the sidepanel", tabId);
    await closeSidepanelSafely();
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  console.debug("BACKGROUND: Action clicked:", tab);
  try {
    // If the side panel is already open, we just close it.
    if (hasActiveTab()) {
      console.debug("BACKGROUND: Closing side panel");
      await closeSidepanelSafely();
      return;
    }
    console.debug("BACKGROUND: Opening side panel...");

    // See if we've injected the content script into this document.
    // This check should match the patterns in the manifest.json file.
    // Sadly Chrome won't let us avoid opening the side panel, so we have
    // to close it if the URL is invalid.
    if (!tab.url?.startsWith("http:") && !tab.url?.startsWith("https:") && !tab.url?.startsWith("file:")) {
      fatalError(HELP_NOT_SUPPORTED_URL, `This page is not compatible with DeepSample Copilot. Please open your call center application and try again. [Error code: TABURL]`);
      return;
    }

    // This has to be done very early to avoid this chrome error:
    // Error: `sidePanel.open()` may only be called in response to a user gesture.
    await chrome.sidePanel.open({ tabId: tab.id }); // might throw exception
    await setActiveTab(tab.id);

    // ATTN
    // When the action button is clicked, Chrome security gives us at most 3 seconds
    // to start listening to the audio because it has to be a direct result of
    // a user action.

    // Step 1: Get permissions for the microphone. This will get an exception if it's not http* or file
    // but we just checked for that above.
    console.debug("BACKGROUND: Step 1: Get permissions for the microphone...");
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectedGetPromptPermission,
      injectImmediately: true,
    })

    // There should be exactly one result
    const { frameId, result } = injectionResults[0];
    console.debug("BACKGROUND: Permission prompt got results:", frameId, result);
    if (injectionResults[0]?.result !== "success") {
      sendDebugState("mic", "error");
      fatalError(HELP_PERMISSION_DENIED_URL, `Please allow microphone permissions so DeepSample Copilot can listen to your call. The current microphone status is: ${injectionResults[0]?.result} [Error code: MICPRO]`);
      return;
    }

    // Step 2: Start listening to the tab audio
    console.debug("BACKGROUND: Recording started at offscreen, getting tab capture stream id...");
    chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (streamId) => {
      if (chrome.runtime.lastError) {
        sendDebugState("tab", "error");
        fatalError(HELP_IN_PROGRESS_URL, `A prior session may still be active. Please close this tab and try again, leaving DeepSample up as long as your call center tab is up. The specific error is: ${chrome.runtime.lastError.message} [TABCAP]`);
        return;
      }
      console.debug("BACKGROUND: Got streamId", streamId)
      console.debug("BACKGROUND: Start listening...");
      sendMessageToOffscreenDocument("START_LISTENING", { tabId: tab.id, tabStreamId: streamId });

      // Step 3: Begin transcription
      // Note: This has to happen within 3 seconds of the user action or Deepgram will fail to get
      // any data, presumably because of a Chrome security rule.
      // However, we can't do it immediately because the user info has to be sent to the offscreen doc
      // so we can pass it to Deepgram when opening the connection. So this is kind of a hack but it
      // works. As long as we don't wait too long, we might have the user info, and if we don't, then
      // the user will just be undefined which is no big deal.
      setTimeout(() => {
        console.debug("BACKGROUND: Starting transcription...");
        sendMessageToOffscreenDocument("START_TRANSCRIPT", { tabId: tab.id });
      }, 1000); // Delay for 1000 milliseconds (1 second)
    });

  } catch (error) {
    sendDebugState("mic", "error");
    sendDebugState("tab", "error");
    fatalError(HELP_ERROR_URL, `An error occurred in DeepSample Copilot. If the problem persists, please report this message to DeepSample support: ${error.message} [ACLICK]`);
  }
});

/**
 * Injected function to get microphone permissions.
 * This runs in the context of the active tab.
 */
function injectedGetPromptPermission() {
  console.debug("INJECT: Injected function running...");
  return new Promise((resolve, reject) => {
    // Check for mic permissions. If not found, prompt
    console.debug("INJECT: Checking microphone permissions...");
    chrome.runtime.sendMessage({
      message: {
        type: "CHECK_PERMISSIONS",
        target: "offscreen",
        // No data needed for this message
      }
    }).then((response) => {
      console.debug("INJECT: Response from offscreen:", response);
      if (response?.message?.status === "success") {
        resolve("success");
      }
      if (chrome.runtime.lastError) {
        console.error("INJECT: Error sending message to offscreen:", chrome.runtime.lastError.message);
        resolve(chrome.runtime.lastError.message);
      }

      // If we get here, we need to prompt for permissions
      console.debug("INJECT: Prompting microphone permissions...")
      const iframe = document.createElement("iframe");
      iframe.setAttribute("hidden", "hidden");
      iframe.setAttribute("allow", "microphone");
      iframe.setAttribute("id", "PERMISSION_IFRAME_ID");
      iframe.src = chrome.runtime.getURL("requestPermissions.html");
      document.body.appendChild(iframe);
      window.addEventListener("message", (event) => {
        if (event?.data?.type) {
          // if (event.source === iframe.contentWindow && event.data) {
          document.body.removeChild(iframe);
          if (event.data.type === "permissionsGranted") {
            console.debug("INJECT: Microphone permissions granted");
            resolve("success");
          } else {
            console.debug("INJECT: Microphone permissions denied")
            resolve(event.data.type);
          }
        }
      });
    });
  });
}

/**
 * Send the sidepanel a message to close itself, and stop all processes.
 * This can result in things being cleaned up twice, but it should be harmless.
 * I did this just to make double-sure things were cleaned up because of a few corner cases.
 */
async function closeSidepanelSafely() {
  await sendMessageToSidepanel("CLOSE_YOURSELF", {});
  await clearActiveTab();
  await sendMessageToOffscreenDocument("STOP_AI", {});
  await sendMessageToOffscreenDocument("STOP_TRANSCRIPT", {});
  await sendMessageToOffscreenDocument("STOP_LISTENING", {});
}

// These functions handle the active tab saving and retrieval. The cache is needed because the
// action click handler doesn't have time to do await before the sidepanel opens (boo Chrome security).
async function initActiveTabCache() {
  activeTab = await chrome.storage.local.get(ACTIVE_TAB_KEY);
}
async function clearActiveTab() {
  activeTab = {};
  return chrome.storage.local.remove(ACTIVE_TAB_KEY);
}
async function setActiveTab(tabId) {
  activeTab = { [ACTIVE_TAB_KEY]: tabId };
  return chrome.storage.local.set(activeTab);
}
function getActiveTab() {
  return activeTab?.[ACTIVE_TAB_KEY];
}
function hasActiveTab() {
  return !!getActiveTab();
}

/**
 * Handle an error and give the user some guidance.
 */
function fatalError(url, message) {
  console.error(`BACKGROUND: ${message}`);
  setTimeout(() => {
    // Delay to let the offscreen doc come up, otherwise it won't get the message
    closeSidepanelSafely();
    showHelpTab(url);
    // sendMessageToOffscreenDocument("SHOW_ERROR_OFFSCREEN", { error: message });
  }, 500);
}

/**
 * Sends a message to the offscreen document.
 * @param {string} type - The type of the message.
 * @param {Object} data - The data to be sent with the message.
 */
async function sendMessageToOffscreenDocument(type, data) {
  // Create an offscreen document if one doesn't exist yet
  await createOffscreenDocument();
  // Now that we have an offscreen document, we can dispatch the message.
  console.debug("BACKGROUND: Sending message to offscreen:", type, data)
  const response = await chrome.runtime.sendMessage({
    message: {
      type: type,
      target: "offscreen",
      data: data
    }
  });
  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }
  console.debug("BACKGROUND: Response from offscreen:", response);
  return response;
}

async function sendMessageToSidepanel(type, data) {
  console.debug("BACKGROUND: Sending message to sidepanel:", type, data);
  const response = await chrome.runtime.sendMessage({
    message: {
      type: type,
      target: "sidepanel",
      data: data
    }
  });
  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }
  console.debug("BACKGROUND: Response from sidepanel:", response);
  return response;
};

async function sendDebugState(key, value) {
  console.debug("BACKGROUND: Sending message to debug panel:", key, value);

  // Validate key and value (make sure it matches types/index.ts)
  if (!["tab", "mic", "stt", "ai"].includes(key)) {
    console.error("BACKGROUND: Invalid key for debug state:", key);
    return;
  }
  if (!["default", "off", "on", "active", "warn", "error"].includes(value)) {
    console.error("BACKGROUND: Invalid value for debug state:", value);
    return;
  }

  chrome?.runtime?.sendMessage({
    message: {
      type: "DEBUG_STATE",
      target: "debug",
      data: { key, value }
    }
  },
    (_response) => { // underscore means it's unused
      if (chrome.runtime.lastError) {
        // Make this a log because it's quite common
        console.debug("BACKGROUND: Error sending debug state to debug panel:", chrome.runtime.lastError.message);
        return;
      }
      // console.debug("BACKGROUND: Response from debug panel:", response);
    });
};

/**
 * Installs the offscreen document if it's not already installed. 
 * @returns {Promise<void>} - Promise that resolves when the offscreen document is installed
 */
async function createOffscreenDocument() {
  console.debug('BACKGROUND: Installing Offscreen document...');
  try {
    if (await chrome.offscreen.hasDocument()) {
      console.debug('BACKGROUND: Offscreen document already exists');
    } else {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.USER_MEDIA],
        justification: "To interact with user media"
      });
    }
  } catch (error) {
    // Make it a log because this is quite common
    console.debug("BACKGROUND: Error creating offscreen document:", error);
  }
}

/**
 * Gets information about the browser and device in a URL search parameter
 * format. Note: There is similar code in DeepSampleUI.tsx or offscreen.js.
 * @returns {Promise<string>} - Promise that resolves to string with information about the environment.
 */
async function getEnvironmentInfo() {
  const manifest = chrome.runtime.getManifest();
  console.debug("BACKGROUND: manifest", manifest);

  // Get info about the platform
  const platformInfo = await chrome.runtime.getPlatformInfo();
  console.debug("BACKGROUND: platformInfo", platformInfo);

  // Get info about the browser
  console.debug("BACKGROUND: navigator", navigator);

  // Get info from the user agent
  const uaParser = new UAParser(navigator?.userAgent);
  const uaInfo = uaParser.getResult();
  console.debug("BACKGROUND: uaInfo", uaInfo);

  // Put it all together
  const params = new URLSearchParams({
    version: manifest?.version,
    language: navigator?.language,
    os: uaInfo?.os?.name,
    browser: uaInfo?.browser?.name,
    platform: platformInfo?.os
  });

  const result = params.toString();
  console.debug("BACKGROUND: Environment info:", result);
  return result;
}

/**
 * Shows a help page in a new tab.
 * @param {string} url - The URL of the help tab.
 */
async function showHelpTab(url) {
  console.debug("BACKGROUND: Opening help tab...");
  // const info = await getEnvironmentInfo();
  // const externalUrl = `${url}?${info}`;
  // const tab = await chrome.tabs.create({ url: externalUrl });
  // console.debug("BACKGROUND: Help tab", tab.id, "launched with", externalUrl);
}
