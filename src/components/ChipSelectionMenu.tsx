import { Draggable } from "./Draggable";
import {
  builtinCircuits,
  notGateChip,
  pullDownResistorChip,
  pullUpResistorChip,
  sevenSegmentDisplayChip,
  tristateBufferChip,
} from "@/Simulation";
import { NumberInput } from "./ui/number-input";
import { useState } from "react";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useSimulationStore } from "@/store";
import React from "react";
import { Button } from "./ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const ChipSelectionMenu = React.forwardRef<HTMLDivElement, {}>(({}, ref) => {
  const [numInputHandles, setNumInputHandles] = useState(2);
  const circuitDependencyMap = useSimulationStore(
    (state) => state.circuitManager.circuitDependencyMap
  );
  const circuitID = useSimulationStore((state) => state.circuit.id);
  const customChips = useSimulationStore((state) => state.customChips);
  const editChip = useSimulationStore((state) => state.editChip);
  const deleteChip = useSimulationStore((state) => state.deleteChip);

  return (
    <div ref={ref} className="p-4 flex flex-col items-center space-y-2">
      <div className="flex flex-row items-center space-x-2">
        <Label htmlFor="num-handles" className="text-nowrap dark:text-gray-50">
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
      <span className="font-thin text-gray-500 dark:text-gray-50">I/O</span>
      <Draggable id="INPUT" data={{ type: "input" }}>
        INPUT
      </Draggable>
      <Draggable id="OUTPUT" data={{ type: "output" }}>
        OUTPUT
      </Draggable>
      <Draggable
        id="Seven-Segment Display"
        data={{ type: "chip", component: sevenSegmentDisplayChip }}
      >
        Seven-Segment Display
      </Draggable>
      <Separator />
      <span className="font-thin text-gray-500 dark:text-gray-50">
        Built-in Tristate Logic Chips
      </span>
      <Draggable
        id="Pull-Up Resistor"
        data={{ type: "chip", component: pullUpResistorChip }}
      >
        Pull-Up Resistor
      </Draggable>
      <Draggable
        id="Pull-Down Resistor"
        data={{ type: "chip", component: pullDownResistorChip }}
      >
        Pull-Down Resistor
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
        Tristate Buffer
      </Draggable>
      <Separator />
      <span className="font-thin text-gray-500 dark:text-gray-50">
        Built-in Logic Gates
      </span>
      <Draggable id="NOT" data={{ type: "chip", component: notGateChip }}>
        NOT
      </Draggable>
      {builtinCircuits.slice(5).map((chip) => (
        <Draggable
          id={chip.name}
          key={chip.name}
          data={{
            type: "chip",
            component: { ...chip, numInputs: () => numInputHandles },
          }}
        >
          {chip.name}
        </Draggable>
      ))}
      {customChips.length > 0 && (
        <>
          <Separator />
          <span className="font-thin text-gray-500 dark:text-gray-50">
            Custom Chips
          </span>
          {customChips.map(({ chip, disabled }) => (
            <div key={chip.name} className="flex flex-row space-x-2">
              <Draggable
                id={chip.name}
                data={{
                  type: "chip",
                  component: chip,
                }}
                disabled={disabled}
              >
                {chip.name}
              </Draggable>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  editChip(chip);
                }}
              >
                <IconEdit className="dark:text-gray-50" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteChip(chip);
                }}
                disabled={
                  circuitID === chip.id ||
                  circuitDependencyMap.get(chip.id)?.size !== 0
                }
              >
                <IconTrash className="dark:text-gray-50" />
              </Button>
            </div>
          ))}
        </>
      )}
    </div>
  );
});

export default ChipSelectionMenu;
