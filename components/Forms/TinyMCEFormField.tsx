import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RootState } from "../../lib/redux/store";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
}

const TinyMCEFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
}: FormFieldProps<T>) => {
  const editorRef = useRef(null);
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
    "tinydrive",
  ];
  const toolbar =
    "undo redo | formatselect | " +
    "bold italic backcolor | alignleft aligncenter " +
    "insertfile image link media table codesample | removeformat | help" +
    "alignright alignjustify | bullist numlist outdent indent | ";
  const height = label === "Comment" ? 200 : 400;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              // onInit={(_evt, editor) => {
              //   editorRef.current = editor;
              // }}
              onEditorChange={onChange}
              value={value}
              init={{
                skin: isDarkMode ? "oxide-dark" : "oxide",
                content_css: isDarkMode ? "dark" : "light",
                plugins: plugins,
                toolbar: toolbar,
                height: height,
                content_style: "body { margin: 2rem 10%; background-color: " + (isDarkMode ? "#1a1a1a" : "#f0f0f0") + "; }",
                placeholder: placeholder,
                tinydrive_token_provider: "/api/tinymce/tinydrive-token",
                tinydrive_skin: "oxide-dark",
                menu: {
                  insert: {
                    title: "Insert",
                    items: "image link media insertfile",
                  },
                },
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TinyMCEFormField;
