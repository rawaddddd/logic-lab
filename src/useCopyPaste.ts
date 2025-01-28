import { useCallback, useEffect } from "react";
import { Circuit } from "./Simulation";
import { circuitToFlow } from "./transform";
import WireEdge from "./WireEdge";
import { CustomNodes } from "./Nodes";

export const useCopyPaste = (
  circuit: Circuit,
  setNodes: (nodes: CustomNodes[]) => void,
  setEdges: (edges: WireEdge[]) => void
) => {
  const onCopyCapture = useCallback((event: ClipboardEvent) => {
    event.preventDefault();
    const selectedInputPinIndices = circuit.inputPins
      .filter((inputPin) => inputPin.extraProperties.selected)
      .map(({ id }) => id);
    const selectedOutputPinIndices = circuit.outputPins
      .filter((outputPin) => outputPin.extraProperties.selected)
      .map(({ id }) => id);
    const selectedComponentIndices = circuit.components
      .filter((component) => component.extraProperties.selected)
      .map(({ id }) => id);

    event.clipboardData?.setData(
      "logic-lab:inputPins",
      JSON.stringify(selectedInputPinIndices)
    );
    event.clipboardData?.setData(
      "logic-lab:outputPins",
      JSON.stringify(selectedOutputPinIndices)
    );
    event.clipboardData?.setData(
      "logic-lab:components",
      JSON.stringify(selectedComponentIndices)
    );
  }, []);

  const onPasteCapture = useCallback((event: ClipboardEvent) => {
    event.preventDefault();

    const inputPinsIds = JSON.parse(
      event.clipboardData?.getData("logic-lab:inputPins") ?? "[]"
    ) as number[];
    const outputPinsIds = JSON.parse(
      event.clipboardData?.getData("logic-lab:outputPins") ?? "[]"
    ) as number[];
    const componentsIds = JSON.parse(
      event.clipboardData?.getData("logic-lab:components") ?? "[]"
    ) as number[];

    for (const inputPin of circuit.inputPins) {
      inputPin.extraProperties.selected = false;
    }
    for (const outputPin of circuit.outputPins) {
      outputPin.extraProperties.selected = false;
    }
    for (const component of circuit.components) {
      component.extraProperties.selected = false;
    }

    const { newInputPinIds, newOutputPinIds, newComponentIds } =
      circuit.duplicateComponents(inputPinsIds, outputPinsIds, componentsIds);

    for (const i of newInputPinIds) {
      const inputPin = circuit.getInputPin(i)!.extraProperties;
      inputPin.selected = true;
      if (inputPin.position !== undefined) {
        inputPin.position = {
          x: inputPin.position.x + 10,
          y: inputPin.position.y + 10,
        };
      }
    }
    for (const i of newOutputPinIds) {
      const outputPin = circuit.getOutputPin(i)!.extraProperties;
      outputPin.selected = true;
      if (outputPin.position !== undefined) {
        outputPin.position = {
          x: outputPin.position.x + 10,
          y: outputPin.position.y + 10,
        };
      }
    }
    for (const i of newComponentIds) {
      const component = circuit.getComponent(i)!.extraProperties;
      component.selected = true;
      if (component.position !== undefined) {
        component.position = {
          x: component.position.x + 10,
          y: component.position.y + 10,
        };
      }
    }

    const { nodes, edges } = circuitToFlow(circuit);
    setNodes(nodes);
    setEdges(edges);
  }, []);

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
