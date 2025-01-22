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
import { useState } from "react";
import useInterval from "./useInterval";
import { Droppable } from "./Droppable";
import { Draggable } from "./Draggable";
import { builtinCircuits, CompIO } from "./Simulation";
import { DragData, DropData, sidebarDnd } from "./sidebarDnd";
import { DragEndEvent } from "./typedDnd";

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

  const { screenToFlowPosition } = useReactFlow();

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

    const compIO = new CompIO(active.data.current.component);
    compIO.extraProperties.position = screenToFlowPosition({ x, y });
    // console.log(compIO);
    circuit.addComponent(compIO);
  };

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
            defaultEdgeOptions={{
              type: "custom",
              data: { sourceHandleIndex: 0 },
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 m-[15px] z-10 p-4 flex flex-col items-center shadow-md rounded-md border bg-white">
              {builtinCircuits.map((chip) => (
                <Draggable
                  id={chip.name}
                  key={chip.name}
                  data={{
                    component: chip,
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
