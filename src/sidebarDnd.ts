import { ReactNode } from "react";
import { Component } from "./Simulation";
import typedDnd from "./typedDnd";

export type ComponentDragData =
  | { type: "input" }
  | { type: "output" }
  | { type: "chip"; component: Component };

export type DragOverlayData = {
  dragOverlay: ReactNode;
};

export type DragData = ComponentDragData & DragOverlayData;

export type DropData = { noDrop: boolean };

export const sidebarDnd = typedDnd<DragData, DropData, DragData & DropData>();
