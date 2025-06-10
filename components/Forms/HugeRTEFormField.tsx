import { useEffect, useRef } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import {
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "../ui/form";

// Import HugeRTE directly
declare global {
  interface Window {
    hugerte: any;
  }
}

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
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const height = label === "Comment" ? 200 : 400;

  useEffect(() => {
    // Load HugeRTE from CDN
    if (!window.hugerte) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hugerte@1/hugerte.min.js';
      script.onload = () => {
        initEditor();
      };
      document.head.appendChild(script);
    } else {
      initEditor();
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
      }
    };
  }, []);

  const initEditor = () => {
    if (editorRef.current && window.hugerte) {
      window.hugerte.init({
        target: editorRef.current,
        plugins: [
          "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
          "anchor", "searchreplace", "visualblocks", "code", "codesample",
          "fullscreen", "insertdatetime", "media", "table", "emoticons", "help"
        ],
        toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | insertfile image link media table codesample | removeformat | help",
        height: height,
        skin: "oxide-dark",
        content_css: "dark",
        branding: false,
        promotion: false,
        placeholder: placeholder,
        setup: (editor: any) => {
          editorInstanceRef.current = editor;
        }
      });
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        // Update editor content when form value changes
        useEffect(() => {
          if (editorInstanceRef.current && value !== editorInstanceRef.current.getContent()) {
            editorInstanceRef.current.setContent(value || '');
          }
        }, [value]);

        // Set up change handler
        useEffect(() => {
          if (editorInstanceRef.current) {
            editorInstanceRef.current.on('change keyup', () => {
              const content = editorInstanceRef.current.getContent();
              onChange(content);
            });
          }
        }, [onChange]);

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <textarea
                ref={editorRef}
                defaultValue={value}
                style={{ width: '100%', height: `${height}px` }}
              />
            </FormControl>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default HugeRTEFormField;
