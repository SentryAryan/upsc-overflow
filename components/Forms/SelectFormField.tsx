import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  options: string[];
  isDarkMode?: boolean;
}

const SelectFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  isDarkMode,
}: FormFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-[900] group-hover:text-primary transition-all duration-300 ease-in-out">{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className={`input bg-background! border-3! dark:border-border border-secondary aria-invalid:shadow-none! cursor-pointer shadow-lg hover:shadow-xl dark:focus:border-ring focus;ring-ring/50 dark:focus:ring-ring/50 dark:focus:ring-[3px] dark:aria-invalid:border-destructive dark:aria-invalid:shadow-none ${isDarkMode ? "dark" : ""} focus:border-ring`}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            {/* Applying dark class separately becuase radix portal is used inside SelectContent */}
            <SelectContent className={`border-3! border-secondary! dark:border-secondary! ${isDarkMode ? "dark" : ""}`}>
              {options.map((option: string, index: number) => (
                <SelectItem
                  key={index}
                  value={option}
                  className="cursor-pointer"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="font-[900] transition-all duration-300 ease-in-out" />
        </FormItem>
      )}
    />
  );
};

export default SelectFormField;
