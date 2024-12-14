/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { StarButton } from "../StarButton";
import "./style.css";

interface Props {
  className: any;
  numStars?: number;
  maxStars?: number;
  onSubmit?: (star: number) => void;
}

export const Stars = ({ className, numStars = 3, maxStars = 10, onSubmit }: Props): JSX.Element => {
  return (
    <div className={`stars ${className}`}>
      <div className="frame-2">
        {Array.from({ length: maxStars }, (_, index) => (
          <StarButton
            key={index}
            className={`star-instance `}
            highlighted={index < numStars}
            onClick={() => onSubmit(index)}
          />
        ))}
      </div>
    </div>
  );
};
