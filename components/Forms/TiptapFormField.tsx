// components/Forms/TiptapFormField.tsx
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Color from "@tiptap/extension-color";
import Dropcursor from "@tiptap/extension-dropcursor";
import Focus from "@tiptap/extension-focus";
import Gapcursor from "@tiptap/extension-gapcursor";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize,
  Minus,
  Palette,
  Plus,
  Quote,
  Redo,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Type,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

// Load common languages for code highlighting
import css from "highlight.js/lib/languages/css";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

// Register additional languages
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("python", python);
lowlight.register("java", java);

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
}

const TiptapFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
}: FormFieldProps<T>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const isComment = label === "Comment";
  const height = isComment ? 200 : 250;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const editor = useEditor({
          extensions: [
            StarterKit.configure({
              codeBlock: false, // We'll use CodeBlockLowlight instead
            }),
            TextAlign.configure({
              types: ["heading", "paragraph"],
            }),
            Link.configure({
              openOnClick: false,
              HTMLAttributes: {
                class:
                  "text-blue-500 underline cursor-pointer hover:text-blue-700",
              },
            }),
            Image.configure({
              HTMLAttributes: {
                class: "max-w-full h-auto rounded-lg",
              },
            }),
            Table.configure({
              resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TextStyle,
            Color,
            Highlight.configure({
              multicolor: true,
            }),
            CodeBlockLowlight.configure({
              lowlight,
              HTMLAttributes: {
                class:
                  "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto",
              },
            }),
            Placeholder.configure({
              placeholder: placeholder || "Start typing...",
            }),
            Underline,
            Subscript,
            Superscript,
            TaskList,
            TaskItem.configure({
              nested: true,
            }),
            CharacterCount,
            Dropcursor,
            Gapcursor,
            Focus.configure({
              className: "has-focus",
              mode: "all",
            }),
          ],
          content: value || "",
          onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
          },
          editorProps: {
            attributes: {
              class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none p-4 border-0 dark:prose-invert max-w-none`,
              style: `min-height: ${height}px;`,
            },
          },
        });

        const addImage = useCallback(() => {
          const url = window.prompt("Enter image URL:");
          if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }, [editor]);

        const addLink = useCallback(() => {
          const previousUrl = editor?.getAttributes("link").href;
          const url = window.prompt("Enter URL:", previousUrl);

          if (url === null) return;

          if (url === "") {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }

          editor
            ?.chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }, [editor]);

        const insertTable = useCallback(() => {
          if (editor) {
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run();
          }
        }, [editor]);

        const toggleFullscreen = () => {
          setIsFullscreen(!isFullscreen);
        };

        const colors = [
          "#000000",
          "#434343",
          "#666666",
          "#999999",
          "#b7b7b7",
          "#cccccc",
          "#d9d9d9",
          "#efefef",
          "#f3f3f3",
          "#ffffff",
          "#980000",
          "#ff0000",
          "#ff9900",
          "#ffff00",
          "#00ff00",
          "#00ffff",
          "#4a86e8",
          "#0000ff",
          "#9900ff",
          "#ff00ff",
          "#e6b8af",
          "#f4cccc",
          "#fce5cd",
          "#fff2cc",
          "#d9ead3",
          "#d0e0e3",
          "#c9daf8",
          "#cfe2f3",
          "#d9d2e9",
          "#ead1dc",
          "#dd7e6b",
          "#ea9999",
          "#f9cb9c",
          "#ffe599",
          "#b6d7a8",
          "#a2c4c9",
          "#a4c2f4",
          "#9fc5e8",
          "#b4a7d6",
          "#d5a6bd",
          "#cc4125",
          "#e06666",
          "#f6b26b",
          "#ffd966",
          "#93c47d",
          "#76a5af",
          "#6d9eeb",
          "#6fa8dc",
          "#8e7cc3",
          "#c27ba0",
          "#a61e4d",
          "#cc0000",
          "#e69138",
          "#f1c232",
          "#6aa84f",
          "#45818e",
          "#3c78d8",
          "#3d85c6",
          "#674ea7",
          "#a64d79",
          "#85200c",
          "#990000",
          "#b45f06",
          "#bf9000",
          "#38761d",
          "#134f5c",
          "#1155cc",
          "#0b5394",
          "#351c75",
          "#741b47",
          "#5b0f00",
          "#660000",
          "#783f04",
          "#7f6000",
          "#274e13",
          "#0c343d",
          "#1c4587",
          "#073763",
          "#20124d",
          "#4c1130",
        ];

        if (!editor) {
          return (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded border animate-pulse flex items-center justify-center">
                  <span className="text-gray-500">Loading editor...</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div
                className={`border rounded-lg bg-white dark:bg-gray-900 ${
                  isFullscreen ? "fixed inset-0 z-50" : ""
                }`}
              >
                {/* Comprehensive Toolbar */}
                <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-800">
                  {/* Undo/Redo */}
                  <div className="flex border-r pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                      title="Undo"
                    >
                      <Undo className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                      title="Redo"
                    >
                      <Redo className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Text Formatting */}
                  <div className="flex border-r pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        editor.isActive("bold")
                          ? "bg-gray-300 dark:bg-gray-600"
                          : ""
                      }`}
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        editor.isActive("italic")
                          ? "bg-gray-300 dark:bg-gray-600"
                          : ""
                      }`}
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        editor.isActive("underline")
                          ? "bg-gray-300 dark:bg-gray-600"
                          : ""
                      }`}
                      title="Underline"
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        editor.isActive("strike")
                          ? "bg-gray-300 dark:bg-gray-600"
                          : ""
                      }`}
                      title="Strikethrough"
                    >
                      <Strikethrough className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        editor.isActive("code")
                          ? "bg-gray-300 dark:bg-gray-600"
                          : ""
                      }`}
                      title="Inline Code"
                    >
                      <Code className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Subscript/Superscript */}
                  {!isComment && (
                    <div className="flex border-r pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().toggleSubscript().run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive("subscript")
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Subscript"
                      >
                        <SubscriptIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().toggleSuperscript().run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive("superscript")
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Superscript"
                      >
                        <SuperscriptIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Headings */}
                  {!isComment && (
                    <div className="flex border-r pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive("heading", { level: 1 })
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Heading 1"
                      >
                        <Heading1 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive("heading", { level: 2 })
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Heading 2"
                      >
                        <Heading2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive("heading", { level: 3 })
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Heading 3"
                      >
                        <Heading3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Lists */}
                  <div className="flex border-r pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        editor.isActive("bulletList")
                          ? "bg-gray-300 dark:bg-gray-600"
                          : ""
                      }`}
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        editor.isActive("orderedList")
                          ? "bg-gray-300 dark:bg-gray-600"
                          : ""
                      }`}
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </button>
                    {!isComment && (
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().toggleTaskList().run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive("taskList")
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Task List"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                    )}
                    {!isComment && (
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().toggleBlockquote().run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive("blockquote")
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Quote"
                      >
                        <Quote className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Alignment */}
                  {!isComment && (
                    <div className="flex border-r pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().setTextAlign("left").run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive({ textAlign: "left" })
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Align Left"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().setTextAlign("center").run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive({ textAlign: "center" })
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Align Center"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().setTextAlign("right").run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive({ textAlign: "right" })
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Align Right"
                      >
                        <AlignRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().setTextAlign("justify").run()
                        }
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          editor.isActive({ textAlign: "justify" })
                            ? "bg-gray-300 dark:bg-gray-600"
                            : ""
                        }`}
                        title="Justify"
                      >
                        <AlignJustify className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Colors */}
                  {!isComment && (
                    <div className="flex border-r pr-2 mr-2 relative">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Text Color"
                        >
                          <Type className="h-4 w-4" />
                        </button>
                        {showColorPicker && (
                          <div className="absolute top-8 left-0 z-10 bg-white dark:bg-gray-800 border rounded-lg p-2 shadow-lg">
                            <div className="grid grid-cols-10 gap-1 w-48">
                              {colors.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    editor
                                      .chain()
                                      .focus()
                                      .setColor(color)
                                      .run();
                                    setShowColorPicker(false);
                                  }}
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowBgColorPicker(!showBgColorPicker)
                          }
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Background Color"
                        >
                          <Palette className="h-4 w-4" />
                        </button>
                        {showBgColorPicker && (
                          <div className="absolute top-8 left-0 z-10 bg-white dark:bg-gray-800 border rounded-lg p-2 shadow-lg">
                            <div className="grid grid-cols-10 gap-1 w-48">
                              {colors.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleHighlight({ color })
                                      .run();
                                    setShowBgColorPicker(false);
                                  }}
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Insert Options */}
                  <div className="flex border-r pr-2 mr-2">
                    <button
                      type="button"
                      onClick={addLink}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Add Link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    {!isComment && (
                      <>
                        <button
                          type="button"
                          onClick={addImage}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Add Image"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={insertTable}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Insert Table"
                        >
                          <TableIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleCodeBlock().run()
                          }
                          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                            editor.isActive("codeBlock")
                              ? "bg-gray-300 dark:bg-gray-600"
                              : ""
                          }`}
                          title="Code Block"
                        >
                          <Code className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Table Controls (when table is active) */}
                  {!isComment && editor.isActive("table") && (
                    <div className="flex border-r pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().addRowBefore().run()
                        }
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Add Row Above"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().addRowAfter().run()
                        }
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Add Row Below"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Delete Row"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().addColumnBefore().run()
                        }
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Add Column Before"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().addColumnAfter().run()
                        }
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Add Column After"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor.chain().focus().deleteColumn().run()
                        }
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Delete Column"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Fullscreen */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ml-auto"
                    title="Toggle Fullscreen"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>

                {/* Editor Content */}
                <div
                  className={`${
                    isFullscreen ? "h-[calc(100vh-60px)] overflow-auto" : ""
                  }`}
                >
                  <EditorContent
                    editor={editor}
                    className={`${isFullscreen ? "h-full" : ""}`}
                  />
                </div>

                {/* Character Count (for non-comments) */}
                {!isComment &&
                  editor.extensionManager.extensions.find(
                    (ext) => ext.name === "characterCount"
                  ) && (
                    <div className="border-t px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                      {editor.storage.characterCount.characters()} characters,{" "}
                      {editor.storage.characterCount.words()} words
                    </div>
                  )}

                {isFullscreen && (
                  <div className="fixed bottom-4 right-4">
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Exit Fullscreen
                    </button>
                  </div>
                )}
              </div>
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

export default TiptapFormField;
