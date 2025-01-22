import { Component } from "./Simulation";
import typedDnd from "./typedDnd";

export type DragData = {
  component: Component;
};

export type DropData = {};

export const sidebarDnd = typedDnd<DragData, DropData>();
