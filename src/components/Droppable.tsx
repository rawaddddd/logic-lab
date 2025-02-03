import { HTMLAttributes } from "react";
import { sidebarDnd } from "@/sidebarDnd";
import { Slot } from "@radix-ui/react-slot";
import React from "react";
import { composeRefs } from "@/lib/utils";

const { useDroppable } = sidebarDnd;

type DroppableProps = HTMLAttributes<HTMLDivElement> & {
  id: string | number;
  noDrop?: boolean;
  asChild?: boolean;
};

export const Droppable = React.forwardRef<HTMLDivElement, DroppableProps>(
  ({ id, noDrop = false, asChild = false, ...rest }, ref) => {
    const { setNodeRef } = useDroppable({
      id,
      data: { noDrop },
    });

    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={composeRefs<HTMLDivElement | null>(setNodeRef, ref)}
        {...rest}
      />
    );
  }
);
