import React, { useMemo } from "react";
import { Link, Tooltip } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

export type HelpIconProps = {
  href?: string;
  icon?: React.ReactElement;
  tooltip?: string;
};

const HelpIcon = ({ href, icon, tooltip }: HelpIconProps) => {
  const iconNode = useMemo(() => icon || <InfoOutlined />, [icon]);
  if (!tooltip && !href) return iconNode;

  return tooltip && !href ? (
    <Tooltip title={tooltip} style={{ display: "flex" }}>
      {iconNode}
    </Tooltip>
  ) : !tooltip && href ? (
    <Link target={"_blank"} rel={"noopener"} href={href} display={"flex"}>
      {iconNode}
    </Link>
  ) : (
    <Tooltip title={tooltip}>
      <Link target={"_blank"} rel={"noopener"} href={href} display={"flex"}>
        {iconNode}
      </Link>
    </Tooltip>
  );
};

export default HelpIcon;
