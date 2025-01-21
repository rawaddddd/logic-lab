import { Circuit } from "./Simulation";
import { CustomNodes } from "./Nodes";
import WireEdge from "./WireEdge";

export function circuitToFlow(circuit: Circuit): {
  nodes: CustomNodes[];
  edges: WireEdge[];
} {
  const nodes: CustomNodes[] = [];

  // Add chip nodes
  circuit.components.forEach((component, index) => {
    nodes.push({
      id: `chip-${index}`,
      type: "chip",
      position: component.extraProperties.position ?? {
        x: 200 * index,
        y: 200,
      },
      selected: component.extraProperties.selected,
      data: {
        name: component.component.name,
        inputs: component.inputs,
        outputs: component.outputs,
        index,
      },
    });
  });

  // Add input nodes
  circuit.inputPins.forEach((inputPin, index) => {
    nodes.push({
      id: `input-${index}`,
      type: "input",
      position: inputPin.extraProperties.position ?? { x: 100 * index, y: 0 },
      selected: inputPin.extraProperties.selected,
      data: { state: inputPin.value, index },
    });
  });

  // Add output nodes
  circuit.outputPins.forEach((outputPin, index) => {
    nodes.push({
      id: `output-${index}`,
      type: "output",
      position: outputPin.extraProperties.position ?? {
        x: 100 * index,
        y: 400,
      },
      selected: outputPin.extraProperties.selected,
      data: { state: outputPin.value, index },
    });
  });

  // Generate edges
  const edges: WireEdge[] = [];

  // Internal chip connections
  circuit.components.forEach((component, componentIndex) => {
    component.connections.forEach((connections, outputIndex) => {
      connections.forEach((targetIndex) => {
        edges.push({
          id: `chip-${componentIndex}-${outputIndex}->chip-${targetIndex.componentIndex}-${targetIndex.inputIndex}`,
          source: `chip-${componentIndex}`,
          sourceHandle: `output-${outputIndex}`,
          target: `chip-${targetIndex.componentIndex}`,
          targetHandle: `input-${targetIndex.inputIndex}`,
          type: "custom",
          data: { sourceHandleIndex: outputIndex },
        });
      });
    });
  });

  // Input chip connections
  circuit.inputPins.forEach((inputPin, inputIndex) => {
    inputPin.connections.forEach((targetIndex) => {
      edges.push({
        id: `input-${inputIndex}->chip-${targetIndex.componentIndex}-${targetIndex.inputIndex}`,
        source: `input-${inputIndex}`,
        sourceHandle: undefined,
        target: `chip-${targetIndex.componentIndex}`,
        targetHandle: `input-${targetIndex.inputIndex}`,
        type: "custom",
        data: { sourceHandleIndex: 0 },
      });
    });
  });

  // Output chip connections
  circuit.outputPins.forEach((outputPin, outputIndex) => {
    outputPin.connections.forEach((targetIndex) => {
      edges.push({
        id: `output-${outputIndex}->chip-${targetIndex.componentIndex}-${targetIndex.inputIndex}`,
        source: `chip-${targetIndex.componentIndex}`,
        sourceHandle: `output-${targetIndex.inputIndex}`,
        target: `output-${outputIndex}`,
        targetHandle: undefined,
        type: "custom",
        data: { sourceHandleIndex: 0 },
      });
    });
  });

  return { nodes, edges };
}
