/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { Info9 } from "../../icons/Info9";
import { PlainTooltip } from "../PlainTooltip";
import { VariantPrimaryWrapper } from "../VariantPrimaryWrapper";
import "./style.css";

interface Props {
  tooltipVisible?: boolean;
  className: any;
  overlapGroupClassName?: any;
  plainTooltipSupportingText?: string;
  variantPrimaryWrapperIcon?: JSX.Element;
}

export const InfoButton = ({
  tooltipVisible = false,
  className,
  overlapGroupClassName,
  plainTooltipSupportingText = "Supporting text",
  variantPrimaryWrapperIcon = <Info9 className="info" color="#757575" />,
}: Props): JSX.Element => {
  return (
    <div className={`info-button ${className}`}>
      <div className={`overlap-group ${overlapGroupClassName}`}>
        {tooltipVisible && (
          <PlainTooltip
            className="plain-tooltip-instance"
            supportingText={plainTooltipSupportingText}
            type="multi-line"
          />
        )}

        <VariantPrimaryWrapper
          className="icon-button-instance"
          icon={variantPrimaryWrapperIcon}
          size="small"
          stateProp="default"
          variant="subtle"
        />
      </div>
    </div>
  );
};

InfoButton.propTypes = {
  tooltipVisible: PropTypes.bool,
  plainTooltipSupportingText: PropTypes.string,
};
