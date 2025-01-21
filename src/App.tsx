import { Panel, ReactFlow } from "@xyflow/react";
import InputNode from "./InputNode";
import OutputNode from "./OutputNode";
import WireEdge from "./WireEdge";
import ChipNode from "./ChipNode";
import { SimulationStore, useSimulationStore } from "./store";
import { useShallow } from "zustand/shallow";
import { useCopyPaste } from "./useCopyPaste";

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

  const circuit = useSimulationStore((state) => state.circuit);
  const updateCircuit = useSimulationStore((state) => state.updateCircuit);
  useCopyPaste(circuit, setNodes, setEdges);

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
        defaultEdgeOptions={{ type: "custom", data: { sourceHandleIndex: 0 } }}
      >
        <Panel>
          <button
            onClick={() => {
              // console.log(circuit);
              // console.log(
              //   "input pins",
              //   circuit.inputPins.map((inputPin) => inputPin.value)
              // );
              // console.log(
              //   "output pins",
              //   circuit.outputPins.map((outputPin) => outputPin.value)
              // );
              updateCircuit(
                circuit.inputPins.map((inputPin) => inputPin.value)
              );
            }}
          >
            Tick
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default App;
