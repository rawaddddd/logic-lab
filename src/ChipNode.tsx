import { Handle, NodeProps, Position } from "@xyflow/react";
import SingleConnectionHandle from "./SingleConnectionHandle";
import { type ChipNode } from "./Nodes";
import { memo } from "react";

function ChipNode({ data: { name, inputs, outputs } }: NodeProps<ChipNode>) {
  return (
    <div
      className={
        "flex flex-row justify-between rounded-sm border-2 border-gray-500 bg-white"
      }
    >
      <div className="py-1 flex flex-col justify-around">
        {inputs.map((input, i) => (
          <div key={i}>
            <SingleConnectionHandle
              id={`input-${i}`}
              type="target"
              position={Position.Left}
              className={`!relative w-2 h-2 mb-1 border border-white rounded-lg ${
                input === undefined
                  ? "!bg-gray-800"
                  : input
                  ? "!bg-red-500"
                  : "!bg-gray-500"
              }`}
            />
          </div>
        ))}
      </div>
      <div className={"px-4 py-1 font-bold self-center text-gray-500"}>
        {name}
      </div>
      <div className="py-1 flex flex-col justify-around">
        {outputs.map((output, i) => (
          <div key={i}>
            <Handle
              id={`output-${i}`}
              type="source"
              position={Position.Right}
              className={`!relative w-2 h-2 mb-1 border border-white rounded-lg ${
                output === undefined
                  ? "!bg-gray-800"
                  : output
                  ? "!bg-red-500"
                  : "!bg-gray-500"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ChipNode);
