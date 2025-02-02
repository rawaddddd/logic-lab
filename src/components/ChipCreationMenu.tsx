import { useSimulationStore } from "@/store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
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

function ChipCreationMenu() {
  const createChip = useSimulationStore((state) => state.createChip);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-full text-md">Create chip</Button>
      </DialogTrigger>
      <DialogPortal>
        <form
          onSubmit={(event) => {
            console.log("here");
            event.preventDefault();
            createChip(name);
            setOpen(false);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create chip</DialogTitle>
              <DialogDescription>
                Convert the current circuit into a reusable chip.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-[1fr,5fr] items-center gap-4">
              <Label htmlFor="name" className="text-right">
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
}

export default ChipCreationMenu;
