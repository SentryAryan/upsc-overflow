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
}

const HugeRTEFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
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
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Editor
              // Use CDN version (no API key needed)
              cdnVersion="1"
              hugerteScriptSrc="https://cdn.jsdelivr.net/npm/hugerte@1/hugerte.min.js"
              onEditorChange={onChange}
              value={value}
              init={{
                skin: "oxide-dark",
                content_css: "dark",
                plugins: plugins,
                toolbar: toolbar,
                height: height,
                content_style: "body { margin: 2rem 10%; }",
                placeholder: placeholder,
                menu: {
                  insert: {
                    title: "Insert",
                    items: "image link media insertfile",
                  },
                },
                // HugeRTE specific configurations
                branding: false,
                promotion: false,
                menubar: true,
                statusbar: true,
                resize: true,
                contextmenu: "link image table",
                browser_spellcheck: true,
                convert_urls: false,
                relative_urls: false,
                remove_script_host: false,
                document_base_url: "/",
              }}
            />
          </FormControl>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default HugeRTEFormField;
