import {
  BaseEdge,
  type EdgeProps,
  type Edge,
  getSmoothStepPath,
  useNodesData,
} from "@xyflow/react";
import { InputNode } from "./Nodes";

type WireEdge = Edge<{}, "custom">;

function WireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
}: EdgeProps<WireEdge>) {
  const state = useNodesData<InputNode>(source)!.data.state;
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      className={`!stroke-2 ${
        state ? "!stroke-red-500 [stroke-dasharray:5]" : "!stroke-gray-500"
      }`}
      style={{
        animation: "dashdraw 0.5s linear infinite",
      }}
    />
  );
}

export default WireEdge;
