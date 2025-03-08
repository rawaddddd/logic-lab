import { Handle, NodeProps, Position } from "@xyflow/react";
import SingleConnectionHandle from "./SingleConnectionHandle";
import { type ChipNode } from "./Nodes";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { colord } from "colord";

function ChipNode({
  data: {
    name,
    color: bgColor,
    inputs,
    outputs,
    inputNames,
    outputNames,
    inputIDs,
    outputIDs,
    render,
  },
}: NodeProps<ChipNode>) {
  const color = colord(bgColor);
  const luminance = color.luminance();

  return (
    <div
      className={cn(
        "flex flex-row justify-between rounded-sm border-2",
        luminance > 0.5 ? "border-gray-700" : "border-gray-50"
      )}
      style={{ backgroundColor: colord(color).toHslString() }}
    >
      <div className="py-1 flex flex-col justify-around">
        {inputs.map((input, i) => (
          <div key={i} className="relative w-0 my-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <SingleConnectionHandle
                  id={`input-${inputIDs[i]}`}
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
        className={cn(
          "w-full self-stretch px-4 py-1 font-bold flex flex-col items-center justify-center space-y-2",
          luminance > 0.5 ? "text-gray-700" : "text-gray-50"
        )}
      >
        <span>{name}</span>
        {render !== undefined ? render(inputs) : null}
      </div>
      <div className="py-1 flex flex-col justify-around">
        {outputs.map((output, i) => (
          <div key={i} className="relative w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Handle
                  id={`output-${outputIDs[i]}`}
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
