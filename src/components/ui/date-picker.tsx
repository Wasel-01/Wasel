import * as React from "react";
import { Calendar } from "./calendar";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onChange}
      initialFocus
    />
  );
}
