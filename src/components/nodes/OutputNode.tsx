import { Position, useReactFlow } from "@xyflow/react";
import SingleConnectionHandle from "./SingleConnectionHandle";

import type { NodeProps } from "@xyflow/react";
import { type OutputNode } from "./Nodes";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

function OutputNode({ id, data: { name, state } }: NodeProps<OutputNode>) {
  const { updateNodeData } = useReactFlow();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "p-4 rounded-sm border-2 bg-white dark:bg-gray-950",
            state === undefined
              ? "border-gray-800 dark:border-gray-700"
              : state
              ? "border-red-500"
              : "border-gray-500 dark:border-gray-50"
          )}
        >
          {state === undefined ? "⚫" : state ? "🔴" : "⚪"}
          <SingleConnectionHandle
            type="target"
            position={Position.Left}
            className={cn(
              "w-2 h-2 border border-white rounded-lg",
              state === undefined
                ? "bg-gray-800 dark:bg-gray-700"
                : state
                ? "bg-red-500"
                : "bg-gray-500 dark:bg-gray-50",
              "dark:border-gray-900"
            )}
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
