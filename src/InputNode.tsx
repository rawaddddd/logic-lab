import { Handle, Position, useReactFlow } from "@xyflow/react";

import type { NodeProps } from "@xyflow/react";
import type { InputNode } from "./Nodes";
import { memo } from "react";

function InputNode({ id, data: { state } }: NodeProps<InputNode>) {
  const { updateNodeData } = useReactFlow();
  const toggle = () => updateNodeData(id, { state: !state });

  return (
    <div
      onClick={toggle}
      className={`p-4 rounded-sm border-2 ${
        state ? "border-red-500" : "border-gray-500"
      }`}
    >
      {state ? "🔴" : "⚪"}
      <Handle
        type="source"
        position={Position.Right}
        className={`w-2 h-2 border-[1px] border-white rounded-lg ${
          state ? "!bg-red-500" : "!bg-gray-500"
        }`}
      />
    </div>
  );
}

export default memo(InputNode);
