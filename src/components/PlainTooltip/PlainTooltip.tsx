/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  supportingText: string;
  type: "multi-line" | "single-line";
  className: any;
}

export const PlainTooltip = ({ supportingText = "Supporting text", type, className }: Props): JSX.Element => {
  return (
    <div className={`plain-tooltip ${type} ${className}`}>
      <div className="supporting-text">{supportingText}</div>
    </div>
  );
};

PlainTooltip.propTypes = {
  supportingText: PropTypes.string,
  type: PropTypes.oneOf(["multi-line", "single-line"]),
};
