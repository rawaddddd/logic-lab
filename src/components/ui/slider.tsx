import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [value, setValue] = React.useState(props.defaultValue || [0]);
  const triggerRef = React.useRef(null);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
      value={value}
      onValueChange={(value) => {
        setValue(value);
        if (props.onValueChange !== undefined) props.onValueChange(value);
      }}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <SliderPrimitive.Range className="absolute h-full bg-gray-900 dark:bg-gray-50" />
      </SliderPrimitive.Track>
      <Tooltip>
        <TooltipTrigger asChild ref={triggerRef}>
          <SliderPrimitive.Thumb
            className="block h-5 w-5 rounded-full border-2 border-gray-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-50 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300"
            onClick={(event) => {
              event.preventDefault();
            }}
          />
        </TooltipTrigger>
        <TooltipContent
          onPointerDownOutside={(event) => {
            if (event.target === triggerRef.current) event.preventDefault();
          }}
        >
          {value}
        </TooltipContent>
      </Tooltip>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
