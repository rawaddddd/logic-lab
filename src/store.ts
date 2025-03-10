import { create } from "zustand";
import {
  Bit,
  Circuit,
  CircuitManager,
  CompIO,
  ID,
  nandGateChip,
  WithID,
} from "./Simulation";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  BackgroundVariant,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import {
  ChipNodeData,
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
import { deserialise, serialise } from "./serialise";
import { HslColor } from "colord";
export interface SimulationStore {
  circuitManager: CircuitManager;
  circuit: Circuit & { id?: ID }; // has an id only when it is a circuit being edited, TODO maybe make this more type-safe somehow
  setCircuit: (newCircuit: Circuit & { id?: ID }) => void;
  updateCircuit: (input: Bit[]) => void;
  saveChip: (name: string, color: HslColor) => void;
  customChips: { chip: WithID<Circuit>; disabled: boolean }[];
  setCustomChips: (
    newCustomChips: { chip: WithID<Circuit>; disabled: boolean }[]
  ) => void;
  onDropChip: (dragData: DragData, position: { x: number; y: number }) => void;
  save: () => void;
  open: (file: File) => void;
  newChip: () => void;
  editChip: (chip: WithID<Circuit>) => void;
  deleteChip: (chip: WithID<Circuit>) => void;
  chipViewingStack: { id: ID; chip: WithID<Circuit> }[];
  clearChipViewingStack: () => void;
  popChipViewingStack: (index: number) => void;
  getCurrentlyViewedChip: () => Circuit & { id?: ID };
  viewChip: (id: ID) => void;
  nodes: CustomNodes[];
  edges: WireEdge[];
  onNodesChange: OnNodesChange<CustomNodes>;
  onEdgesChange: OnEdgesChange<WireEdge>;
  onConnect: OnConnect;
  setNodes: (nodes: CustomNodes[]) => void;
  setEdges: (edges: WireEdge[]) => void;
  backgroundVariant: BackgroundVariant | "none";
  setBackgroundVariant: (backgroundVariant: BackgroundVariant | "none") => void;
  reloadDiagram: () => void;
}

const nand_a = new CompIO(nandGateChip); // c_id: 0

nand_a.add_connection(0, { componentId: 0, inputId: 1 }); // nand_a -> nand_a

const initialCircuit = new Circuit("nand short", 1, 1, [nand_a]);
initialCircuit.connectInputPin(0, 0, 0); // input 0 -> nand_a
initialCircuit.connectOutputPin(0, 0, 0); // nand_a -> output 0

const { nodes: initialNodes, edges: initialEdges } =
  circuitToFlow(initialCircuit);

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  circuitManager: new CircuitManager(),
  circuit: initialCircuit,
  setCircuit: (newCircuit: Circuit & { id?: ID }) =>
    set({ circuit: newCircuit }),
  updateCircuit: (input: Bit[]) => {
    get().circuit.update(input);
    set({
      nodes: get().nodes.map((node) => {
        if (node.type === "chip") {
          const component = get()
            .getCurrentlyViewedChip()
            .getComponent(node.data.id);
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
          const inputPin = get()
            .getCurrentlyViewedChip()
            .getInputPin(node.data.id);
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
          const outputPin = get()
            .getCurrentlyViewedChip()
            .getOutputPin(node.data.id);
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
  saveChip: (name: string, color: HslColor) => {
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
    get().circuit.components.sort(
      (a, b) =>
        (a.extraProperties.position?.x ?? Number.MAX_SAFE_INTEGER) -
        (b.extraProperties.position?.x ?? Number.MAX_SAFE_INTEGER)
    );
    get().circuit.reconstructComponentIds();

    get().circuit.name = name;
    get().circuit.color = color;

    if (get().circuit.id !== undefined) {
      // editing chip
      const circuit = get().circuit as WithID<Circuit>;
      // replace in sidebar sub-chip menu
      set((state) => ({
        customChips: state.customChips.map(({ chip, disabled }) => {
          if (chip.id === circuit.id) {
            return { chip: circuit as WithID<Circuit>, disabled };
          }
          return { chip, disabled };
        }),
      }));

      // replace in all circuits that use it
      const circuitUsagesIDs = new Set(
        get().circuitManager.circuitDependencyMap.get(circuit.id)?.keys()
      );
      // console.log(circuitUsagesIDs);
      get().customChips.forEach(({ chip }) => {
        if (!circuitUsagesIDs.has(chip.id)) return;
        for (const [index, subChip] of chip.components.entries()) {
          // console.log(subChip);
          if (
            subChip.component instanceof Circuit &&
            (subChip.component as WithID<Circuit>).id === circuit.id
          ) {
            // subChip.component = clone(circuit);
            const newSubChip = new CompIO(clone(circuit)) as WithID<CompIO>;
            newSubChip.id = subChip.id;
            newSubChip.connections = subChip.connections;
            newSubChip.extraProperties = subChip.extraProperties;
            chip.components[index] = newSubChip;
          }
        }
        // TODO clean up chip here to remove connections to deleted IO pins or chips
      });
    } else {
      // creating new chip
      set((state) => ({
        customChips: [
          ...state.customChips,
          {
            chip: get().circuitManager.createCircuit(get().circuit),
            disabled: false,
          },
        ],
      }));
    }

    get().newChip();
  },
  customChips: [],
  setCustomChips: (
    newCustomChips: { chip: WithID<Circuit>; disabled: boolean }[]
  ) => {
    set({ customChips: newCustomChips });
  },
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
      if (dragData.component instanceof Circuit) {
        const circuit = dragData.component as WithID<Circuit>;
        // console.log("Custom chip dropped");
        const currentCircuitID = get().circuit.id;
        if (
          currentCircuitID !== undefined &&
          !get().circuitManager.addChipToCircuit(circuit.id, currentCircuitID)
        ) {
          console.warn("Cyclic dependency");
          return;
        }
      }

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
          color: compIO.component.color,
          inputs: compIO.inputs,
          outputs: compIO.outputs,
          inputNames: compIO.component.inputNames(),
          outputNames: compIO.component.outputNames(),
          inputIDs: compIO.component.inputIDs(),
          outputIDs: compIO.component.outputIDs(),
          render: compIO.component.render?.bind(compIO.component),
          showRender: compIO.extraProperties.showRender ?? true,
          id,
        },
      };
      set((state) => ({ nodes: [...state.nodes, newNode] }));
    }
  },
  save: () => {
    const json = serialise(get().customChips.map((chip) => chip.chip));
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "file.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  open: (file: File) => {
    if (file.type === "application/json") {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const deserialisedCircuitManager = deserialise(
            e.target!.result as string
          );
          set({
            circuitManager: deserialisedCircuitManager,
            customChips: deserialisedCircuitManager.circuits.map((chip) => ({
              chip,
              disabled: false,
            })),
          });
        } catch (err) {
          console.warn("Invalid JSON file.");
        }
      };

      reader.readAsText(file);
    } else {
      console.warn("Not a JSON file");
    }
  },
  newChip: () => {
    set({
      circuit: new Circuit("Circuit", 0, 0, []),
      customChips: get().customChips.map((chip) => ({
        ...chip,
        disabled: false,
      })),
    });
    get().reloadDiagram();
  },
  editChip: (editedChip: WithID<Circuit>) => {
    // TODO add a confirmation menu if the current circuit is not saved
    // console.log(editedChip);
    set({
      circuit: clone(editedChip),
      customChips: get().customChips.map((chip) => ({
        ...chip,
        disabled: get().circuitManager.wouldCreateCycle(
          chip.chip.id,
          editedChip.id
        ),
      })),
    });
    get().reloadDiagram();
  },
  deleteChip: (deletedChip: WithID<Circuit>) => {
    if (get().circuit.id === deletedChip.id) {
      console.warn("Cannot delete chip while editing it");
      return;
    }

    if (
      get().circuitManager.circuitDependencyMap.get(deletedChip.id)?.size !== 0
    ) {
      console.warn("Cannot delete a chip while it is used in other chips");
      return;
    }

    get().circuitManager.deleteCircuit(deletedChip.id);

    set({
      customChips: get().customChips.filter(
        ({ chip }) => chip.id !== deletedChip.id
      ),
    });
  },
  chipDependencyMap: new Map(),
  chipViewingStack: [],
  clearChipViewingStack: () => {
    set({ chipViewingStack: [] });
    get().reloadDiagram();
  },
  popChipViewingStack: (index: number) => {
    set((state) => ({
      chipViewingStack: state.chipViewingStack.slice(0, index + 1),
    }));
    get().reloadDiagram();
  },
  getCurrentlyViewedChip: () =>
    get().chipViewingStack.at(get().chipViewingStack.length - 1)?.chip ??
    get().circuit,
  viewChip: (id: ID) => {
    const chip = get().getCurrentlyViewedChip().getComponent(id);

    if (chip === undefined) {
      console.warn(
        `Cannot view chip with ID ${id} in ${
          get().circuit.name
        } because it does not exist.`
      );
      return;
    }

    const circuit = chip.component;

    if (!(circuit instanceof Circuit)) {
      console.warn("Cannot view builtin circuits.");
      return;
    }

    set((state) => ({
      chipViewingStack: state.chipViewingStack.concat({
        id,
        chip: circuit as WithID<Circuit>,
      }),
    }));
    get().reloadDiagram();
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
        } else if (isChipNode(node)) {
          get().circuit.getComponent(node.data.id)!.extraProperties.showRender =
            (change.item.data as ChipNodeData).showRender;
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
          const component = get().circuit.getComponent(node.data.id)?.component;
          const circuitID = get().circuit.id;
          if (component instanceof Circuit && circuitID !== undefined) {
            get().circuitManager.removeChipFromCircuit(
              (component as WithID<Circuit>).id,
              circuitID
            );
          }
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
  backgroundVariant: BackgroundVariant.Lines,
  setBackgroundVariant: (backgroundVariant) => {
    set({ backgroundVariant });
  },
  reloadDiagram: () => {
    const { nodes, edges } = circuitToFlow(get().getCurrentlyViewedChip());
    set({ nodes, edges });
  },
}));
