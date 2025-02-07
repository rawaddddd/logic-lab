import { HslColor } from "colord";
import {
  andGateChip,
  Circuit,
  CompIO,
  Component,
  ID,
  IOPin,
  nandGateChip,
  norGateChip,
  notGateChip,
  orGateChip,
  pullDownResistorChip,
  pullUpResistorChip,
  tristateBufferChip,
} from "./Simulation";
import clone from "clone";

interface SerialisedCircuit {
  name: string;
  color: HslColor;
  inputPins: (IOPin & { id: ID })[];
  outputPins: (IOPin & { id: ID })[];
  components: (Omit<CompIO, "component" | "add_connection"> & {
    name: string;
    id: ID;
  })[];
}

export function serialise(circuits: Circuit[]): string {
  return JSON.stringify(
    circuits.map<SerialisedCircuit>(
      ({ name, color, inputPins, outputPins, components }) => ({
        name,
        color,
        inputPins: inputPins.map(({ extraProperties, ...rest }) => ({
          ...rest,
          extraProperties: { ...extraProperties, selected: undefined },
        })),
        outputPins: outputPins.map(({ extraProperties, ...rest }) => ({
          ...rest,
          extraProperties: { ...extraProperties, selected: undefined },
        })),
        components: components.map(
          ({ component, extraProperties, ...rest }) => ({
            ...rest,
            name: component.name,
            extraProperties: { ...extraProperties, selected: undefined },
          })
        ),
      })
    )
  );
}

const BUILTIN_CHIPS: { [key: string]: Component } = {
  NOT: notGateChip,
  AND: andGateChip,
  NAND: nandGateChip,
  OR: orGateChip,
  NOR: norGateChip,
  "Tristate Buffer": tristateBufferChip,
  "Pull-Up Resistor": pullUpResistorChip,
  "Pull-Down Resistor": pullDownResistorChip,
};

export function deserialise(json: string): Circuit[] {
  const parsed: SerialisedCircuit[] = JSON.parse(json);
  const circuitMap = new Map<string, Circuit>();
  const stack = new Set<string>(); // For cycle detection

  function buildCircuit(data: SerialisedCircuit): Circuit {
    if (stack.has(data.name)) {
      throw new Error(`Cyclic dependency detected for circuit "${data.name}"`);
    }

    if (circuitMap.has(data.name)) {
      return circuitMap.get(data.name)!;
    }

    stack.add(data.name);
    const circuit = new Circuit(data.name, 0, 0, []);
    circuit.color = data.color;
    circuitMap.set(data.name, circuit);

    // ID Mapping (old ID -> new ID)
    const inputIdMap = new Map<ID, ID>();
    const outputIdMap = new Map<ID, ID>();
    const componentIdMap = new Map<ID, ID>();

    // Restore input pins
    data.inputPins.forEach(({ id, value, extraProperties }) => {
      const newId = circuit.addInputPin({
        connections: [],
        value,
        extraProperties: { ...extraProperties },
      });
      inputIdMap.set(id, newId);
    });

    // Restore output pins
    data.outputPins.forEach(({ id, value, extraProperties }) => {
      const newId = circuit.addOutputPin({
        connections: [],
        value,
        extraProperties: { ...extraProperties },
      });
      outputIdMap.set(id, newId);
    });

    // Restore components
    data.components.forEach(({ id, name, extraProperties }) => {
      let component: Component | undefined =
        BUILTIN_CHIPS[name] ?? circuitMap.get(name);

      if (component === undefined) {
        const forwardDeclaredComponent = parsed.find((c) => c.name === name);
        if (forwardDeclaredComponent === undefined) {
          throw new Error(`Component "${name}" not found`);
        }
        component = buildCircuit(forwardDeclaredComponent);
      }

      const compIO = new CompIO(clone(component));
      compIO.extraProperties = { ...extraProperties };

      const newId = circuit.addComponent(compIO);
      componentIdMap.set(id, newId);
    });

    // Restore connections
    data.inputPins.forEach(({ id, connections }) => {
      const newId = inputIdMap.get(id)!;
      connections.forEach(({ componentId, inputIndex }) => {
        circuit.connectInputPin(
          newId,
          componentIdMap.get(componentId)!,
          inputIndex
        );
      });
    });

    data.outputPins.forEach(({ id, connections }) => {
      const newId = outputIdMap.get(id)!;
      connections.forEach(({ componentId, inputIndex }) => {
        circuit.connectOutputPin(
          newId,
          componentIdMap.get(componentId)!,
          inputIndex
        );
      });
    });

    data.components.forEach(({ id, connections }) => {
      const newId = componentIdMap.get(id)!;
      connections.forEach((targets, outputIndex) => {
        targets.forEach(({ componentId, inputIndex }) => {
          circuit.connectChip(
            newId,
            outputIndex,
            componentIdMap.get(componentId)!,
            inputIndex
          );
        });
      });
    });

    stack.delete(data.name);
    return circuit;
  }

  return parsed.map(buildCircuit);
}
