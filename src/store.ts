import { create } from "zustand";
import { Bit, Circuit, CompIO, nand } from "./Simulation";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import {
  CustomNodes,
  InputNodeData,
  isChipNode,
  isInputNode,
  isOutputNode,
} from "./Nodes";
import WireEdge from "./WireEdge";
import { circuitToFlow } from "./transform";

export interface SimulationStore {
  circuit: Circuit;
  setCircuit: (newCircuit: Circuit) => void;
  updateCircuit: (input: Bit[]) => void;
  nodes: CustomNodes[];
  edges: WireEdge[];
  onNodesChange: OnNodesChange<CustomNodes>;
  onEdgesChange: OnEdgesChange<WireEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: CustomNodes[]) => void;
  setEdges: (edges: WireEdge[]) => void;
}

const nand_a = new CompIO({
  name: "nand",
  numInputs: 2,
  numOutputs: 1,
  update: nand,
}); // c_id: 0

nand_a.add_connection(0, { componentIndex: 0, inputIndex: 1 }); // nand_a -> nand_a

const initialCircuit = new Circuit("nand short", 1, 1, [nand_a]);
initialCircuit.connectInputPin(0, 0, 0); // input 0 -> nand_a
initialCircuit.connectOutputPin(0, 0, 0); // nand_a -> output 0

const { nodes: initialNodes, edges: initialEdges } =
  circuitToFlow(initialCircuit);

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  circuit: initialCircuit,
  setCircuit: (newCircuit: Circuit) => set({ circuit: newCircuit }),
  updateCircuit: (input: Bit[]) => {
    get().circuit.update(input);
    const { nodes, edges } = circuitToFlow(get().circuit);
    set({ nodes, edges });
  },
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes) => {
    for (const change of changes) {
      if (change.type === "replace") {
        const node = get().nodes.find((node) => node.id === change.id);
        if (isInputNode(node)) {
          get().circuit.inputPins[node.data.index].value = (
            change.item.data as InputNodeData
          ).state;
        }
      } else if (change.type === "position") {
        const node = get().nodes.find((node) => node.id === change.id)!;
        if (isInputNode(node)) {
          get().circuit.inputPins[node.data.index].extraProperties.position =
            change.position;
        } else if (isOutputNode(node)) {
          get().circuit.outputPins[node.data.index].extraProperties.position =
            change.position;
        } else if (isChipNode(node)) {
          get().circuit.components[node.data.index].extraProperties.position =
            change.position;
        }
      } else if (change.type === "select") {
        const node = get().nodes.find((node) => node.id === change.id)!;
        if (isInputNode(node)) {
          get().circuit.inputPins[node.data.index].extraProperties.selected =
            change.selected;
        } else if (isOutputNode(node)) {
          get().circuit.outputPins[node.data.index].extraProperties.selected =
            change.selected;
        } else if (isChipNode(node)) {
          get().circuit.components[node.data.index].extraProperties.selected =
            change.selected;
        }
      } else if (change.type === "remove") {
        const node = get().nodes.find((node) => node.id === change.id)!;
        if (isInputNode(node)) {
          get().circuit.removeInputPin(node.data.index);
        } else if (isOutputNode(node)) {
          get().circuit.removeOutputPin(node.data.index);
        } else if (isChipNode(node)) {
          get().circuit.removeComponent(node.data.index);
        }
      }
    }
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
}));
