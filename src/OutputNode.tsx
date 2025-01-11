import { Position, useHandleConnections, useNodesData } from "@xyflow/react";
import SingleConnectionHandle from "./SingleConnectionHandle";

import type { NodeProps } from "@xyflow/react";
import { isInputNode, type CustomNodes, type OutputNode } from "./Nodes";
import { memo } from "react";

function OutputNode({}: NodeProps<OutputNode>) {
  const connections = useHandleConnections({ type: "target" });
  const nodesData = useNodesData<CustomNodes>(
    connections.map((connection) => connection.source)
  );
  const inputNodes = nodesData.filter(isInputNode);
  const state = inputNodes.at(0)?.data.state ?? false;

  return (
    <div
      className={`p-4 rounded-sm border-2 ${
        state ? "border-red-500" : "border-gray-500"
      }`}
    >
      {state ? "🔴" : "⚪"}
      <SingleConnectionHandle
        type="target"
        position={Position.Left}
        className={`w-2 h-2 border-[1px] border-white rounded-lg ${
          state ? "!bg-red-500" : "!bg-gray-500"
        }`}
      />
    </div>
  );
}

export default memo(OutputNode);
