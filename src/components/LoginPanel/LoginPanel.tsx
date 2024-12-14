/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { Button } from "../Button";
import "./style.css";

interface Props {
  className: any;
  inputType?: string;
  onSubmit?: () => void;
  title: string;
}

export const LoginPanel = ({ className, inputType = "email", onSubmit, title }: Props): JSX.Element => {
  return (
    <div className={`login-panel ${className}`}>
      <div className="deepsample-login-content">
        <div className="title">
          <div className="text-wrapper">{title}</div>
        </div>
        <div className="text-wrapper-2">Sign in to DeepSample</div>
        <div className="inputs-and-button">
          <div className="input-fields">
            {/* ANIMA this was second */}
            <div className="text-field">
              <div className="state-layer-wrapper">
                <div className="content-wrapper">
                  <div className="content">
                    <input className="input-text-wrapper" placeholder="Email" type={inputType} />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-field">
              <div className="state-layer-wrapper">
                <div className="content-wrapper">
                  <div className="content">
                    <input className="input-text-wrapper" placeholder="Password" type="password" />
                    {/* ANIMA <div className="input-text">
                      <div className="input-text-2">Password</div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-wrapper-3">Forgot Password?</div>
          </div>
          <Button
            className="button-instance"
            labelText="Sign In"
            onClick={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

LoginPanel.propTypes = {
  inputType: PropTypes.string,
};
