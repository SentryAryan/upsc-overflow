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
    "bold italic backcolor forecolor blockquote hr emoticons | alignleft aligncenter" +
    "insertfile image link media table codesample | removeformat | help" +
    "alignright alignjustify | bullist numlist outdent indent";

  const menu = {
    file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | print | deleteallconversations' },
    edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
    view: { title: 'View', items: 'code revisionhistory | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' },
    insert: { title: 'Insert', items: 'image link media addcomment pageembed codesample inserttable | math | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime' },
    format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat' },
    tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
    table: { title: 'Table', items: 'inserttable | cell row column | advtablesort | tableprops deletetable' },
    help: { title: 'Help', items: 'help' }
  }

  const height = 400;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-[900] group-hover:text-primary transition-all duration-300 ease-in-out">
            {label}
          </FormLabel>
          <FormControl>
            <Editor
              // Use CDN version (no API key needed)
              key={isDarkMode ? "dark" : "light"}
              cdnVersion="1"
              hugerteScriptSrc="https://cdn.jsdelivr.net/npm/hugerte@1/hugerte.min.js"
              value={field.value}
              onEditorChange={field.onChange}
              onBlur={field.onBlur}
              init={{
                skin: isDarkMode ? "oxide-dark" : "oxide",
                content_css: isDarkMode ? "dark" : "light",
                plugins: plugins,
                toolbar: toolbar,
                menu: menu,
                height: height,
                content_style:
                  "body { background-color: " +
                  (isDarkMode ? "oklch(0 0 0)" : "oklch(1.0000 0 0)") +
                  "; }",
                placeholder: placeholder,
                tinydrive_token_provider: "/api/tinymce/tinydrive-token",
                tinydrive_skin: "oxide-dark",
              }}
            />
          </FormControl>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
          <FormMessage className="font-[900] transition-all duration-300 ease-in-out" />
        </FormItem>
      )}
    />
  );
};

export default HugeRTEFormField;
