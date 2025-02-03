import { create } from "zustand";
import { Bit, Circuit, CompIO, Component, nandGateChip } from "./Simulation";
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
  OutputNodeData,
} from "./components/nodes/Nodes";
import WireEdge from "./components/nodes/WireEdge";
import { circuitToFlow } from "./transform";
import { DragData } from "./sidebarDnd";
import clone from "clone";

export interface SimulationStore {
  circuit: Circuit;
  setCircuit: (newCircuit: Circuit) => void;
  updateCircuit: (input: Bit[]) => void;
  createChip: (name: string) => void;
  customChips: Component[];
  onDropChip: (dragData: DragData, position: { x: number; y: number }) => void;
  nodes: CustomNodes[];
  edges: WireEdge[];
  onNodesChange: OnNodesChange<CustomNodes>;
  onEdgesChange: OnEdgesChange<WireEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: CustomNodes[]) => void;
  setEdges: (edges: WireEdge[]) => void;
}

const nand_a = new CompIO(nandGateChip); // c_id: 0

nand_a.add_connection(0, { componentId: 0, inputIndex: 1 }); // nand_a -> nand_a

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
    // const { nodes, edges } = circuitToFlow(get().circuit);
    // set({ nodes, edges });
    set({
      nodes: get().nodes.map((node) => {
        if (node.type === "chip") {
          const component = get().circuit.getComponent(node.data.id);
          if (component === undefined) {
            console.warn(
              `Component exists in UI but not in simulation. ID: ${node.data.id}`
            );
            return node;
          }
          if (
            node.data.inputs !== component.inputs ||
            node.data.outputs !== component.outputs
          ) {
            return {
              ...node,
              data: {
                ...node.data,
                inputs: component.inputs,
                outputs: component.outputs,
              },
            };
          }
        } else if (node.type === "input") {
          const inputPin = get().circuit.getInputPin(node.data.id);
          if (inputPin === undefined) {
            console.warn(
              `Input pin exists in UI but not in simulation. ID: ${node.data.id}`
            );
            return node;
          }
          if (node.data.state !== inputPin.value) {
            return {
              ...node,
              data: {
                ...node.data,
                state: inputPin.value,
              },
            };
          }
        } else if (node.type === "output") {
          const outputPin = get().circuit.getOutputPin(node.data.id);
          if (outputPin === undefined) {
            console.warn(
              `Output pin exists in UI but not in simulation. ID: ${node.data.id}`
            );
            return node;
          }
          if (node.data.state !== outputPin.value) {
            return {
              ...node,
              data: {
                ...node.data,
                state: outputPin.value,
              },
            };
          }
        }
        return node;
      }),
    });
  },
  createChip: (name: string) => {
    get().circuit.inputPins.sort(
      (a, b) =>
        (a.extraProperties.position?.y ?? Number.MAX_SAFE_INTEGER) -
        (b.extraProperties.position?.y ?? Number.MAX_SAFE_INTEGER)
    );
    get().circuit.reconstructInputIds();
    get().circuit.outputPins.sort(
      (a, b) =>
        (a.extraProperties.position?.y ?? Number.MAX_SAFE_INTEGER) -
        (b.extraProperties.position?.y ?? Number.MAX_SAFE_INTEGER)
    );
    get().circuit.reconstructOutputIds();

    const circuit = new Circuit("Circuit", 0, 0, []);
    get().circuit.name = name;
    set((state) => ({
      customChips: [...state.customChips, get().circuit],
    }));
    const { nodes, edges } = circuitToFlow(circuit);
    set({ circuit, nodes, edges });
  },
  customChips: [],
  onDropChip: (dragData: DragData, position: { x: number; y: number }) => {
    if (dragData.type === "input") {
      const id = get().circuit.addInputPin({
        connections: [],
        value: undefined,
        extraProperties: { position, name: "" },
      });
      get().circuit.getInputPin(id)!.extraProperties.name = `Input ${id}`;
      const newNode: CustomNodes = {
        id: `input-${id}`,
        type: "input",
        position: position,
        selected: undefined,
        data: {
          name: `Input ${id}`,
          state: undefined,
          id,
        },
      };
      set((state) => ({ nodes: [...state.nodes, newNode] }));
    } else if (dragData.type === "output") {
      const id = get().circuit.addOutputPin({
        connections: [],
        value: undefined,
        extraProperties: { position, name: "" },
      });
      get().circuit.getOutputPin(id)!.extraProperties.name = `Output ${id}`;
      const newNode: CustomNodes = {
        id: `output-${id}`,
        type: "output",
        position: position,
        selected: undefined,
        data: {
          name: `Output ${id}`,
          state: undefined,
          id,
        },
      };
      set((state) => ({ nodes: [...state.nodes, newNode] }));
    } else if (dragData.type === "chip") {
      const compIO = new CompIO(clone(dragData.component));
      compIO.extraProperties.position = position;
      const id = get().circuit.addComponent(compIO);

      const newNode: CustomNodes = {
        id: `chip-${id}`,
        type: "chip",
        position: position,
        selected: undefined,
        data: {
          name: compIO.component.name,
          inputs: compIO.inputs,
          outputs: compIO.outputs,
          inputNames: compIO.component.inputNames(),
          outputNames: compIO.component.outputNames(),
          id,
        },
      };
      set((state) => ({ nodes: [...state.nodes, newNode] }));
    }
  },
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes) => {
    for (const change of changes) {
      if (change.type === "replace") {
        const node = get().nodes.find((node) => node.id === change.id);
        if (isInputNode(node)) {
          get().circuit.getInputPin(node.data.id)!.value = (
            change.item.data as InputNodeData
          ).state;
          get().circuit.getInputPin(node.data.id)!.extraProperties.name = (
            change.item.data as InputNodeData
          ).name;
        } else if (isOutputNode(node)) {
          get().circuit.getOutputPin(node.data.id)!.extraProperties.name = (
            change.item.data as OutputNodeData
          ).name;
        }
      } else if (change.type === "position") {
        const node = get().nodes.find((node) => node.id === change.id)!;
        if (isInputNode(node)) {
          get().circuit.getInputPin(node.data.id)!.extraProperties.position =
            change.position;
        } else if (isOutputNode(node)) {
          get().circuit.getOutputPin(node.data.id)!.extraProperties.position =
            change.position;
        } else if (isChipNode(node)) {
          get().circuit.getComponent(node.data.id)!.extraProperties.position =
            change.position;
        }
      } else if (change.type === "select") {
        const node = get().nodes.find((node) => node.id === change.id)!;
        if (isInputNode(node)) {
          get().circuit.getInputPin(node.data.id)!.extraProperties.selected =
            change.selected;
        } else if (isOutputNode(node)) {
          get().circuit.getOutputPin(node.data.id)!.extraProperties.selected =
            change.selected;
        } else if (isChipNode(node)) {
          get().circuit.getComponent(node.data.id)!.extraProperties.selected =
            change.selected;
        }
      } else if (change.type === "remove") {
        const node = get().nodes.find((node) => node.id === change.id)!;
        if (isInputNode(node)) {
          get().circuit.removeInputPin(node.data.id);
        } else if (isOutputNode(node)) {
          get().circuit.removeOutputPin(node.data.id);
        } else if (isChipNode(node)) {
          get().circuit.removeComponent(node.data.id);
        }
      }
    }
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    for (const change of changes) {
      if (change.type === "remove") {
        const edge = get().edges.find((edge) => edge.id === change.id);
        if (edge === undefined) continue;
        const sourceNode = get().nodes.find((node) => node.id === edge.source);
        const targetNode = get().nodes.find((node) => node.id === edge.target);
        if (isInputNode(sourceNode)) {
          if (!isChipNode(targetNode)) {
            console.warn(
              "Connecting input pin directly to output pin is not supported yet."
            );
            return;
          }
          if (edge.targetHandle == null) {
            console.warn("Target handle ID not defined.");
            return;
          }
          // TODO replace this with a more robust way to convert handle ids to indices
          // maybe by storing a map of id->index (or handle info in general) in the node
          const targetHandleIndex = Number(edge.targetHandle.split("-")[1]);
          get().circuit.disconnectInputPin(
            sourceNode.data.id,
            targetNode.data.id,
            targetHandleIndex
          );
        } else if (isChipNode(sourceNode)) {
          if (edge.sourceHandle == null) {
            console.warn("Source handle ID not defined.");
            return;
          }
          const sourceHandleIndex = Number(edge.sourceHandle.split("-")[1]);
          if (isOutputNode(targetNode)) {
            get().circuit.disconnectOutputPin(
              targetNode.data.id,
              sourceNode.data.id,
              sourceHandleIndex
            );
          } else if (isChipNode(targetNode)) {
            if (edge.targetHandle == null) {
              console.warn("Target handle ID not defined.");
              return;
            }
            const targetHandleIndex = Number(edge.targetHandle.split("-")[1]);
            get().circuit.disconnectChip(
              sourceNode.data.id,
              sourceHandleIndex,
              targetNode.data.id,
              targetHandleIndex
            );
          }
        }
      }
    }
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    const sourceNode = get().nodes.find(
      (node) => node.id === connection.source
    )!;
    const targetNode = get().nodes.find(
      (node) => node.id === connection.target
    )!;

    if (isInputNode(sourceNode)) {
      if (!isChipNode(targetNode)) {
        console.warn(
          "Connecting input pin directly to output pin is not supported yet."
        );
        return;
      }
      if (connection.targetHandle === null) {
        console.warn("Target handle ID not defined.");
        return;
      }
      // TODO replace this with a more robust way to convert handle ids to indices
      // maybe by storing a map of id->index (or handle info in general) in the node
      const targetHandleIndex = Number(connection.targetHandle.split("-")[1]);
      get().circuit.connectInputPin(
        sourceNode.data.id,
        targetNode.data.id,
        targetHandleIndex
      );
    } else if (isChipNode(sourceNode)) {
      if (connection.sourceHandle === null) {
        console.warn("Source handle ID not defined.");
        return;
      }
      const sourceHandleIndex = Number(connection.sourceHandle.split("-")[1]);
      if (isOutputNode(targetNode)) {
        get().circuit.connectOutputPin(
          targetNode.data.id,
          sourceNode.data.id,
          sourceHandleIndex
        );
      } else if (isChipNode(targetNode)) {
        if (connection.targetHandle === null) {
          console.warn("Target handle ID not defined.");
          return;
        }
        const targetHandleIndex = Number(connection.targetHandle.split("-")[1]);
        get().circuit.connectChip(
          sourceNode.data.id,
          sourceHandleIndex,
          targetNode.data.id,
          targetHandleIndex
        );
      }
    }

    set({
      edges: addEdge(
        {
          ...connection,
          data: {
            sourceHandleIndex: Number(connection.sourceHandle?.split("-")[1]),
          },
        },
        get().edges
      ),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
}));
