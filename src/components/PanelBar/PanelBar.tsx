/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { InfoButton } from "../InfoButton";
import "./style.css";

interface Props {
  title: string;
  className?: any;
  tooltipText: string;
}

export const PanelBar = ({
  title = "Replace with Title",
  className,
  tooltipText = "Supporting text"
}: Props): JSX.Element => {
  return (
    <div className={`panel-bar ${className}`}>
      <div className="frame">
        <div className="title-and-button">
          <div className="replace-with-title">{title}</div>
          <InfoButton
            className="info-button-instance"
          />
        </div>
        <div className="divider" />
      </div>
    </div>
  );
};
