import { useSimulationStore } from "@/store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

function ChipCreationMenu() {
  const createChip = useSimulationStore((state) => state.createChip);
  const [name, setName] = useState("");

  return (
    <>
      <div className="px-4 py-2 flex flex-row items-center shadow-md rounded-md border bg-white space-x-2">
        <Button onClick={() => createChip(name)}>Create chip</Button>
        <Input
          className="w-fit"
          placeholder="Chip Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      {/* <div className="shadow-md rounded-md">
          <Button
            className="h-full w-full"
            size="lg"
            onClick={() => createChip(name)}
          >
            Create chip
          </Button>
        </div> */}
    </>
  );
}

export default ChipCreationMenu;
