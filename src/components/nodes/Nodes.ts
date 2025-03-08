import type { Node } from "@xyflow/react";
import { Bit, ID } from "@/Simulation";
import { HslColor } from "colord";
import { ReactNode } from "react";

export type InputNodeData = {
  name: string;
  state: Bit;
  id: number;
};

export type InputNode = Node<InputNodeData, "input">;

export type ChipNodeData = {
  name: string;
  color: HslColor;
  inputs: Bit[];
  outputs: Bit[];
  inputNames: (string | undefined)[];
  outputNames: (string | undefined)[];
  inputIDs: ID[];
  outputIDs: ID[];
  render?: (input: Bit[]) => ReactNode;
  id: ID; // compIO index in parent circuit's components array
};

export type ChipNode = Node<ChipNodeData, "chip">;

export type OutputNodeData = {
  name: string;
  state: Bit;
  id: number;
};

export type OutputNode = Node<OutputNodeData, "output">;

export type CustomNodes = InputNode | ChipNode | OutputNode;

export type NodeType = "input" | "chip" | "output";

export function isInputNode(node: any): node is InputNode {
  return !node ? false : node.type === "input";
}

export function isChipNode(node: any): node is ChipNode {
  return !node ? false : node.type === "chip";
}

export function isOutputNode(node: any): node is OutputNode {
  return !node ? false : node.type === "output";
}
