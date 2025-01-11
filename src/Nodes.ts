import type { Node } from "@xyflow/react";

export type InputNodeData = {
    state: boolean;
};

export type InputNode = Node<InputNodeData, "input">;

export type AndNodeData = {
    state: boolean;
};

export type AndNode = Node<AndNodeData, "and">;

export type OrNodeData = {
    state: boolean;
};

export type OrNode = Node<AndNodeData, "or">;

export type OutputNodeData = {};

export type OutputNode = Node<OutputNodeData, "output">;

export type CustomNodes = InputNode | AndNode | OrNode | OutputNode;

export type NodeType = "input" | "and" | "or" | "output";

export function isInputNode(node: any): node is InputNode | AndNode | OrNode {
    return !node ? false : node.type === "input" || node.type === "and" || node.type === "or"
}