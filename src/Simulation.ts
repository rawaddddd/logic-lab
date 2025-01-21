import clone from "clone";

export type Bit = boolean | undefined;

export interface Index {
  componentIndex: number; // Index of the component in the components array
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

export class Circuit implements Component {
  name: string;
  numInputs: number;
  numOutputs: number;
  inputPins: IOPin[];
  outputPins: IOPin[];

  components: CompIO[];

  constructor(
    name: string,
    numInputs: number,
    numOutputs: number,
    components: CompIO[]
  ) {
    this.name = name;
    this.numInputs = numInputs;
    this.numOutputs = numOutputs;
    this.inputPins = Array.from({ length: numInputs }, () => ({
      connections: [] as Index[],
      value: undefined as Bit,
      extraProperties: {},
    }));
    this.outputPins = Array.from({ length: numOutputs }, () => ({
      connections: [] as Index[],
      value: undefined as Bit,
      extraProperties: {},
    }));
    this.components = components;
  }

  public connectInputPin(
    inputPin: number,
    componentIndex: number,
    inputIndex: number
  ) {
    this.inputPins[inputPin].connections.push({
      componentIndex,
      inputIndex,
    });
  }

  public connectOutputPin(
    outputPin: number,
    componentIndex: number,
    outputIndex: number
  ) {
    this.outputPins[outputPin].connections.push({
      componentIndex,
      inputIndex: outputIndex,
    });
  }

  public removeComponent(indexToRemove: number) {
    // remove component
    this.components.splice(indexToRemove, 1);

    // remove connections to component
    for (let component of this.components) {
      for (let connections of component.connections) {
        connections = connections.filter(
          (connection) => connection.componentIndex != indexToRemove
        );
      }
    }

    // decrement indices of connections to components after the component to delete
    for (let component of this.components) {
      for (let connections of component.connections) {
        connections = connections.map((connection) => ({
          ...connection,
          componentId:
            connection.componentIndex > indexToRemove
              ? connection.componentIndex - 1
              : connection.componentIndex,
        }));
      }
    }
  }

  public getInternalConnections(
    inputPinIndices: number[],
    outputPinIndices: number[],
    componentIndices: number[]
  ) {
    const inputConnections = inputPinIndices.map((inputIndex) =>
      this.inputPins[inputIndex].connections.filter((connection) =>
        componentIndices.includes(connection.componentIndex)
      )
    );

    const outputConnections = outputPinIndices.map((outputIndex) =>
      this.outputPins[outputIndex].connections.filter((connection) =>
        componentIndices.includes(connection.componentIndex)
      )
    );

    const componentConnections = componentIndices.map((componentIndex) =>
      this.components[componentIndex].connections.map((connection) =>
        connection.filter((connection) =>
          componentIndices.includes(connection.componentIndex)
        )
      )
    );

    return {
      inputConnections,
      outputConnections,
      componentConnections,
    };
  }

  public duplicateComponents(
    inputPinIndices: number[],
    outputPinIndices: number[],
    componentIndices: number[]
  ) {
    const { inputConnections, outputConnections, componentConnections } =
      this.getInternalConnections(
        inputPinIndices,
        outputPinIndices,
        componentIndices
      );

    const newInputPinIndices = new Map<number, number>();
    inputPinIndices.forEach((originalIndex, index) =>
      newInputPinIndices.set(originalIndex, this.inputPins.length + index)
    );
    const newOutputPinIndices = new Map<number, number>();
    outputPinIndices.forEach((originalIndex, index) =>
      newOutputPinIndices.set(originalIndex, this.outputPins.length + index)
    );
    const newComponentIndices = new Map<number, number>();
    componentIndices.forEach((originalIndex, index) =>
      newComponentIndices.set(originalIndex, this.components.length + index)
    );

    const newInputConnections = inputConnections.map((inputPin) =>
      inputPin.map(
        (connection) =>
          ({
            ...connection,
            componentIndex: newComponentIndices.get(connection.componentIndex)!,
          } as Index)
      )
    );
    const newOutputConnections = outputConnections.map((outputPin) =>
      outputPin.map(
        (connection) =>
          ({
            ...connection,
            componentIndex: newComponentIndices.get(connection.componentIndex)!,
          } as Index)
      )
    );
    const newComponentConnections = componentConnections.map((component) =>
      component.map((outputPin) =>
        outputPin.map(
          (connection) =>
            ({
              ...connection,
              componentIndex: newComponentIndices.get(
                connection.componentIndex
              )!,
            } as Index)
        )
      )
    );

    inputPinIndices.forEach((inputPinIndex) => {
      const inputPin = {
        ...clone(this.inputPins[inputPinIndex]),
        connections: newInputConnections[inputPinIndex] ?? [],
      };
      console.log(newInputConnections);
      console.log(inputPin);
      this.inputPins.push(inputPin);
    });
    outputPinIndices.forEach((outputPinIndex) => {
      const outputPin = {
        ...clone(this.outputPins[outputPinIndex]),
        connections: newOutputConnections[outputPinIndex] ?? [],
      };
      console.log(outputPin);
      this.outputPins.push(outputPin);
    });
    componentIndices.forEach((componentIndex) => {
      const newComponent = new CompIO(
        this.components[componentIndex].component
      );
      newComponent.connections = newComponentConnections[componentIndex];
      this.components.push(newComponent);
    });
  }

  public addComponent(component: CompIO) {
    this.components.push(component);
  }

  public update(input: Bit[]): Bit[] {
    this.propagate_input(input);
    this.update_components();
    this.propagate_internal_signals();
    this.propagate_output();
    return this.output();
  }

  propagate(componentId: number) {
    const connections = this.components[componentId].connections;
    connections.forEach((to, out_id) => {
      to.forEach((i) => {
        this.components[i.componentIndex].inputs[i.inputIndex] =
          this.components[componentId].outputs[out_id];
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
        this.components[i.componentIndex].inputs[i.inputIndex] = inputPin.value;
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
        outputPin.value =
          this.components[i.componentIndex].outputs[i.inputIndex];
      });
    });
  }

  output(): Bit[] {
    return this.outputPins.map((outputPin) => outputPin.value);
  }
}

export function not(input: [Bit]): Bit[] {
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
