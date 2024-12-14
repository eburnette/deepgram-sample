/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { Close } from "../../icons/Close";
import { Icon147 } from "../../icons/Icon147";
import { IconButton } from "../IconButton";
import "./style.css";

interface Props {
  className: any;
  iconButtonIcon: JSX.Element;
  override: JSX.Element;
  title: string;
}

export const Header = ({
  className,
  title = "Replace with Title",
  iconButtonIcon = <Icon147 className="icon-instance-node" />,
  override = <Close className="icon-instance-node" color="white" />,
}: Props): JSX.Element => {
  return (
    <div className={`header ${className}`}>
      <div className="top-app-bar">
        <div className="headline">{title}</div>
        <div className="trailing-icon">
          <IconButton icon={iconButtonIcon} stateProp="enabled" style="standard" />
          <IconButton icon={override} stateProp="enabled" style="standard" />
        </div>
      </div>
    </div>
  );
};
