/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  text: React.ReactNode;
  className: any;
  divClassName: any;
}

export const Footer = ({ text = "Replace with footer text", className, divClassName }: Props): JSX.Element => {
  return (
    <div className={`footer ${className}`}>
      <div className={`replace-with-footer ${divClassName}`}>{text}</div>
    </div>
  );
};

Footer.propTypes = {
  text: PropTypes.node,
};
