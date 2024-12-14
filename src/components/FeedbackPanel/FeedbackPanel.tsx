/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { Button } from "../Button";
import { PanelBar } from "../PanelBar";
import { Stars } from "../Stars";
import "./style.css";

interface Props {
  className: any;
  numStars?: number;
  maxStars?: number;
  onSubmit?: () => void;
  feedbackText?: string;
  title: string;
  tooltipText: string;
  description: string;
}

export const FeedbackPanel = ({
  className,
  numStars = 0,
  maxStars = 5,
  onSubmit,
  feedbackText,
  title = "Placeholder title",
  tooltipText = "Placeholder tooltip text.",
  description = "Placeholder description.",
}: Props): JSX.Element => {
  return (
    <div className={`feedback-panel ${className}`}>
      <PanelBar
        title={title}
        tooltipText={tooltipText}
      />
      <div className="frame-wrapper">
        <div className="frame-3">
          <Stars
            className="stars-instance"
            numStars={numStars}
            maxStars={maxStars}
            onSubmit={(star: number) => console.debug("Clicked on star", star)}
          />
          <div className="feedback-text">
            <p className="text-wrapper-4">{description}</p>
            <div className="text-field-wrapper">
              <textarea
                className="input-text"
                placeholder="Write your feedback here."
                defaultValue={feedbackText}
              />
            </div>
          </div>
          <Button className="button-3" labelText="Submit" onClick={onSubmit} />
        </div>
      </div>
    </div>
  );
};
