import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import {
  NumericFormat,
  NumericFormatProps,
  SourceInfo,
} from "react-number-format";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  stepper?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number; // Controlled value
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      className,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue
    );
    const [internalChange, setInternalChange] = useState(false); // Track internal updates

    // Update value when controlledValue changes but don't trigger onValueChange
    useEffect(() => {
      if (controlledValue !== undefined && controlledValue !== value) {
        setInternalChange(false);
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleIncrement = useCallback(() => {
      setValue((prev) => {
        const newValue =
          prev === undefined
            ? stepper ?? 1
            : Math.min(prev + (stepper ?? 1), max);
        setInternalChange(true);
        return newValue;
      });
    }, [stepper, max]);

    const handleDecrement = useCallback(() => {
      setValue((prev) => {
        const newValue =
          prev === undefined
            ? -(stepper ?? 1)
            : Math.max(prev - (stepper ?? 1), min);
        setInternalChange(true);
        return newValue;
      });
    }, [stepper, min]);

    // Call onValueChange when the value updates, but only if it was changed internally
    useEffect(() => {
      if (internalChange && onValueChange !== undefined) {
        onValueChange(value);
        setInternalChange(false);
      }
    }, [value, internalChange, onValueChange]);

    const handleChange = (
      values: { value: string; floatValue: number | undefined },
      sourceInfo: SourceInfo
    ) => {
      const newValue = values.floatValue ?? undefined;
      setValue(newValue);

      if (sourceInfo.source !== "prop") {
        setInternalChange(true);
      }
    };

    const handleBlur = () => {
      if (value !== undefined) {
        if (value < min) {
          setValue(min);
          (ref as React.RefObject<HTMLInputElement>).current!.value =
            String(min);
        } else if (value > max) {
          setValue(max);
          (ref as React.RefObject<HTMLInputElement>).current!.value =
            String(max);
        }
      }
    };

    return (
      <div className="flex items-center">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className={cn(
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative",
            className
          )}
          getInputRef={ref}
          {...props}
        />

        <div className="flex flex-col">
          <Button
            aria-label="Increase value"
            className="px-2 h-5 rounded-l-none rounded-br-none border-input border-l-0 border-b-[0.5px] focus-visible:relative"
            variant="outline"
            onClick={handleIncrement}
            disabled={value === max}
          >
            <ChevronUp size={15} />
          </Button>
          <Button
            aria-label="Decrease value"
            className="px-2 h-5 rounded-l-none rounded-tr-none border-input border-l-0 border-t-[0.5px] focus-visible:relative"
            variant="outline"
            onClick={handleDecrement}
            disabled={value === min}
          >
            <ChevronDown size={15} />
          </Button>
        </div>
      </div>
    );
  }
);
