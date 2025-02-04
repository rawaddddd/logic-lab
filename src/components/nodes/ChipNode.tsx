import { Handle, NodeProps, Position } from "@xyflow/react";
import SingleConnectionHandle from "./SingleConnectionHandle";
import { type ChipNode } from "./Nodes";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";

function ChipNode({
  data: { name, inputs, outputs, inputNames, outputNames },
}: NodeProps<ChipNode>) {
  return (
    <div
      className={
        "flex flex-row justify-between rounded-sm border-2 border-gray-500 bg-white dark:bg-gray-950 dark:border-gray-50"
      }
    >
      <div className="py-1 flex flex-col justify-around">
        {inputs.map((input, i) => (
          <div key={i} className="relative w-0 my-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <SingleConnectionHandle
                  id={`input-${i}`}
                  type="target"
                  position={Position.Left}
                  className={cn(
                    "relative inset-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-white rounded-full",
                    input === undefined
                      ? "bg-gray-800 dark:bg-gray-700"
                      : input
                      ? "bg-red-500"
                      : "bg-gray-500 dark:bg-gray-50",
                    "dark:border-gray-900"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="left">{inputNames[i]}</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
      <div
        className={
          "px-4 py-1 font-bold self-center text-gray-500 dark:text-gray-50"
        }
      >
        {name}
      </div>
      <div className="py-1 flex flex-col justify-around">
        {outputs.map((output, i) => (
          <div key={i} className="relative w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Handle
                  id={`output-${i}`}
                  type="source"
                  position={Position.Right}
                  className={cn(
                    "relative inset-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-white rounded-full",
                    output === undefined
                      ? "bg-gray-800 dark:bg-gray-700"
                      : output
                      ? "bg-red-500"
                      : "bg-gray-500 dark:bg-gray-50",
                    "dark:border-gray-900"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="right">{outputNames[i]}</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ChipNode);
