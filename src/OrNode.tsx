import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { type OrNode, CustomNodes, isInputNode } from "./Nodes";
import { memo, useEffect } from "react";
import SingleConnectionHandle from "./SingleConnectionHandle";

function OrNode({ id, data: { state } }: NodeProps<OrNode>) {
  const { updateNodeData } = useReactFlow();
  const input1Connections = useHandleConnections({
    type: "target",
    id: "input-1",
  });
  const input2Connections = useHandleConnections({
    type: "target",
    id: "input-2",
  });
  const nodesData1 = useNodesData<CustomNodes>(
    input1Connections.map((connection) => connection.source)
  );
  const nodesData2 = useNodesData<CustomNodes>(
    input2Connections.map((connection) => connection.source)
  );
  const inputNodes1 = nodesData1.filter(isInputNode);
  const inputNodes2 = nodesData2.filter(isInputNode);
  const input1 = inputNodes1.at(0)?.data.state ?? false;
  const input2 = inputNodes2.at(0)?.data.state ?? false;
  const output = input1 || input2;

  useEffect(() => {
    updateNodeData(id, { state: output });
  }, [output]);

  return (
    <div
      className={`flex flex-row-reverse justify-between rounded-sm border-2 ${
        state ? "border-red-500" : "border-gray-500"
      }`}
    >
      <div
        className={`px-4 py-2 font-bold ${
          state ? "text-red-500" : "text-gray-500"
        }`}
      >
        OR
      </div>
      <div className="w-0 flex flex-col justify-around">
        <div>
          <SingleConnectionHandle
            id="input-1"
            type="target"
            position={Position.Left}
            className={`!relative w-2 h-2 border-[1px] border-white rounded-lg ${
              input1 ? "!bg-red-500" : "!bg-gray-500"
            }`}
          />
        </div>
        <div>
          <SingleConnectionHandle
            id="input-2"
            type="target"
            position={Position.Left}
            className={`!relative w-2 h-2 border-[1px] border-white rounded-lg ${
              input2 ? "!bg-red-500" : "!bg-gray-500"
            }`}
          />
        </div>
      </div>
      <Handle
        id="output"
        type="source"
        position={Position.Right}
        className={`w-2 h-2 border-[1px] border-white rounded-lg ${
          state ? "!bg-red-500" : "!bg-gray-500"
        }`}
      />
    </div>
  );
}

export default memo(OrNode);
