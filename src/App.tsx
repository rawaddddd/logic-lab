import { Panel, ReactFlow, useReactFlow } from "@xyflow/react";
import InputNode from "./InputNode";
import OutputNode from "./OutputNode";
import WireEdge from "./WireEdge";
import ChipNode from "./ChipNode";
import { SimulationStore, useSimulationStore } from "./store";
import { useShallow } from "zustand/shallow";
import { useCopyPaste } from "./useCopyPaste";
import {
  IconExposurePlus1,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useState, MouseEvent } from "react";
import useInterval from "./useInterval";
import { Droppable } from "./Droppable";
import { Draggable } from "./Draggable";
import {
  builtinCircuits,
  CompIO,
  notGateChip,
  tristateBufferChip,
} from "./Simulation";
import { DragData, DropData, sidebarDnd } from "./sidebarDnd";
import { DragEndEvent } from "./typedDnd";
import { CustomNodes } from "./Nodes";

const { DndContext } = sidebarDnd;

const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  chip: ChipNode,
};

const edgeTypes = {
  custom: WireEdge,
};

const selector = (state: SimulationStore) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
});

function App() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
  } = useSimulationStore(useShallow(selector));

  const { screenToFlowPosition, getNode } = useReactFlow();

  const circuit = useSimulationStore((state) => state.circuit);
  const updateCircuit1 = useSimulationStore((state) => state.updateCircuit);
  const updateCircuit = () => {
    // console.log(circuit);
    // console.log(
    //   "input pins",
    //   circuit.inputPins.map((inputPin) => inputPin.value)
    // );
    // console.log(
    //   "output pins",
    //   circuit.outputPins.map((outputPin) => outputPin.value)
    // );
    updateCircuit1(circuit.inputPins.map((inputPin) => inputPin.value));
  };

  useCopyPaste(circuit, setNodes, setEdges);

  const [playing, setPlaying] = useState(false);
  const [tickRate, setTickRate] = useState(60);

  useInterval(() => updateCircuit(), playing ? 1000 / tickRate : null);

  const onDragEnd = (event: DragEndEvent<DragData, DropData>) => {
    const { over, active } = event;
    if (over === null) return;

    const droppableRect = over.rect;
    const draggableRect = active.rect;
    if (draggableRect.current.translated === null) return;
    if (active.data.current == null) return;

    const x = draggableRect.current.translated.left - droppableRect.left;
    const y = draggableRect.current.translated.top - droppableRect.top;

    const position = screenToFlowPosition({ x, y });

    if (active.data.current.type === "input") {
      const id = circuit.addInputPin({
        connections: [],
        value: undefined,
        extraProperties: { position },
      });
      const newNode: CustomNodes = {
        id: `input-${id}`,
        type: "input",
        position: position,
        selected: undefined,
        data: {
          state: undefined,
          id,
        },
      };
      setNodes([...nodes, newNode]);
    } else if (active.data.current.type === "output") {
      const id = circuit.addOutputPin({
        connections: [],
        value: undefined,
        extraProperties: { position },
      });
      const newNode: CustomNodes = {
        id: `output-${id}`,
        type: "output",
        position: position,
        selected: undefined,
        data: {
          state: undefined,
          id,
        },
      };
      setNodes([...nodes, newNode]);
    } else if (active.data.current.type === "chip") {
      const compIO = new CompIO(active.data.current.component);
      compIO.extraProperties.position = position;
      const id = circuit.addComponent(compIO);

      const newNode: CustomNodes = {
        id: `chip-${id}`,
        type: "chip",
        position: position,
        selected: undefined,
        data: {
          name: compIO.component.name,
          inputs: compIO.inputs,
          outputs: compIO.outputs,
          id,
        },
      };
      setNodes([...nodes, newNode]);
    }
  };

  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>(
    undefined
  );

  const [numInputHandles, setNumInputHandles] = useState(2);

  return (
    <DndContext onDragEnd={onDragEnd}>
      <Droppable id={"rfCanvas"}>
        <div className="w-screen h-screen">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            onNodeClick={(_event: MouseEvent, node: CustomNodes) => {
              setCurrentNodeId(node.id);
            }}
            onPaneClick={() => setCurrentNodeId(undefined)}
            defaultEdgeOptions={{
              type: "custom",
              data: { sourceHandleIndex: 0 },
            }}
          >
            {currentNodeId !== undefined && (
              <Panel
                position="top-left"
                className="p-4 shadow-md rounded-md border bg-white text-sm"
              >
                <pre>{JSON.stringify(getNode(currentNodeId), null, 2)}</pre>
              </Panel>
            )}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 m-[15px] z-10 p-4 flex flex-col items-center shadow-md rounded-md border bg-white">
              <label
                htmlFor="num-handles"
                className="mb-1 text-nowrap block text-sm font-medium text-gray-500"
              >
                Input handles:
              </label>
              <input
                id="num-handles"
                type="number"
                min={2}
                value={numInputHandles}
                className="w-20 border rounded-lg"
                onChange={(e) => {
                  setNumInputHandles(Number(e.target.value));
                }}
              />
              <hr className="my-2 w-full border border-t-0 bg-gray-300" />
              <Draggable id="INPUT" data={{ type: "input" }}>
                <div>INPUT</div>
              </Draggable>
              <Draggable id="OUTPUT" data={{ type: "output" }}>
                <div>OUTPUT</div>
              </Draggable>
              <hr className="my-2 w-full border border-t-0 bg-gray-300" />
              <Draggable
                id="Tristate Buffer"
                data={{
                  type: "chip",
                  component: {
                    ...tristateBufferChip,
                    numInputs: numInputHandles,
                    numOutputs: numInputHandles - 1,
                  },
                }}
              >
                <div>Tristate Buffer</div>
              </Draggable>
              <Draggable
                id="NOT"
                data={{ type: "chip", component: notGateChip }}
              >
                <div>NOT</div>
              </Draggable>
              {builtinCircuits.slice(2).map((chip) => (
                <Draggable
                  id={chip.name}
                  key={chip.name}
                  data={{
                    type: "chip",
                    component: { ...chip, numInputs: numInputHandles },
                  }}
                >
                  <div>{chip.name}</div>
                </Draggable>
              ))}
            </div>
            <Panel position="bottom-center">
              <div className="flex flex-row items-center shadow-md rounded-md border bg-white">
                <div className="flex flex-row py-2 px-4 items-center space-x-2">
                  <label
                    htmlFor="tick-range"
                    className="text-nowrap block text-sm font-medium text-gray-500"
                  >
                    Ticks per second:
                  </label>
                  <div>
                    <input
                      id="tick-range"
                      type="range"
                      min={1}
                      max={100}
                      value={tickRate}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      onChange={(e) => {
                        setTickRate(Number(e.target.value));
                      }}
                    />
                    <div className="flex flex-row justify-between">
                      <span className="text-xs text-gray-500">1</span>
                      <span className="text-xs text-gray-500">100</span>
                    </div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-e-md border-l disabled:cursor-not-allowed disabled:text-gray-300"
                  onClick={() => {
                    setPlaying(!playing);
                  }}
                >
                  {playing ? (
                    <IconPlayerPauseFilled className="text-gray-500" />
                  ) : (
                    <IconPlayerPlayFilled className="text-gray-500" />
                  )}
                </button>
                <button
                  className="group px-4 py-2 rounded-e-md border-l disabled:cursor-not-allowed"
                  disabled={playing}
                  onClick={() => {
                    updateCircuit();
                  }}
                >
                  <IconExposurePlus1 className="text-gray-500 group-disabled:text-gray-300" />
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </Droppable>
    </DndContext>
  );
}

export default App;
