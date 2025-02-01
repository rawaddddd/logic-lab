import { useSimulationStore } from "@/store";
import useInterval from "@/hooks/useInterval";
import { useState } from "react";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import {
  IconExposurePlus1,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";

function SimulationControls() {
  const circuit = useSimulationStore((state) => state.circuit);
  const updateCircuit1 = useSimulationStore((state) => state.updateCircuit);
  const updateCircuit = () => {
    // console.log(circuit);
    // console.log(
    //   "input pins",
    //   circuit.inputPins.map((inputPin) => inputPin.value)
    // );
    // console.log(
    //   "output pins",
    //   circuit.outputPins.map((outputPin) => outputPin.value)
    // );
    updateCircuit1(circuit.inputPins.map((inputPin) => inputPin.value));
  };

  const [playing, setPlaying] = useState(false);
  const [tickRate, setTickRate] = useState(60);

  useInterval(() => updateCircuit(), playing ? 1000 / tickRate : null);

  return (
    <>
      <div className="px-4 py-2 flex flex-row items-center shadow-md rounded-md border bg-white space-x-2">
        <div className="flex flex-row items-center space-x-2">
          <Label htmlFor="tick-range" className="text-nowrap">
            Ticks per second:
          </Label>
          <div>
            <Slider
              id="tick-range"
              min={1}
              max={100}
              defaultValue={[tickRate]}
              className="w-40"
              onValueChange={(value) => {
                setTickRate(value[0]);
              }}
            />
            <div className="mt-2 flex flex-row justify-between">
              <span className="text-xs">1</span>
              <span className="text-xs">100</span>
            </div>
          </div>
        </div>
        <Separator orientation="vertical" />
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setPlaying(!playing);
                }}
              >
                {playing ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{playing ? "Pause" : "Play"}</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" />
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={playing}
                onClick={() => {
                  updateCircuit();
                }}
              >
                <IconExposurePlus1 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Single step</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </>
  );
}

export default SimulationControls;
