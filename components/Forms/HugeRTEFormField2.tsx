import { Editor } from "@hugerte/hugerte-react";
import { useRef } from "react";
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
  description?: string;
  isDarkMode?: boolean;
}

const HugeRTEFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  isDarkMode,
}: FormFieldProps<T>) => {
  const editorRef = useRef(null);
  
  // Exact same plugins as TinyMCEFormField in same order (excluding tinydrive)
  const plugins = [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "codesample",
    "fullscreen",
    "insertdatetime",
    "media",
    "table",
    "emoticons",
    "help",
    // "tinydrive" - TinyMCE specific, not available in HugeRTE
  ];
  
  // Exact same toolbar as TinyMCEFormField in same order
  const toolbar =
    "undo redo | formatselect | " +
    "bold italic backcolor | alignleft aligncenter " +
    "insertfile image link media table codesample | removeformat | help" +
    "alignright alignjustify | bullist numlist outdent indent | ";
  
  const height = 400;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <FormItem>
          <FormLabel className="font-[900] group-hover:text-primary transition-all duration-300 ease-in-out">{label}</FormLabel>
          <FormControl>
            <Editor
              // Use CDN version (no API key needed)
              key={isDarkMode ? "dark" : "light"}
              cdnVersion="1"
              hugerteScriptSrc="https://cdn.jsdelivr.net/npm/hugerte@1/hugerte.min.js"
              onEditorChange={onChange}
              value={value}
              init={{
                skin: isDarkMode ? "oxide-dark" : "oxide",
                content_css: isDarkMode ? "dark" : "light",
                plugins: plugins,
                toolbar: toolbar,
                height: height,
                content_style: "body { background-color: " + (isDarkMode ? "oklch(0 0 0)" : "oklch(1.0000 0 0)") + "; }",
                placeholder: placeholder,
                tinydrive_token_provider: "/api/tinymce/tinydrive-token",
                tinydrive_skin: "oxide-dark",
                menu: {
                  insert: {
                    title: "Insert",
                    items: "image link media insertfile codesample",
                  },
                },
              }}
            />
          </FormControl>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
          <FormMessage className="font-[900]" />
        </FormItem>
      )}
    />
  );
};

export default HugeRTEFormField;
