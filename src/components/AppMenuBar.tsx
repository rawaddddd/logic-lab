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
    <Menubar>
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
    </Menubar>
  );
}

export default AppMenuBar;
