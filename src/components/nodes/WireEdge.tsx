import {
  BaseEdge,
  type EdgeProps,
  type Edge as RfEdge,
  getSmoothStepPath,
  useNodesData,
} from "@xyflow/react";
import { isChipNode, isInputNode } from "./Nodes";

type WireEdgeData = {
  sourceHandleIndex: number;
};

type Edge<EdgeData, EdgeType extends string | undefined> = RfEdge<
  {},
  EdgeType
> & { data: EdgeData } & { type: EdgeType };

type WireEdge = Edge<WireEdgeData, "custom">;

function WireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  data: { sourceHandleIndex },
}: EdgeProps<WireEdge>) {
  const node = useNodesData(source);
  const state = isInputNode(node)
    ? node.data.state
    : isChipNode(node)
    ? node.data.outputs[sourceHandleIndex]
    : undefined;
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
        state === undefined
          ? "!stroke-gray-800"
          : state
          ? "!stroke-red-500 [stroke-dasharray:5]"
          : "!stroke-gray-500"
      }`}
      style={{
        animation: "dashdraw 0.5s linear infinite",
      }}
    />
  );
}

export default WireEdge;
