import { Panel, ReactFlow, useReactFlow } from "@xyflow/react";
import InputNode from "./components/nodes/InputNode";
import OutputNode from "./components/nodes/OutputNode";
import WireEdge from "./components/nodes/WireEdge";
import ChipNode from "./components/nodes/ChipNode";
import { SimulationStore, useSimulationStore } from "./store";
import { useShallow } from "zustand/shallow";
import { useCopyPaste } from "./hooks/useCopyPaste";
import { useState, MouseEvent } from "react";
import { Droppable } from "./components/Droppable";
import { DragData, DropData, sidebarDnd } from "./sidebarDnd";
import { DragEndEvent } from "./typedDnd";
import { CustomNodes } from "./components/nodes/Nodes";
import ChipSelectionMenu from "./components/ChipSelectionMenu";
import SimulationControls from "./components/SimulationControls";
import ChipCreationMenu from "./components/ChipCreationMenu";
import { DragOverlay } from "@dnd-kit/core";
import { Button } from "./components/ui/button";

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
  const onDropChip = useSimulationStore((state) => state.onDropChip);

  useCopyPaste(circuit, setNodes, setEdges);

  const onDragEnd = (event: DragEndEvent<DragData, DropData>) => {
    const { over, active } = event;
    if (over === null) return;

    if (over.data.current?.noDrop) {
      // console.log("Cannot dorp here");
      return;
    }

    const droppableRect = over.rect;
    const draggableRect = active.rect;
    if (draggableRect.current.translated === null) return;
    if (active.data.current == null) return;

    const x = draggableRect.current.translated.left - droppableRect.left;
    const y = draggableRect.current.translated.top - droppableRect.top;

    const position = screenToFlowPosition({ x, y });

    onDropChip(active.data.current, position);
  };

  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>(
    undefined
  );
  const [activeId, setActiveId] = useState<string | number | null>(null);

  return (
    <DndContext
      onDragStart={(event) => {
        setActiveId(event.active.id);
      }}
      onDragEnd={(event) => {
        setActiveId(null);
        onDragEnd(event);
      }}
    >
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
                <Droppable id="debug" noDrop>
                  <pre>{JSON.stringify(getNode(currentNodeId), null, 2)}</pre>
                </Droppable>
              </Panel>
            )}
            <div className="absolute h-96 right-0 top-1/2 -translate-y-1/2 m-[15px] z-10 p-4 flex flex-col items-center overflow-x-hidden overflow-y-scroll shadow-md rounded-md border bg-white space-y-2">
              <Droppable id="chipSelectionMenu" noDrop>
                <ChipSelectionMenu />
              </Droppable>
            </div>
            <Panel position="bottom-center" className="flex flex-row space-x-2">
              <Droppable id="simulationControls" noDrop>
                <SimulationControls />
              </Droppable>
              <Droppable id="chipCreationMenu" noDrop>
                <ChipCreationMenu />
              </Droppable>
            </Panel>
          </ReactFlow>
        </div>
      </Droppable>
      <DragOverlay
        dropAnimation={{
          duration: 150,
          keyframes: ({ dragOverlay: { node } }) => [
            {
              boxShadow: getComputedStyle(node).boxShadow,
              opacity: getComputedStyle(node).opacity,
            },
            {
              boxShadow: "none",
              opacity: 0,
            },
          ],
          sideEffects: () => {},
        }}
        className="cursor-grabbing shadow-lg"
      >
        <div>
          {activeId !== null ? (
            <Button variant="secondary" className="pointer-events-none">
              {activeId}
            </Button>
          ) : null}
        </div>
      </DragOverlay>
    </DndContext>
  );
}

export default App;
