import { useSimulationStore } from "@/store";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./ui/menubar";
import { ChangeEvent, useRef } from "react";
import { ModeToggle } from "./mode-toggle";
import { BackgroundVariant } from "@xyflow/react";

function AppMenuBar() {
  const save = useSimulationStore((state) => state.save);
  const open = useSimulationStore((state) => state.open);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      console.warn("No file selected");
      return;
    }
    const file = event.target.files[0];
    open(file);
  };

  const backgroundVariant = useSimulationStore(
    (state) => state.backgroundVariant
  );
  const setBackgroundVariant = useSimulationStore(
    (state) => state.setBackgroundVariant
  );

  const reloadDiagram = useSimulationStore((state) => state.reloadDiagram);

  return (
    <Menubar className="flex flex-row justify-between rounded-none border-0 border-b">
      <div className="flex flex-row space-x-1">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onSelect={() => {
                fileInputRef.current?.click();
              }}
            >
              Open
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onSelect={save}>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Background</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarRadioGroup
                  value={backgroundVariant}
                  onValueChange={(value) =>
                    setBackgroundVariant(value as BackgroundVariant)
                  }
                >
                  <MenubarRadioItem value="none">None</MenubarRadioItem>
                  <MenubarRadioItem value="dots">Dots</MenubarRadioItem>
                  <MenubarRadioItem value="cross">Cross</MenubarRadioItem>
                  <MenubarRadioItem value="lines">Lines</MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onSelect={reloadDiagram}>Reload Diagram</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </div>
      <ModeToggle className="self-stretch w-auto h-full aspect-square" />
    </Menubar>
  );
}

export default AppMenuBar;
