import { HTMLAttributes } from "react";
import { sidebarDnd } from "@/sidebarDnd";

const { useDroppable } = sidebarDnd;

type DroppableProps = HTMLAttributes<HTMLDivElement> & {
  id: string | number;
  noDrop?: boolean;
};

export function Droppable({ id, noDrop = false, ...rest }: DroppableProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: { noDrop },
  });

  return <div ref={setNodeRef} {...rest}></div>;
}
