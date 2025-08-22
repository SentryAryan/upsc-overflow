import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { FieldValues, Control, Path } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
}

const InputFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="label font-[900] group-hover:text-primary transition-all duration-300 ease-in-out">{label}</FormLabel>
          <FormControl>
            <Input
              className="input bg-background! border-3 border-secondary dark:border-border shadow-lg dark:focus-visible:border-ring dark:focus-visible:ring-ring/50 dark:focus-visible:ring-[3px]"
              placeholder={placeholder}
              type={type}
              {...field}
            />
          </FormControl>
          <FormMessage className="font-[900] transition-all duration-300 ease-in-out" />
        </FormItem>
      )}
    />
  );
};

export default InputFormField;
