import { HTMLAttributes } from "react";
import { sidebarDnd } from "@/sidebarDnd";

const { useDroppable } = sidebarDnd;

type DroppableProps = HTMLAttributes<HTMLDivElement> & {
  id: string | number;
};

export function Droppable({ id, ...rest }: DroppableProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {},
  });

  return <div ref={setNodeRef} {...rest}></div>;
}
