import type { Node } from "@xyflow/react";

export type InputNodeData = {
    state: boolean;
};

export type InputNode = Node<InputNodeData, "input">;

export type OutputNodeData = {};

export type OutputNode = Node<OutputNodeData, "output">;

export type CustomNodes = InputNode | OutputNode;

export type NodeType = "input" | "logic" | "output";

export function isInputNode(node: any): node is InputNode {
    return !node ? false : node.type === "input"
}