import {
  Bold,
  Heading1,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  title,
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={
        active
          ? "flex h-9 w-9 items-center justify-center bg-[#211c18] text-white disabled:cursor-not-allowed disabled:opacity-40"
          : "flex h-9 w-9 items-center justify-center border border-black/10 bg-[#f2eee9] text-[#211c18] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      }
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write product details...",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "haya-rich-editor min-h-[280px] bg-[#f2eee9] px-4 py-4 text-[11px] leading-7 outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[280px] border border-black/15 bg-[#f2eee9]" />
    );
  }

  const setLink = () => {
    const previousUrl =
      editor.getAttributes("link").href || "";

    const url = window.prompt(
      "Enter link URL",
      previousUrl
    );

    if (url === null) return;

    if (url === "") {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const addImageByUrl = () => {
    const url = window.prompt("Paste image URL");

    if (!url) return;

    editor
      .chain()
      .focus()
      .setImage({ src: url })
      .run();
  };

  return (
    <div className="mt-3 overflow-hidden border border-black/15 bg-[#f2eee9]">
      <div className="flex flex-wrap gap-2 border-b border-black/10 bg-[#e9e2da] p-3">
        <ToolbarButton
          title="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() =>
            editor.chain().focus().setParagraph().run()
          }
        >
          <Pilcrow size={14} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 1"
          active={editor.isActive("heading", {
            level: 1,
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 1 })
              .run()
          }
        >
          <Heading1 size={15} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 2"
          active={editor.isActive("heading", {
            level: 2,
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
        >
          <Heading2 size={15} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          <Bold size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
        >
          <Italic size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() =>
            editor.chain().focus().toggleUnderline().run()
          }
        >
          <UnderlineIcon size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          <List size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
          active={editor.isActive("orderedList")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          <ListOrdered size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Add Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Remove Link"
          disabled={!editor.isActive("link")}
          onClick={() =>
            editor.chain().focus().unsetLink().run()
          }
        >
          <Unlink size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Add Image by URL"
          onClick={addImageByUrl}
        >
          <ImagePlus size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Undo"
          disabled={!editor.can().undo()}
          onClick={() =>
            editor.chain().focus().undo().run()
          }
        >
          <Undo2 size={14} strokeWidth={1.7} />
        </ToolbarButton>

        <ToolbarButton
          title="Redo"
          disabled={!editor.can().redo()}
          onClick={() =>
            editor.chain().focus().redo().run()
          }
        >
          <Redo2 size={14} strokeWidth={1.7} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}