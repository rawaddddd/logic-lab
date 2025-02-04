import { useSimulationStore } from "@/store";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "./ui/menubar";
import { ChangeEvent, useRef } from "react";
import { ModeToggle } from "./mode-toggle";

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

  return (
    <Menubar className="flex flex-row justify-between rounded-none border-0 border-b">
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
      <ModeToggle className="self-stretch w-auto h-full aspect-square" />
    </Menubar>
  );
}

export default AppMenuBar;
