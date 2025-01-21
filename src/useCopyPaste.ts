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
      .map((inputPin, index) => ({ inputPin, index }))
      .filter(({ inputPin }) => inputPin.extraProperties.selected)
      .map(({ index }) => index);
    const selectedOutputPinIndices = circuit.outputPins
      .map((outputPin, index) => ({ outputPin, index }))
      .filter(({ outputPin }) => outputPin.extraProperties.selected)
      .map(({ index }) => index);
    const selectedComponentIndices = circuit.components
      .map((component, index) => ({ component, index }))
      .filter(({ component }) => component.extraProperties.selected)
      .map(({ index }) => index);

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

    const inputPinsIndices = JSON.parse(
      event.clipboardData?.getData("logic-lab:inputPins") ?? "[]"
    ) as number[];
    const outputPinsIndices = JSON.parse(
      event.clipboardData?.getData("logic-lab:outputPins") ?? "[]"
    ) as number[];
    const componentsIndices = JSON.parse(
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

    const duplicateComponentsStartIndices = {
      inputPins: circuit.inputPins.length,
      outputPins: circuit.outputPins.length,
      components: circuit.components.length,
    };

    circuit.duplicateComponents(
      inputPinsIndices,
      outputPinsIndices,
      componentsIndices
    );

    for (
      let i = duplicateComponentsStartIndices.inputPins;
      i < circuit.inputPins.length;
      i++
    ) {
      const inputPin = circuit.inputPins[i].extraProperties;
      inputPin.selected = true;
      if (inputPin.position !== undefined) {
        inputPin.position = {
          x: inputPin.position.x + 10,
          y: inputPin.position.y + 10,
        };
      }
    }
    for (
      let i = duplicateComponentsStartIndices.outputPins;
      i < circuit.outputPins.length;
      i++
    ) {
      const outputPin = circuit.outputPins[i].extraProperties;
      outputPin.selected = true;
      if (outputPin.position !== undefined) {
        outputPin.position = {
          x: outputPin.position.x + 10,
          y: outputPin.position.y + 10,
        };
      }
    }
    for (
      let i = duplicateComponentsStartIndices.components;
      i < circuit.components.length;
      i++
    ) {
      const component = circuit.components[i].extraProperties;
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
