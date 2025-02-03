import { Position, useReactFlow } from "@xyflow/react";
import SingleConnectionHandle from "./SingleConnectionHandle";

import type { NodeProps } from "@xyflow/react";
import { type OutputNode } from "./Nodes";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";

function OutputNode({ id, data: { name, state } }: NodeProps<OutputNode>) {
  const { updateNodeData } = useReactFlow();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <Input
          value={name}
          onChange={(event) => updateNodeData(id, { name: event.target.value })}
          className="nodrag"
        />
      </TooltipContent>
    </Tooltip>
  );
}

export default memo(OutputNode);
