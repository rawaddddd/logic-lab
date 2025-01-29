import clone from "clone";

export type Bit = boolean | undefined;

export interface Index {
  componentId: number; // Index of the component in the components array
  inputIndex: number; // Index of the specific input in that component
}

export interface Component {
  name: string;
  numInputs: number;
  numOutputs: number;
  update: (input: Bit[]) => Bit[];
}

type ExtraProperties = {
  position?: {
    x: number;
    y: number;
  };
  selected?: boolean;
};

interface IOPin {
  connections: Index[]; // When used as an input pin, inputIndex works as usual. When used as an output pin, inputIndex is actually outputIndex
  value: Bit;
  extraProperties: ExtraProperties;
}

export class CompIO {
  component: Component;
  inputs: Bit[];
  outputs: Bit[];
  connections: Index[][]; // connections[outputId] -> indices of component that output pin is connected to
  extraProperties: ExtraProperties;

  constructor(component: Component) {
    this.component = component;
    this.inputs = new Array(component.numInputs).fill(undefined);
    this.outputs = new Array(component.numOutputs).fill(undefined);
    this.connections = Array.from({ length: component.numOutputs }, () => []);
    this.extraProperties = {};
  }

  add_connection(outputId: number, to: Index) {
    this.connections[outputId].push(to);
  }
}

type ID = number;

type WithID<T> = T extends new (...args: any[]) => infer R
  ? new (...args: ConstructorParameters<T>) => R & { id: ID }
  : T & { id: ID };

export class Circuit implements Component {
  name: string;
  numInputs: number;
  numOutputs: number;
  inputPins: WithID<IOPin>[];
  outputPins: WithID<IOPin>[];

  components: WithID<CompIO>[];

  inputPinIdMap: Map<ID, number>;
  outputPinIdMap: Map<ID, number>;
  componentIdMap: Map<ID, number>;

  inputId: ID = 0;
  outputId: ID = 0;
  componentId: ID = 0;

  constructor(
    name: string,
    numInputs: number,
    numOutputs: number,
    components: CompIO[]
  ) {
    this.name = name;
    this.numInputs = numInputs;
    this.numOutputs = numOutputs;

    this.inputPinIdMap = new Map();
    this.outputPinIdMap = new Map();
    this.componentIdMap = new Map();

    this.inputPins = [];
    this.outputPins = [];
    this.components = [];

    for (let i = 0; i < numInputs; i++) {
      this.addInputPin({
        connections: [] as Index[],
        value: undefined as Bit,
        extraProperties: {},
      });
    }
    for (let i = 0; i < numOutputs; i++) {
      this.addOutputPin({
        connections: [] as Index[],
        value: undefined as Bit,
        extraProperties: {},
      });
    }
    components.forEach((component) => {
      this.addComponent(component);
    });
  }

  public getInputPin(id: ID) {
    const index = this.inputPinIdMap.get(id);
    return index === undefined ? undefined : this.inputPins[index];
  }

  public getOutputPin(id: ID) {
    const index = this.outputPinIdMap.get(id);
    return index === undefined ? undefined : this.outputPins[index];
  }

  public getComponent(id: ID) {
    const index = this.componentIdMap.get(id);
    return index === undefined ? undefined : this.components[index];
  }

  public connectInputPin(inputId: ID, componentId: ID, inputIndex: number) {
    const inputIndexInArray = this.inputPinIdMap.get(inputId);
    const componentIndexInArray = this.componentIdMap.get(componentId);

    if (
      inputIndexInArray !== undefined &&
      componentIndexInArray !== undefined
    ) {
      this.inputPins[inputIndexInArray].connections.push({
        componentId,
        inputIndex,
      });
    }
  }

  public connectOutputPin(outputId: ID, componentId: ID, outputIndex: number) {
    const outputIndexInArray = this.outputPinIdMap.get(outputId);
    const componentIndexInArray = this.componentIdMap.get(componentId);

    if (
      outputIndexInArray !== undefined &&
      componentIndexInArray !== undefined
    ) {
      this.outputPins[outputIndexInArray].connections.push({
        componentId,
        inputIndex: outputIndex,
      });
    }
  }

  public connectChip(
    sourceChipId: ID,
    sourcePinIndex: number,
    targetChipId: ID,
    targetPinIndex: number
  ) {
    const sourceIndex = this.componentIdMap.get(sourceChipId);
    const targetIndex = this.componentIdMap.get(targetChipId);

    if (sourceIndex !== undefined && targetIndex !== undefined) {
      const sourceComponent = this.components[sourceIndex];
      sourceComponent.add_connection(sourcePinIndex, {
        componentId: targetChipId,
        inputIndex: targetPinIndex,
      });
    }
  }

  public disconnectInputPin(inputId: ID, componentId: ID, inputIndex: number) {
    const inputIndexInArray = this.inputPinIdMap.get(inputId);
    const componentIndexInArray = this.componentIdMap.get(componentId);

    if (
      inputIndexInArray !== undefined &&
      componentIndexInArray !== undefined
    ) {
      const index = this.inputPins[inputIndexInArray].connections.findIndex(
        (connection) =>
          connection.componentId === componentId &&
          connection.inputIndex === inputIndex
      );
      if (index > -1) {
        this.components[componentIndexInArray].inputs[inputIndex] = undefined;
        this.inputPins[inputIndexInArray].connections.splice(index, 1);
      }
    }
  }

  public disconnectOutputPin(
    outputId: ID,
    componentId: ID,
    outputIndex: number
  ) {
    const outputIndexInArray = this.outputPinIdMap.get(outputId);
    const componentIndexInArray = this.componentIdMap.get(componentId);

    if (
      outputIndexInArray !== undefined &&
      componentIndexInArray !== undefined
    ) {
      const index = this.outputPins[outputIndexInArray].connections.findIndex(
        (connection) =>
          connection.componentId === componentId &&
          connection.inputIndex === outputIndex
      );
      if (index > -1) {
        this.outputPins[outputIndexInArray].value = undefined;
        this.outputPins[outputIndexInArray].connections.splice(index, 1);
      }
    }
  }

  public disconnectChip(
    sourceChipId: ID,
    sourcePinIndex: number,
    targetChipId: ID,
    targetPinIndex: number
  ) {
    const sourceIndex = this.componentIdMap.get(sourceChipId);
    const targetIndex = this.componentIdMap.get(targetChipId);

    if (sourceIndex !== undefined && targetIndex !== undefined) {
      const sourceComponent = this.components[sourceIndex];
      const index = sourceComponent.connections[sourcePinIndex].findIndex(
        (connection) =>
          connection.componentId === targetChipId &&
          connection.inputIndex === targetPinIndex
      );
      if (index > -1) {
        this.components[targetIndex].inputs[targetPinIndex] = undefined;
        sourceComponent.connections[sourcePinIndex].splice(index, 1);
      }
    }
  }

  addInputPin(inputPin: IOPin): ID {
    const id = this.inputId++;
    this.inputPins.push({ ...inputPin, id });
    this.inputPinIdMap.set(id, this.inputPins.length - 1);
    return id;
  }

  addOutputPin(outputPin: IOPin): ID {
    const id = this.outputId++;
    this.outputPins.push({ ...outputPin, id });
    this.outputPinIdMap.set(id, this.outputPins.length - 1);
    return id;
  }

  public addComponent(component: CompIO): ID {
    const id = this.componentId++;
    const componentWithId = component as WithID<CompIO>;
    componentWithId.id = id;
    this.components.push(componentWithId);
    this.componentIdMap.set(id, this.components.length - 1);
    return id;
  }

  public removeInputPin(idToRemove: ID) {
    if (!this.inputPinIdMap.has(idToRemove)) {
      console.warn(
        `Tried to delete input pin that is not in the circuit. ID: ${idToRemove}`
      );
      return undefined;
    }

    const indexToRemove = this.inputPinIdMap.get(idToRemove)!;

    if (indexToRemove !== this.inputPins.length - 1) {
      const temp = this.inputPins[indexToRemove];
      this.inputPins[indexToRemove] = this.inputPins[this.inputPins.length - 1];
      this.inputPins[this.inputPins.length - 1] = temp;
      this.inputPinIdMap.set(this.inputPins[indexToRemove].id, indexToRemove);
    }
    this.inputPinIdMap.delete(idToRemove);

    return this.inputPins.pop();
  }

  public removeOutputPin(idToRemove: ID) {
    if (!this.outputPinIdMap.has(idToRemove)) {
      console.warn(
        `Tried to delete output pin that is not in the circuit. ID: ${idToRemove}`
      );
      return undefined;
    }

    const indexToRemove = this.outputPinIdMap.get(idToRemove)!;

    if (indexToRemove !== this.outputPins.length - 1) {
      const temp = this.outputPins[indexToRemove];
      this.outputPins[indexToRemove] =
        this.outputPins[this.outputPins.length - 1];
      this.outputPins[this.outputPins.length - 1] = temp;
      this.outputPinIdMap.set(this.outputPins[indexToRemove].id, indexToRemove);
    }
    this.outputPinIdMap.delete(idToRemove);

    return this.outputPins.pop();
  }

  public removeComponent(idToRemove: ID) {
    if (!this.componentIdMap.has(idToRemove)) {
      console.warn(
        `Tried to delete component that is not in the circuit. ID: ${idToRemove}`
      );
      return undefined;
    }

    // replace the deleted element with the last element in the array instead of shifting all elements
    const indexToRemove = this.componentIdMap.get(idToRemove)!;

    if (indexToRemove !== this.components.length - 1) {
      const temp = this.components[indexToRemove];
      this.components[indexToRemove] =
        this.components[this.components.length - 1];
      this.components[this.components.length - 1] = temp;
      this.componentIdMap.set(this.components[indexToRemove].id, indexToRemove);
    }
    this.componentIdMap.delete(idToRemove);

    const deletedComponent = this.components.pop();

    // remove connections to component
    // TODO maybe move this into a clean up method instead of calling it every time a component is deleted
    for (let inputPin of this.inputPins) {
      inputPin.connections = inputPin.connections.filter(
        (connection) => connection.componentId !== idToRemove
      );
    }
    for (let outputPin of this.outputPins) {
      outputPin.connections = outputPin.connections.filter(
        (connection) => connection.componentId !== idToRemove
      );
    }
    for (let component of this.components) {
      for (let connections of component.connections) {
        connections = connections.filter(
          (connection) => connection.componentId !== idToRemove
        );
      }
    }

    return deletedComponent;
  }

  public getInternalConnections(
    inputPinIds: ID[],
    outputPinIds: ID[],
    componentIds: ID[]
  ) {
    const inputConnections = inputPinIds.map((inputId) =>
      this.getInputPin(inputId)!.connections.filter((connection) =>
        componentIds.includes(connection.componentId)
      )
    );

    const outputConnections = outputPinIds.map((outputId) =>
      this.getOutputPin(outputId)!.connections.filter((connection) =>
        componentIds.includes(connection.componentId)
      )
    );

    const componentConnections = componentIds.map((componentId) =>
      this.getComponent(componentId)!.connections.map((connection) =>
        connection.filter((connection) =>
          componentIds.includes(connection.componentId)
        )
      )
    );

    return {
      inputConnections,
      outputConnections,
      componentConnections,
    };
  }

  public getHangingPins(
    inputConnections: Index[][],
    componentConnections: Index[][][],
    componentIds: ID[]
  ) {
    return componentIds.map((componentId) => {
      const numInputs = this.getComponent(componentId)!.component.numInputs;
      return [...Array(numInputs).keys()].filter(
        (componentInputPin) =>
          !(
            inputConnections.some((inputPin) =>
              inputPin.some(
                (connection) =>
                  connection.componentId === componentId &&
                  connection.inputIndex === componentInputPin
              )
            ) ||
            componentConnections.some((component) =>
              component.some((outputPin) =>
                outputPin.some(
                  (connection) =>
                    connection.componentId === componentId &&
                    connection.inputIndex === componentInputPin
                )
              )
            )
          )
      );
    });
  }

  public duplicateComponents(
    inputPinIds: ID[],
    outputPinIds: ID[],
    componentIds: ID[]
  ) {
    const { inputConnections, outputConnections, componentConnections } =
      this.getInternalConnections(inputPinIds, outputPinIds, componentIds);

    const hangingPins = this.getHangingPins(
      inputConnections,
      componentConnections,
      componentIds
    );

    const inputPinIdsMap = new Map<ID, ID>();
    inputPinIds.forEach((originalId) =>
      inputPinIdsMap.set(
        originalId,
        this.addInputPin(clone(this.getInputPin(originalId)!))
      )
    );
    const outputPinIdsMap = new Map<ID, ID>();
    outputPinIds.forEach((originalId) =>
      outputPinIdsMap.set(
        originalId,
        this.addOutputPin(clone(this.getOutputPin(originalId)!))
      )
    );
    const componentIdsMap = new Map<ID, ID>();
    componentIds.forEach((originalId, i) => {
      const component = clone(this.getComponent(originalId)!);
      hangingPins[i].forEach(
        (hangingPin) => (component.inputs[hangingPin] = undefined)
      );
      componentIdsMap.set(originalId, this.addComponent(component));
    });

    const newInputConnections = inputConnections.map((inputPin) =>
      inputPin.map(
        (connection) =>
          ({
            ...connection,
            componentId: componentIdsMap.get(connection.componentId)!,
          } as Index)
      )
    );
    const newOutputConnections = outputConnections.map((outputPin) =>
      outputPin.map(
        (connection) =>
          ({
            ...connection,
            componentId: componentIdsMap.get(connection.componentId)!,
          } as Index)
      )
    );
    const newComponentConnections = componentConnections.map((component) =>
      component.map((outputPin) =>
        outputPin.map(
          (connection) =>
            ({
              ...connection,
              componentId: componentIdsMap.get(connection.componentId)!,
            } as Index)
        )
      )
    );

    const newInputPinIds = Array.from(inputPinIdsMap.values());
    newInputPinIds.forEach((inputPinId, i) => {
      this.getInputPin(inputPinId)!.connections = newInputConnections[i];
    });
    const newOutputPinIds = Array.from(outputPinIdsMap.values());
    newOutputPinIds.forEach((outputPinId, i) => {
      this.getOutputPin(outputPinId)!.connections = newOutputConnections[i];
    });
    const newComponentIds = Array.from(componentIdsMap.values());
    newComponentIds.forEach((componentId, i) => {
      this.getComponent(componentId)!.connections = newComponentConnections[i];
    });

    return {
      newInputPinIds,
      newOutputPinIds,
      newComponentIds,
    };
  }

  public update(input: Bit[]): Bit[] {
    this.propagate_input(input);
    this.update_components();
    this.propagate_internal_signals();
    this.propagate_output();
    return this.output();
  }

  propagate(componentIndex: number) {
    const connections = this.components[componentIndex].connections;
    connections.forEach((to, out_id) => {
      to.forEach((i) => {
        if (this.componentIdMap.has(i.componentId)) {
          this.components[this.componentIdMap.get(i.componentId)!].inputs[
            i.inputIndex
          ] = this.components[componentIndex].outputs[out_id];
        }
      });
    });
  }

  propagate_input(input: Bit[]) {
    this.inputPins = this.inputPins.map((inputPin, i) => ({
      ...inputPin,
      value: input[i],
    }));

    this.inputPins.forEach((inputPin) => {
      inputPin.connections.forEach((i) => {
        if (this.componentIdMap.has(i.componentId)) {
          this.components[this.componentIdMap.get(i.componentId)!].inputs[
            i.inputIndex
          ] = inputPin.value;
        }
      });
    });
  }

  update_components() {
    for (let component of this.components) {
      component.outputs = component.component.update(component.inputs);
    }
  }

  propagate_internal_signals() {
    for (let c = 0; c < this.components.length; c++) {
      this.propagate(c);
    }
  }

  propagate_output() {
    this.outputPins.forEach((outputPin) => {
      outputPin.connections.forEach((i) => {
        if (this.componentIdMap.has(i.componentId)) {
          outputPin.value =
            this.components[this.componentIdMap.get(i.componentId)!].outputs[
              i.inputIndex
            ];
        }
      });
    });
  }

  output(): Bit[] {
    return this.outputPins.map((outputPin) => outputPin.value);
  }
}

export function not(input: Bit[]): Bit[] {
  if (input[0] === undefined) {
    return [undefined];
  }
  return [!input[0]];
}

export function and(input: Bit[]): Bit[] {
  let hasUndefinedInput = false;
  for (let a of input) {
    if (a === false) return [false];
    if (a === undefined) hasUndefinedInput = true;
  }
  if (hasUndefinedInput) {
    return [undefined];
  }
  return [true];
}

export function nand(input: Bit[]): Bit[] {
  let hasUndefinedInput = false;
  for (let a of input) {
    if (a === false) return [true];
    if (a === undefined) hasUndefinedInput = true;
  }
  if (hasUndefinedInput) {
    return [undefined];
  }
  return [false];
}

export function or(input: Bit[]): Bit[] {
  let hasUndefinedInput = false;
  for (let a of input) {
    if (a === true) return [true];
    if (a === undefined) hasUndefinedInput = true;
  }
  if (hasUndefinedInput) {
    return [undefined];
  }
  return [false];
}

export function nor(input: Bit[]): Bit[] {
  let hasUndefinedInput = false;
  for (let a of input) {
    if (a === true) return [false];
    if (a === undefined) hasUndefinedInput = true;
  }
  if (hasUndefinedInput) {
    return [undefined];
  }
  return [true];
}

export const notGateChip = {
  name: "NOT",
  numInputs: 1,
  numOutputs: 1,
  update: not,
};

export const andGateChip = {
  name: "AND",
  numInputs: 2,
  numOutputs: 1,
  update: and,
};

export const nandGateChip = {
  name: "NAND",
  numInputs: 2,
  numOutputs: 1,
  update: nand,
};

export const orGateChip = {
  name: "OR",
  numInputs: 2,
  numOutputs: 1,
  update: or,
};

export const norGateChip = {
  name: "NOR",
  numInputs: 2,
  numOutputs: 1,
  update: nor,
};

export const builtinCircuits: Component[] = [
  notGateChip,
  andGateChip,
  nandGateChip,
  orGateChip,
  norGateChip,
];
