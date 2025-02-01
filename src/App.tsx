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
  pullDownResistorChip,
  pullUpResistorChip,
  tristateBufferChip,
} from "./Simulation";
import { DragData, DropData, sidebarDnd } from "./sidebarDnd";
import { DragEndEvent } from "./typedDnd";
import { CustomNodes } from "./Nodes";
import clone from "clone";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Slider } from "./components/ui/slider";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { NumberInput } from "./components/ui/numberInput";

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
  const createChip = useSimulationStore((state) => state.createChip);
  const customChips = useSimulationStore((state) => state.customChips);

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
      const compIO = new CompIO(clone(active.data.current.component));
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

  const [name, setName] = useState("");

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
            <div className="absolute right-0 top-1/2 -translate-y-1/2 m-[15px] z-10 p-4 flex flex-col items-center shadow-md rounded-md border bg-white space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <Label htmlFor="num-handles" className="text-nowrap">
                  Input pins:
                </Label>
                <NumberInput
                  id="num-handles"
                  min={2}
                  value={numInputHandles}
                  className="w-20"
                  onValueChange={(value) => {
                    if (value !== undefined) setNumInputHandles(value);
                  }}
                />
              </div>
              <Separator />
              <span className="font-thin text-gray-500">I/O</span>
              <Draggable id="INPUT" data={{ type: "input" }}>
                <div>INPUT</div>
              </Draggable>
              <Draggable id="OUTPUT" data={{ type: "output" }}>
                <div>OUTPUT</div>
              </Draggable>
              <Separator />
              <span className="font-thin text-gray-500">
                Built-in Tristate Logic Chips
              </span>
              <Draggable
                id="Pull-Up Resistor"
                data={{ type: "chip", component: pullUpResistorChip }}
              >
                <div>Pull-Up Resistor</div>
              </Draggable>
              <Draggable
                id="Pull-Down Resistor"
                data={{ type: "chip", component: pullDownResistorChip }}
              >
                <div>Pull-Down Resistor</div>
              </Draggable>
              <Draggable
                id="Tristate Buffer"
                data={{
                  type: "chip",
                  component: {
                    ...tristateBufferChip,
                    numInputs: () => numInputHandles,
                    numOutputs: () => numInputHandles - 1,
                  },
                }}
              >
                <div>Tristate Buffer</div>
              </Draggable>
              <Separator />
              <span className="font-thin text-gray-500">
                Built-in Logic Gates
              </span>
              <Draggable
                id="NOT"
                data={{ type: "chip", component: notGateChip }}
              >
                <div>NOT</div>
              </Draggable>
              {builtinCircuits.slice(4).map((chip) => (
                <Draggable
                  id={chip.name}
                  key={chip.name}
                  data={{
                    type: "chip",
                    component: { ...chip, numInputs: () => numInputHandles },
                  }}
                >
                  <div>{chip.name}</div>
                </Draggable>
              ))}
              {customChips.length > 0 && (
                <>
                  <Separator />
                  <span className="font-thin text-gray-500">Custom Chips</span>
                  {customChips.map((chip) => (
                    <Draggable
                      id={chip.name}
                      key={chip.name}
                      data={{
                        type: "chip",
                        component: chip,
                      }}
                    >
                      <div>{chip.name}</div>
                    </Draggable>
                  ))}
                </>
              )}
            </div>
            <Panel position="bottom-center" className="flex flex-row space-x-2">
              <div className="px-4 py-2 flex flex-row items-center shadow-md rounded-md border bg-white space-x-2">
                <div className="flex flex-row items-center space-x-2">
                  <Label htmlFor="tick-range" className="text-nowrap">
                    Ticks per second:
                  </Label>
                  <div>
                    <Slider
                      id="tick-range"
                      min={1}
                      max={100}
                      defaultValue={[tickRate]}
                      className="w-40"
                      onValueChange={(value) => {
                        setTickRate(value[0]);
                      }}
                    />
                    <div className="mt-2 flex flex-row justify-between">
                      <span className="text-xs">1</span>
                      <span className="text-xs">100</span>
                    </div>
                  </div>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPlaying(!playing);
                        }}
                      >
                        {playing ? (
                          <IconPlayerPauseFilled />
                        ) : (
                          <IconPlayerPlayFilled />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {playing ? "Pause" : "Play"}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={playing}
                        onClick={() => {
                          updateCircuit();
                        }}
                      >
                        <IconExposurePlus1 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Single step</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="px-4 py-2 flex flex-row items-center shadow-md rounded-md border bg-white space-x-2">
                <Button onClick={() => createChip(name)}>Create chip</Button>
                <Input
                  className="w-fit"
                  placeholder="Chip Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              {/* <div className="shadow-md rounded-md">
                <Button
                  className="h-full w-full"
                  size="lg"
                  onClick={() => createChip(name)}
                >
                  Create chip
                </Button>
              </div> */}
            </Panel>
          </ReactFlow>
        </div>
      </Droppable>
    </DndContext>
  );
}

export default App;
