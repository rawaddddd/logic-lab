import { useSimulationStore } from "@/store";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Fragment } from "react/jsx-runtime";

function SubChipViewInspector() {
  const chipViewingStack = useSimulationStore(
    (state) => state.chipViewingStack
  );
  const clearChipViewingStack = useSimulationStore(
    (state) => state.clearChipViewingStack
  );
  const popChipViewingStack = useSimulationStore(
    (state) => state.popChipViewingStack
  );

  return (
    <>
      <Button variant="link" onClick={() => clearChipViewingStack()}>
        Circuit
      </Button>
      {chipViewingStack.map(({ id, chip }, index) => (
        <Fragment key={index}>
          {"→"}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="link" onClick={() => popChipViewingStack(index)}>
                {chip.name}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{`ID: ${id}`}</TooltipContent>
          </Tooltip>
        </Fragment>
      ))}
    </>
  );
}

export default SubChipViewInspector;
