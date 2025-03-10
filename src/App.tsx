import {
  Background,
  BackgroundVariant,
  Panel,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
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
import { DragEndEvent, TypesafeActive } from "./typedDnd";
import { CustomNodes } from "./components/nodes/Nodes";
import ChipSelectionMenu from "./components/ChipSelectionMenu";
import SimulationControls from "./components/SimulationControls";
import ChipCreationMenu from "./components/ChipCreationMenu";
import {
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import AppMenuBar from "./components/AppMenuBar";
import SubChipViewInspector from "./components/SubChipViewInspector";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

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

  const { screenToFlowPosition, getNode, updateNodeData } = useReactFlow();

  const circuit = useSimulationStore((state) => state.circuit);
  const onDropChip = useSimulationStore((state) => state.onDropChip);
  const isViewingSubChip = useSimulationStore(
    (state) => state.chipViewingStack.length > 0
  );
  const viewChip = useSimulationStore((state) => state.viewChip);

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

    const x =
      draggableRect.current.translated.left -
      droppableRect.left +
      draggableRect.current.translated.width / 2;
    const y =
      draggableRect.current.translated.top -
      droppableRect.top +
      draggableRect.current.translated.height / 2;

    const position = screenToFlowPosition({ x, y });

    onDropChip(active.data.current, position);
  };

  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>(
    undefined
  );
  const [active, setActive] = useState<TypesafeActive<DragData> | null>(null);

  const backgroundVariant = useSimulationStore(
    (state) => state.backgroundVariant
  );

  return (
    <DndContext
      sensors={useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
      )}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={(event) => {
        setActive(null);
        onDragEnd(event);
      }}
    >
      <Droppable id={"rfCanvas"}>
        <div className="w-screen h-screen flex flex-col">
          <AppMenuBar />
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              nodeOrigin={[0.5, 0.5]}
              elementsSelectable={!isViewingSubChip}
              nodesDraggable={!isViewingSubChip}
              nodesConnectable={!isViewingSubChip}
              zoomOnDoubleClick={false}
              onNodeDoubleClick={(_event: MouseEvent, node: CustomNodes) => {
                if (node.type === "chip") {
                  viewChip(node.data.id);
                }
              }}
              onNodeClick={(_event: MouseEvent, node: CustomNodes) => {
                setCurrentNodeId(node.id);
                if (!isViewingSubChip && node.type === "input") {
                  updateNodeData(node.id, { state: !node.data.state });
                }
              }}
              onPaneClick={() => setCurrentNodeId(undefined)}
              defaultEdgeOptions={{
                type: "custom",
              }}
              className="bg-white dark:bg-gray-950"
            >
              {backgroundVariant !== "none" && (
                <>
                  <Background
                    id="1"
                    offset={
                      backgroundVariant === BackgroundVariant.Dots ? 21 : 0
                    }
                    patternClassName="!stroke-gray-500/25"
                    variant={backgroundVariant}
                  />
                  <Background
                    id="2"
                    gap={200}
                    patternClassName="!stroke-gray-500/25"
                    variant={BackgroundVariant.Lines}
                  />
                  <Background
                    id="3"
                    gap={2000}
                    patternClassName="!stroke-gray-500/25"
                    variant={BackgroundVariant.Lines}
                  />
                </>
              )}
              {currentNodeId !== undefined && (
                <Panel
                  position="top-left"
                  className="p-4 shadow-md rounded-md border bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-50 text-sm"
                >
                  <Droppable id="debug" asChild noDrop>
                    <pre>{JSON.stringify(getNode(currentNodeId), null, 2)}</pre>
                  </Droppable>
                </Panel>
              )}
              {isViewingSubChip && (
                <Panel
                  position="top-center"
                  className="px-4 py-2 shadow-md rounded-md border bg-white dark:bg-gray-950 dark:text-gray-50 dark:border-gray-800"
                >
                  <span className="font-bold">Viewing:</span>
                  <SubChipViewInspector />
                </Panel>
              )}
              {!isViewingSubChip && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 m-[15px] z-10 h-96 overflow-y-auto shadow-md rounded-md border bg-white dark:bg-gray-950 dark:border-gray-800">
                  <Droppable id="chipSelectionMenu" asChild noDrop>
                    <ChipSelectionMenu />
                  </Droppable>
                </div>
              )}
              <Panel
                position="bottom-center"
                className="flex flex-row space-x-2"
              >
                <Droppable id="simulationControls" asChild noDrop>
                  <SimulationControls />
                </Droppable>
                {!isViewingSubChip && (
                  <Droppable id="chipCreationMenu" asChild noDrop>
                    <ChipCreationMenu />
                  </Droppable>
                )}
              </Panel>
            </ReactFlow>
          </div>
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
        {active?.data.current?.dragOverlay}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
