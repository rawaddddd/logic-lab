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
import {
  IconEdit,
  IconLock,
  IconLockOpen2,
  IconTrash,
} from "@tabler/icons-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDndMonitor } from "@dnd-kit/core";
import { DragEndEvent } from "@/typedDnd";
import { DragData, DropData } from "@/sidebarDnd";
import { Sortable } from "./Sortable";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { TooltipPortal } from "@radix-ui/react-tooltip";

const ChipSelectionMenu = React.forwardRef<HTMLDivElement, {}>(({}, ref) => {
  const [numInputHandles, setNumInputHandles] = useState(2);
  const circuitDependencyMap = useSimulationStore(
    (state) => state.circuitManager.circuitDependencyMap
  );
  const circuitID = useSimulationStore((state) => state.circuit.id);
  const customChips = useSimulationStore((state) => state.customChips);
  const setCustomChips = useSimulationStore((state) => state.setCustomChips);
  const editChip = useSimulationStore((state) => state.editChip);
  const deleteChip = useSimulationStore((state) => state.deleteChip);
  const [allowReordering, setAllowReordering] = useState(false);

  function onDragEnd(event: DragEndEvent<DragData, DropData>) {
    if (!allowReordering) return;

    const { active, over } = event;
    if (over === null) return;

    if (active.id !== over.id) {
      const oldIndex = customChips.findIndex(
        ({ chip }) => chip.id === active.id
      );
      const newIndex = customChips.findIndex(({ chip }) => chip.id === over.id);

      if (newIndex === -1) return;
      setCustomChips(arrayMove(customChips, oldIndex, newIndex));
    }
  }
  useDndMonitor({ onDragEnd });

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
        <SortableContext
          items={customChips.map(({ chip }) => chip.id)}
          strategy={verticalListSortingStrategy}
        >
          <Separator />
          <div className="flex flex-row space-x-2">
            <span className="font-thin text-gray-500 dark:text-gray-50">
              Custom Chips
            </span>
            <Separator orientation="vertical" className="h-auto self-stretch" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 dark:text-gray-50"
                  onClick={() => setAllowReordering(!allowReordering)}
                >
                  {allowReordering ? <IconLockOpen2 /> : <IconLock />}
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  {allowReordering ? "Lock Sorting" : "Unlock Sorting"}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </div>
          {customChips.map(({ chip, disabled }) => (
            <ContextMenu key={chip.id}>
              <ContextMenuTrigger>
                <Sortable
                  id={chip.id}
                  data={{
                    type: "chip",
                    component: chip,
                  }}
                  disabled={disabled}
                  sortingDisabled={!allowReordering}
                  noDrop
                >
                  {chip.name}
                </Sortable>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    editChip(chip);
                  }}
                  className="flex flex-row gap-2"
                >
                  <IconEdit className="w-4 h-4" />
                  Edit
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    deleteChip(chip);
                  }}
                  disabled={
                    circuitID === chip.id ||
                    circuitDependencyMap.get(chip.id)?.size !== 0
                  }
                  className="flex flex-row gap-2 text-red-500 focus:text-gray-50 focus:bg-red-600/75 dark:focus:text-gray-50 dark:focus:bg-red-600/75"
                >
                  <IconTrash className="w-4 h-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </SortableContext>
      )}
    </div>
  );
});

export default ChipSelectionMenu;
