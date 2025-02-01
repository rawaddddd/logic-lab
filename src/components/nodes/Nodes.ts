import type { Node } from "@xyflow/react";
import { Bit } from "@/Simulation";

export type InputNodeData = {
  state: Bit;
  id: number;
};

export type InputNode = Node<InputNodeData, "input">;

export type ChipNodeData = {
  name: string;
  inputs: Bit[];
  outputs: Bit[];
  id: number; // compIO index in parent circuit's components array
};

export type ChipNode = Node<ChipNodeData, "chip">;

export type OutputNodeData = {
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
