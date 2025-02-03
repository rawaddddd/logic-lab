import { Circuit } from "./Simulation";
import { CustomNodes } from "./components/nodes/Nodes";
import WireEdge from "./components/nodes/WireEdge";

export function circuitToFlow(circuit: Circuit): {
  nodes: CustomNodes[];
  edges: WireEdge[];
} {
  const nodes: CustomNodes[] = [];

  // Add chip nodes
  circuit.components.forEach((component) => {
    nodes.push({
      id: `chip-${component.id}`,
      type: "chip",
      position: component.extraProperties.position ?? {
        x: 200 * component.id,
        y: 200,
      },
      selected: component.extraProperties.selected,
      data: {
        name: component.component.name,
        inputs: component.inputs,
        outputs: component.outputs,
        inputNames: component.component.inputNames(),
        outputNames: component.component.outputNames(),
        id: component.id,
      },
    });
  });

  // Add input nodes
  circuit.inputPins.forEach((inputPin) => {
    nodes.push({
      id: `input-${inputPin.id}`,
      type: "input",
      position: inputPin.extraProperties.position ?? {
        x: 100 * inputPin.id,
        y: 0,
      },
      selected: inputPin.extraProperties.selected,
      data: {
        name: inputPin.extraProperties.name,
        state: inputPin.value,
        id: inputPin.id,
      },
    });
  });

  // Add output nodes
  circuit.outputPins.forEach((outputPin) => {
    nodes.push({
      id: `output-${outputPin.id}`,
      type: "output",
      position: outputPin.extraProperties.position ?? {
        x: 100 * outputPin.id,
        y: 400,
      },
      selected: outputPin.extraProperties.selected,
      data: {
        name: outputPin.extraProperties.name,
        state: outputPin.value,
        id: outputPin.id,
      },
    });
  });

  // Generate edges
  const edges: WireEdge[] = [];

  // Internal chip connections
  circuit.components.forEach((component) => {
    component.connections.forEach((connections, outputIndex) => {
      connections.forEach((targetIndex) => {
        edges.push({
          id: `chip-${component.id}-${outputIndex}->chip-${targetIndex.componentId}-${targetIndex.inputIndex}`,
          source: `chip-${component.id}`,
          sourceHandle: `output-${outputIndex}`,
          target: `chip-${targetIndex.componentId}`,
          targetHandle: `input-${targetIndex.inputIndex}`,
          type: "custom",
          data: { sourceHandleIndex: outputIndex },
        });
      });
    });
  });

  // Input chip connections
  circuit.inputPins.forEach((inputPin) => {
    inputPin.connections.forEach((targetIndex) => {
      edges.push({
        id: `input-${inputPin.id}->chip-${targetIndex.componentId}-${targetIndex.inputIndex}`,
        source: `input-${inputPin.id}`,
        sourceHandle: undefined,
        target: `chip-${targetIndex.componentId}`,
        targetHandle: `input-${targetIndex.inputIndex}`,
        type: "custom",
        data: { sourceHandleIndex: 0 },
      });
    });
  });

  // Output chip connections
  circuit.outputPins.forEach((outputPin) => {
    outputPin.connections.forEach((targetIndex) => {
      edges.push({
        id: `output-${outputPin.id}->chip-${targetIndex.componentId}-${targetIndex.inputIndex}`,
        source: `chip-${targetIndex.componentId}`,
        sourceHandle: `output-${targetIndex.inputIndex}`,
        target: `output-${outputPin.id}`,
        targetHandle: undefined,
        type: "custom",
        data: { sourceHandleIndex: 0 },
      });
    });
  });

  return { nodes, edges };
}
