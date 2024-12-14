/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { PanelBar } from "../PanelBar";
import "./style.css";

interface Props {
  className: any;
  transcript: string;
  title: string;
  tooltipText: string;
}

export const TranscriptionPanel = ({
  className,
  transcript,
  title = "Placeholder title",
  tooltipText = "Placeholder tooltip text.",
}: Props): JSX.Element => {
  return (
    <div className={`transcription-panel ${className}`}>
      <PanelBar
        className="panel-bar-3"
        title={title}
        tooltipText={tooltipText}
      />
      <div className="transcription">
        {transcript && transcript.length > 0 ? (
          transcript
        ) : (
          <div className="no-transcription">No transcription</div>
        )}
      </div>
    </div>
  );
};