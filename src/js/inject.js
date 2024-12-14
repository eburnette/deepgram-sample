/**
 * This file is injected into the target web page to handle microphone permissions.
 */

/**
 * Listener for messages from the background script.
 * @param {Object} request - The message request.
 * @param {Object} sender - The sender of the message.
 * @param {function} sendResponse - Callback function to send a response.
 * @returns {boolean} - Whether the response should be sent asynchronously (true by default).
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ignore messages not meant for the content script
  if (request?.message?.target != "content") {
    return;
  }

  switch (request?.message?.type) {
    case "PROMPT_PERMISSION":
      console.debug("INJECT: Received PROMPT_PERMISSION...")
      // Check for mic permissions. If not found, prompt
      checkMicPermissions()
        .then(() => {
          sendResponse({ message: { status: "success" } });
        })
        .catch(() => {
          console.debug("INJECT: Prompting microphone permissions...")
          promptMicPermissions();
          const iframe = document.getElementById("PERMISSION_IFRAME_ID");
          window.addEventListener("message", (event) => {
            if (event?.data?.type) {
              // if (event.source === iframe.contentWindow && event.data) {
              if (event.data.type === "permissionsGranted") {
                console.debug("INJECT: Microphone permissions granted");
                sendResponse({ message: { status: "success" } });

              } else {
                console.debug("INJECT: Microphone permissions denied")
                sendResponse({ message: { status: "failure" } });
              }
              document.body.removeChild(iframe);
            }
          });
        });
      return true; // expect async response

    default:
      console.error("INJECT: Invalid message type:", request?.message?.type);
      sendResponse({});
      break;
  }
});

/**
 * Checks microphone permissions using a message to the background script.
 * @returns {Promise<void>} - Promise that resolves if permissions are granted, rejects otherwise.
 */
function checkMicPermissions() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        message: {
          type: "CHECK_PERMISSIONS",
          target: "offscreen",
          // No data needed for this message
        }
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("INJECT: Error sending message to offscreen:", chrome.runtime.lastError.message);
          return;
        }
        console.debug("INJECT: Response from offscreen:", response);
        if (response?.message?.status === "success") {
          resolve();
        } else {
          reject(response?.message?.data);
        }
      }
    );
  });
}

/**
 * Prompts the user for microphone permissions using an iframe.
 */
function promptMicPermissions() {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("hidden", "hidden");
  iframe.setAttribute("allow", "microphone");
  iframe.setAttribute("id", "PERMISSION_IFRAME_ID");
  iframe.src = chrome.runtime.getURL("requestPermissions.html");
  document.body.appendChild(iframe);
}
