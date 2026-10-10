"use client";

import type { ReactElement } from "react";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";

export function Tip({ title, children, placement = "top" }: { title: string; children: ReactElement; placement?: TooltipProps["placement"] }) {
  return <Tooltip title={title} arrow enterDelay={700} placement={placement}>{children}</Tooltip>;
}
