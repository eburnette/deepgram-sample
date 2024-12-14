/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
}

export const Check = ({ className }: Props): JSX.Element => {
  return (
    <svg
      className={`check ${className}`}
      fill="none"
      height="25"
      viewBox="0 0 25 25"
      width="25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M9.07818 16.3105L4.87196 12.1042L3.43962 13.5265L9.07818 19.165L21.1824 7.0608L19.7602 5.63855L9.07818 16.3105Z"
      />
    </svg>
  );
};
