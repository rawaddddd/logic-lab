import { useSimulationStore } from "@/store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import React from "react";
import { HslColorPicker } from "react-colorful";
import { colord, HslColor } from "colord";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { NumberInput } from "./ui/number-input";
import {
  IconDice1,
  IconDice2,
  IconDice3,
  IconDice4,
  IconDice5,
  IconDice6,
} from "@tabler/icons-react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn, randomInt } from "@/lib/utils";

const diceIcons = [
  IconDice1,
  IconDice2,
  IconDice3,
  IconDice4,
  IconDice5,
  IconDice6,
];

function randomColor() {
  return {
    h: randomInt(0, 360),
    s: randomInt(42, 98),
    l: randomInt(40, 90),
  };
}

const ChipCreationMenu = React.forwardRef<HTMLButtonElement, {}>(({}, ref) => {
  const saveChip = useSimulationStore((state) => state.saveChip);
  const circuitName = useSimulationStore((state) => state.circuit.name);
  const [name, setName] = useState(circuitName);
  const [color, setColor] = useState<HslColor>(randomColor());
  const [hexColor, setHexColor] = useState("");
  const hexInputRef = useRef<HTMLInputElement | null>(null);
  const randomiseButtonRef = useRef<HTMLButtonElement | null>(null);
  const [currentDice, setCurrentDice] = useState(() => IconDice6);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const isFocused = document.activeElement === hexInputRef.current;
    if (!isFocused) setHexColor(colord(color).toHex());
  }, [color]);

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div>
        <DialogTrigger asChild>
          <Button ref={ref} className="h-full text-md shadow-md">
            Save chip
          </Button>
        </DialogTrigger>
      </div>
      <DialogPortal>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveChip(name, color);
            setOpen(false);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="dark:text-gray-50">Save chip</DialogTitle>
              <DialogDescription>
                Convert the current circuit into a reusable chip.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-[1fr,5fr] items-center gap-4">
              <Label htmlFor="name" className="text-right dark:text-gray-50">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Chip Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
              />
              <Label htmlFor="color" className="text-right dark:text-gray-50">
                Color
              </Label>
              <div className="flex flex-row items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="color"
                      variant="outline"
                      className="p-2 aspect-square"
                    >
                      <span
                        className="w-full h-full rounded-sm"
                        style={{
                          backgroundColor: colord(color).toHslString(),
                        }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-fit"
                    onInteractOutside={(event) => {
                      if (event.target === randomiseButtonRef.current)
                        event.preventDefault();
                    }}
                  >
                    <div className="flex flex-row">
                      <HslColorPicker
                        id="color"
                        color={color}
                        onChange={setColor}
                        className="w-48"
                      />
                      <div className="grid grid-cols-[1fr,1fr] items-center gap-4 h-fit w-48">
                        <Label
                          htmlFor="hue"
                          className="text-right dark:text-gray-50"
                        >
                          Hue
                        </Label>
                        <NumberInput
                          id="hue"
                          min={0}
                          max={360}
                          suffix="°"
                          value={color.h}
                          onValueChange={(value) => {
                            if (value !== undefined) {
                              console.log("here");
                              setColor((color) => ({ ...color, h: value }));
                            }
                          }}
                        />
                        <Label
                          htmlFor="saturation"
                          className="text-right dark:text-gray-50"
                        >
                          Saturation
                        </Label>
                        <NumberInput
                          id="saturation"
                          min={0}
                          max={100}
                          suffix="%"
                          value={color.s}
                          onValueChange={(value) => {
                            if (value !== undefined) {
                              setColor((color) => ({ ...color, s: value }));
                            }
                          }}
                        />
                        <Label
                          htmlFor="lightness"
                          className="text-right dark:text-gray-50"
                        >
                          Lightness
                        </Label>
                        <NumberInput
                          id="lightness"
                          min={0}
                          max={100}
                          suffix="%"
                          value={color.l}
                          onValueChange={(value) => {
                            if (value !== undefined) {
                              setColor((color) => ({ ...color, l: value }));
                            }
                          }}
                        />
                        <Label
                          htmlFor="hex"
                          className="text-right dark:text-gray-50"
                        >
                          HEX
                        </Label>
                        <Input
                          id="hex"
                          ref={hexInputRef}
                          value={hexColor}
                          onChange={({ target: { value } }) => {
                            setHexColor(value);
                            const newColor = colord(value);
                            if (newColor.isValid()) {
                              const hsl = newColor.toHsl();
                              setColor({ h: hsl.h, s: hsl.s, l: hsl.l });
                            }
                          }}
                          onBlur={() => {
                            if (
                              !colord(hexColor).isValid() ||
                              !/^#[0-9a-fA-F]{6}$/.test(hexColor)
                            ) {
                              setHexColor(colord(color).toHex());
                              console.log(colord(color).toHex());
                            }
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        ref={randomiseButtonRef}
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.preventDefault();

                          setAnimate(true);
                          setCurrentDice(
                            diceIcons[
                              Math.floor(Math.random() * diceIcons.length)
                            ]
                          );

                          setColor(randomColor());
                        }}
                        onAnimationEnd={() => setAnimate(false)}
                      >
                        {React.createElement(currentDice, {
                          className: cn("dark:text-gray-50", {
                            "animate-[wiggle_200ms_ease-out_1]": animate,
                          }),
                        })}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Randomise</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </DialogPortal>
    </Dialog>
  );
});

export default ChipCreationMenu;
