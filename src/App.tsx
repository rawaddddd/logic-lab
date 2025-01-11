import {
  addEdge,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback } from "react";
import InputNode from "./InputNode";
import OutputNode from "./OutputNode";
import { CustomNodes } from "./Nodes";
import WireEdge from "./WireEdge";

const nodeTypes = {
  input: InputNode,
  output: OutputNode,
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
  { id: "2", type: "output", position: { x: 0, y: 100 }, data: {} },
];
const initialEdges: WireEdge[] = [
  {
    id: "e1-2",
    type: "custom",
    source: "1",
    target: "2",
  },
];

function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge<WireEdge>(params, eds)),
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
      />
    </div>
  );
}

export default App;
