import type { Node } from "@xyflow/react";

export type InputNodeData = {
    state: boolean;
};

export type InputNode = Node<InputNodeData, "input">;

export type AndNodeData = {
    state: boolean;
};

export type AndNode = Node<AndNodeData, "and">;

export type OutputNodeData = {};

export type OutputNode = Node<OutputNodeData, "output">;

export type CustomNodes = InputNode | AndNode | OutputNode;

export type NodeType = "input" | "and" | "output";

export function isInputNode(node: any): node is InputNode | AndNode {
    return !node ? false : node.type === "input" || node.type === "and"
}