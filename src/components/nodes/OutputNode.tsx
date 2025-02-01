import { Position } from "@xyflow/react";
import SingleConnectionHandle from "./SingleConnectionHandle";

import type { NodeProps } from "@xyflow/react";
import { type OutputNode } from "./Nodes";
import { memo } from "react";

function OutputNode({ data: { state } }: NodeProps<OutputNode>) {
  return (
    <div
      className={`p-4 rounded-sm border-2 ${
        state === undefined
          ? "border-gray-800"
          : state
          ? "border-red-500"
          : "border-gray-500"
      }`}
    >
      {state === undefined ? "⚫" : state ? "🔴" : "⚪"}
      <SingleConnectionHandle
        type="target"
        position={Position.Left}
        className={`w-2 h-2 border-[1px] border-white rounded-lg ${
          state === undefined
            ? "!bg-gray-800"
            : state
            ? "!bg-red-500"
            : "!bg-gray-500"
        }`}
      />
    </div>
  );
}

export default memo(OutputNode);
