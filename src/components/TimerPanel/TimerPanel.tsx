/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { Button } from "../Button";
import { PanelBar } from "../PanelBar";
import "./style.css";

interface Props {
  time: number; // seconds
  recording?: boolean;
  className: any;
  panelBarInfoButtonVariantPrimaryWrapperIcon?: JSX.Element;
  onStartStop?: React.MouseEventHandler;
  title: string;
  tooltipText: string;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export const TimerPanel = ({
  time = 0,
  className,
  onStartStop,
  recording = false,
  title = "Placeholder title",
  tooltipText = "Placeholder tooltip text.",
}: Props): JSX.Element => {
  return (
    <div className={`timer-panel ${className}`}>
      <PanelBar
        className="panel-bar-instance"
        title={title}
        tooltipText={tooltipText}
      />
      <div className="timer-row">
        <div className="timer">{formatTime(time)}</div>
        <Button className={`listen-button ${className} ${recording ? "recording" : "not-recording"}`}
          labelText={recording ? "Stop Listening" : "Start Listening"}
          onClick={onStartStop}
        />
      </div>
    </div>
  );
};
