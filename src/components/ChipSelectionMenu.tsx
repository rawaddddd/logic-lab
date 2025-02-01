import { Draggable } from "./Draggable";
import {
  builtinCircuits,
  notGateChip,
  pullDownResistorChip,
  pullUpResistorChip,
  tristateBufferChip,
} from "@/Simulation";
import { NumberInput } from "./ui/numberInput";
import { useState } from "react";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useSimulationStore } from "@/store";

function ChipSelectionMenu() {
  const [numInputHandles, setNumInputHandles] = useState(2);
  const customChips = useSimulationStore((state) => state.customChips);

  return (
    <>
      <div className="flex flex-row items-center space-x-2">
        <Label htmlFor="num-handles" className="text-nowrap">
          Input pins:
        </Label>
        <NumberInput
          id="num-handles"
          min={2}
          value={numInputHandles}
          className="w-20"
          onValueChange={(value) => {
            if (value !== undefined) setNumInputHandles(value);
          }}
        />
      </div>
      <Separator />
      <span className="font-thin text-gray-500">I/O</span>
      <Draggable id="INPUT" data={{ type: "input" }}>
        <div>INPUT</div>
      </Draggable>
      <Draggable id="OUTPUT" data={{ type: "output" }}>
        <div>OUTPUT</div>
      </Draggable>
      <Separator />
      <span className="font-thin text-gray-500">
        Built-in Tristate Logic Chips
      </span>
      <Draggable
        id="Pull-Up Resistor"
        data={{ type: "chip", component: pullUpResistorChip }}
      >
        <div>Pull-Up Resistor</div>
      </Draggable>
      <Draggable
        id="Pull-Down Resistor"
        data={{ type: "chip", component: pullDownResistorChip }}
      >
        <div>Pull-Down Resistor</div>
      </Draggable>
      <Draggable
        id="Tristate Buffer"
        data={{
          type: "chip",
          component: {
            ...tristateBufferChip,
            numInputs: () => numInputHandles,
            numOutputs: () => numInputHandles - 1,
          },
        }}
      >
        <div>Tristate Buffer</div>
      </Draggable>
      <Separator />
      <span className="font-thin text-gray-500">Built-in Logic Gates</span>
      <Draggable id="NOT" data={{ type: "chip", component: notGateChip }}>
        <div>NOT</div>
      </Draggable>
      {builtinCircuits.slice(4).map((chip) => (
        <Draggable
          id={chip.name}
          key={chip.name}
          data={{
            type: "chip",
            component: { ...chip, numInputs: () => numInputHandles },
          }}
        >
          <div>{chip.name}</div>
        </Draggable>
      ))}
      {customChips.length > 0 && (
        <>
          <Separator />
          <span className="font-thin text-gray-500">Custom Chips</span>
          {customChips.map((chip) => (
            <Draggable
              id={chip.name}
              key={chip.name}
              data={{
                type: "chip",
                component: chip,
              }}
            >
              <div>{chip.name}</div>
            </Draggable>
          ))}
        </>
      )}
    </>
  );
}

export default ChipSelectionMenu;
