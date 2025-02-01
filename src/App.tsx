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
              <ChipSelectionMenu />
            </div>
            <Panel position="bottom-center" className="flex flex-row space-x-2">
              <SimulationControls />
              <ChipCreationMenu />
            </Panel>
          </ReactFlow>
        </div>
      </Droppable>
    </DndContext>
  );
}

export default App;
