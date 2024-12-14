/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

interface Props {
  color: string;
  className: any;
}

export const Size201 = ({ color = "#1E1E1E", className }: Props): JSX.Element => {
  return (
    <svg
      className={`size-20-1 ${className}`}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M9.99996 1.66666L12.575 6.88333L18.3333 7.725L14.1666 11.7833L15.15 17.5167L9.99996 14.8083L4.84996 17.5167L5.83329 11.7833L1.66663 7.725L7.42496 6.88333L9.99996 1.66666Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

Size201.propTypes = {
  color: PropTypes.string,
};
