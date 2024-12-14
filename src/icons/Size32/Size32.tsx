/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
}

export const Size32 = ({ className }: Props): JSX.Element => {
  return (
    <svg
      className={`size-32 ${className}`}
      fill="none"
      height="32"
      viewBox="0 0 32 32"
      width="32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M16 21.3334V16.0001M16 10.6667H16.0133M29.3333 16.0001C29.3333 23.3639 23.3638 29.3334 16 29.3334C8.63619 29.3334 2.66666 23.3639 2.66666 16.0001C2.66666 8.63628 8.63619 2.66675 16 2.66675C23.3638 2.66675 29.3333 8.63628 29.3333 16.0001Z"
        stroke="#1E1E1E"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
};
