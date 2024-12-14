import PropTypes from "prop-types";
import React from "react";
import { PanelBar } from "../PanelBar";
// import { Circle } from "../../icons/Circle";
import "./style.css";
import { useEffect, useState } from "react";
import { DebugState } from "../../types";

interface Props {
  className: any;
  title: string;
  tooltipText: string;
}

export const DebugPanel = ({
  className,
  title = "Placeholder title",
  tooltipText = "Placeholder tooltip text.",
}: Props): JSX.Element => {
  const [micState, setMicState] = useState<DebugState>("default");
  const [tabSoundState, setTabSoundState] = useState<DebugState>("default");
  const [sttState, setSttState] = useState<DebugState>("default");
  const [aiState, setAIState] = useState<DebugState>("default");

  useEffect(() => {
    console.debug("DEBUG: Hello from Debug panel");

    const handleMessage = (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      // Ignore messages that are not for the debug panel
      if (request?.message?.target != "debug") {
        return;
      }
      // console.debug("DEBUG: Received message", request);
      switch (request?.message?.type) {
        case "DEBUG_STATE":
          // Message is like this:
          // { message: { type: "DEBUG_STATE", data: { key: "mic", value: "on" } } }
          console.debug("DEBUG: Received DEBUG_STATE", request?.message?.data?.key, request?.message?.data?.value);
          switch (request?.message?.data?.key) {
            case "mic":
              setMicState(request?.message?.data?.value);
              break;
            case "tab":
              setTabSoundState(request?.message?.data?.value);
              break;
            case "stt":
              setSttState(request?.message?.data?.value);
              break;
            case "ai":
              setAIState(request?.message?.data?.value);
              break;
            default:
              console.error(`DEBUG: Unknown key: ${request?.message?.data?.key}`);
              break;
          }
          break;

        // Add others here as needed
      }

      // Send a response back to the sender
      sendResponse({}); // Send an empty response
    }
    chrome?.runtime?.onMessage?.addListener(handleMessage);

    // Return a cleanup function that removes the listener
    return () => {
      chrome?.runtime?.onMessage?.removeListener(handleMessage);
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <div className={`debug-panel ${className}`}>
      <PanelBar
        className="panel-bar-3"
        title={title}
        tooltipText={tooltipText}
      />
      <div className="div">
        <div className="group">
          <div className="item">
            <div className={`ellipse ${micState}`} />
            <div className="text-wrapper">Microphone</div>

          </div>
          <div className="item">
            <div className={`ellipse ${tabSoundState}`} />
            <div className="text-wrapper">Tab Sound</div>

          </div>
          <div className="item">
            <div className={`ellipse ${sttState}`} />
            <div className="text-wrapper">Speech-to-Text</div>

          </div>
          <div className="item">
            <div className={`ellipse ${aiState}`} />
            <div className="text-wrapper">AI Model</div>
          </div>
        </div>
      </div>
      {/* <div className="debug-area">
        <div className="debug-item">
          <Circle className="debug-circle red" />
          <p className="debug-text">Microphone</p>
        </div>
      </div>
      <div className="debug-area">
        <div className="debug-item">
          <Circle className="debug-circle red" />
          <p className="debug-text">Microphone</p>
        </div>
      </div> */}
    </div>
  );
};