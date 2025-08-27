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
import { cn } from "@/lib/utils";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  className: string;
}

const SubscriptionInputFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  className,
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
              className={cn(className)}
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

export default SubscriptionInputFormField;
