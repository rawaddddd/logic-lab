import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { type NotNode, CustomNodes, isInputNode } from "./Nodes";
import { memo, useEffect } from "react";
import SingleConnectionHandle from "./SingleConnectionHandle";

function NotNode({ id, data: { state } }: NodeProps<NotNode>) {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useHandleConnections({
    type: "target",
    id: "input",
  });
  console.log(inputConnections);
  const nodesData = useNodesData<CustomNodes>(
    inputConnections.map((connection) => connection.source)
  );
  const inputNodes = nodesData.filter(isInputNode);
  const input = inputNodes.at(0)?.data.state ?? false;
  const output = !input;

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
        NOT
      </div>
      <div className="w-0 flex flex-col justify-around">
        <div>
          <SingleConnectionHandle
            id="input"
            type="target"
            position={Position.Left}
            className={`!relative w-2 h-2 border-[1px] border-white rounded-lg ${
              state ? "!bg-red-500" : "!bg-gray-500"
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

export default memo(NotNode);
