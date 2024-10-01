import React, { ReactNode, useEffect } from "react";
import { Breakpoint, Grid2, GridSpacing } from "@mui/material";

type ResponsiveStyleValue<T> =
  | T
  | Array<T | null>
  | {
      [key in Breakpoint]?: T | null;
    };

export type SplitViewProps = {
  left: ReactNode;
  right: React.ReactNode;
  spacing?: ResponsiveStyleValue<GridSpacing>;
};

const SplitView = React.memo(({ left, right, spacing = 2 }: SplitViewProps) => {
  return (
    <Grid2 container={true} spacing={spacing}>
      <Grid2 size={{ xs: 12, md: 6 }}>{left}</Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>{right}</Grid2>
    </Grid2>
  );
});
SplitView.displayName = "SplitView";

export default SplitView;
