import { Handle, Position, useReactFlow } from "@xyflow/react";

import type { NodeProps } from "@xyflow/react";
import type { InputNode } from "./Nodes";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

function InputNode({ id, data: { name, state } }: NodeProps<InputNode>) {
  const { updateNodeData } = useReactFlow();

  return (
    <div className="border-none">
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
            <Handle
              type="source"
              position={Position.Right}
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
            onChange={(event) =>
              updateNodeData(id, { name: event.target.value })
            }
            className="nodrag"
          />
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default memo(InputNode);
