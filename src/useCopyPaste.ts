import { ReactFlowInstance, Node, Edge } from "@xyflow/react";
import { useCallback, useEffect } from "react";

export const useCopyPaste = (
    rfInstance: ReactFlowInstance,
) => {

    const onCopyCapture = useCallback(
        (event: ClipboardEvent) => {
            event.preventDefault();
            const nodes = rfInstance.getNodes().filter((n) => n.selected)

            const nodeIds = new Set();
            nodes.forEach((node) => {
                nodeIds.add(node.id);
            });
            const edges = rfInstance.getEdges().filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

            event.clipboardData?.setData("logic-lab:nodes", JSON.stringify(nodes));
            event.clipboardData?.setData("logic-lab:edges", JSON.stringify(edges));
        },
        [rfInstance]
    );

    const onPasteCapture = useCallback(
        (event: ClipboardEvent) => {
            event.preventDefault();

            const nodes = JSON.parse(event.clipboardData?.getData("logic-lab:nodes") ?? "[]") as Node[];
            const edges = JSON.parse(event.clipboardData?.getData("logic-lab:edges") ?? "[]") as Edge[];

            if (nodes.length > 0) {
                const randomId = () => Math.random().toString(16).slice(2);

                const idMap: Record<string, string> = {};
                const newNodes = nodes.map((n) => {
                    const newId = randomId();
                    idMap[n.id] = newId;
                    return {
                        ...n,
                        selected: true,
                        id: newId,
                        position: { x: n.position.x + 10, y: n.position.y + 10 },
                    };
                });

                const newEdges = edges.map((edge) => ({
                    ...edge,
                    id: randomId(),
                    source: idMap[edge.source],
                    target: idMap[edge.target],
                }));

                rfInstance.setNodes([
                    ...rfInstance.getNodes().map((n) => ({ ...n, selected: false })),
                    ...newNodes,
                ]);

                rfInstance.setEdges([...rfInstance.getEdges(), ...newEdges]);
            }
        },
        [rfInstance]
    );


    useEffect(() => {
        window.addEventListener("copy", onCopyCapture);
        return () => {
            window.removeEventListener("copy", onCopyCapture);
        };
    }, [onCopyCapture]);

    useEffect(() => {
        window.addEventListener("paste", onPasteCapture);
        return () => {
            window.removeEventListener("paste", onPasteCapture);
        };
    }, [onPasteCapture]);
};
