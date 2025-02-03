import { Component } from "./Simulation";
import typedDnd from "./typedDnd";

export type DragData =
  | { type: "input" }
  | { type: "output" }
  | { type: "chip"; component: Component };

export type DropData = { noDrop: boolean };

export const sidebarDnd = typedDnd<DragData, DropData>();
