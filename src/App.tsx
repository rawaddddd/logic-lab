import {
  addEdge,
  Connection,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback } from "react";
import InputNode from "./InputNode";
import OutputNode from "./OutputNode";
import { CustomNodes } from "./Nodes";
import WireEdge from "./WireEdge";
import AndNode from "./AndNode";
import OrNode from "./OrNode";
import NotNode from "./NotNode";

const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  and: AndNode,
  or: OrNode,
  not: NotNode,
};

const edgeTypes = {
  custom: WireEdge,
};

const initialNodes: CustomNodes[] = [
  {
    id: "1",
    type: "input",
    position: { x: 0, y: 0 },
    data: { state: true },
  },
  {
    id: "2",
    type: "input",
    position: { x: 0, y: 100 },
    data: { state: true },
  },
  { id: "3", type: "output", position: { x: 200, y: 50 }, data: {} },
  { id: "4", type: "and", position: { x: 100, y: 50 }, data: { state: false } },
  { id: "5", type: "or", position: { x: 100, y: 150 }, data: { state: false } },
  {
    id: "6",
    type: "not",
    position: { x: 100, y: 200 },
    data: { state: false },
  },
];
const initialEdges: WireEdge[] = [
  {
    id: "1->4",
    source: "1",
    target: "4",
    targetHandle: "input-1",
  },
  {
    id: "2->4",
    source: "2",
    target: "4",
    targetHandle: "input-2",
  },
  {
    id: "4->3",
    source: "4",
    target: "3",
  },
];

function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
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
        defaultEdgeOptions={{ type: "custom" }}
      />
    </div>
  );
}

export default App;
