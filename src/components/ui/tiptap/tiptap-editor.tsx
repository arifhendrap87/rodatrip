"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useCallback, useState, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import ImageExtension from "@tiptap/extension-image"
import LinkExtension from "@tiptap/extension-link"
import UnderlineExtension from "@tiptap/extension-underline"
import HighlightExtension from "@tiptap/extension-highlight"
import TextAlignExtension from "@tiptap/extension-text-align"
import { Table as TableExtension } from "@tiptap/extension-table"
import TableRowExtension from "@tiptap/extension-table-row"
import TableCellExtension from "@tiptap/extension-table-cell"
import TableHeaderExtension from "@tiptap/extension-table-header"
import TaskListExtension from "@tiptap/extension-task-list"
import TaskItemExtension from "@tiptap/extension-task-item"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link,
  Link2Off,
  Image,
  Code,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  CheckSquare,
  Highlighter,
  RemoveFormatting,
  Upload,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({ onClick, isActive, children, title }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 p-0 ${isActive ? "bg-primary/10 text-primary" : ""}`}
    >
      {children}
    </Button>
  )
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")
  const [linkOpen, setLinkOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({ allowBase64: true }),
      LinkExtension.configure({ openOnClick: false }),
      UnderlineExtension,
      HighlightExtension.configure({ multicolor: false }),
      TextAlignExtension.configure({ types: ["heading", "paragraph"] }),
      TableExtension.configure({ resizable: true }),
      TableRowExtension,
      TableCellExtension,
      TableHeaderExtension,
      TaskListExtension,
      TaskItemExtension.configure({ nested: true }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[250px] px-3 py-2 focus:outline-none",
      },
    },
  })

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const insertLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    setLinkUrl(previousUrl || "")
    setLinkOpen(true)
  }, [editor])

  const saveLink = useCallback(() => {
    if (!editor) return
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setLinkOpen(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  const addTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Maksimal ukuran gambar 5MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "blog")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (json.data?.url) {
        editor.chain().focus().setImage({ src: json.data.url }).run()
      } else {
        // Fallback: base64
        const reader = new FileReader()
        reader.onload = () => {
          editor.chain().focus().setImage({ src: reader.result as string }).run()
        }
        reader.readAsDataURL(file)
      }
    } catch {
      // Fallback: base64
      const reader = new FileReader()
      reader.onload = () => {
        editor?.chain().focus().setImage({ src: reader.result as string }).run()
      }
      reader.readAsDataURL(file)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [editor])

  if (!editor) return null

  return (
    <>
      <style>{`
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1E232A;
          border-bottom: 2px solid #E5E0D8;
          padding-bottom: 0.25rem;
          line-height: 1.3;
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2C4A3E;
          line-height: 1.35;
          margin-top: 1.25rem !important;
          margin-bottom: 0.5rem !important;
        }
      `}</style>
    <div className="rounded-xl border border-border shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
        {/* Bold */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive("highlight")} title="Highlight">
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Text Align */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Center">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")} title="Task List">
          <CheckSquare className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Blocks */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Blockquote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Code Block">
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} isActive={false} title="Horizontal Rule">
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton onClick={insertLink} isActive={editor.isActive("link")} title="Insert Link">
          <Link className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} isActive={false} title="Remove Link">
            <Link2Off className="h-4 w-4" />
          </ToolbarButton>
        )}

        {/* Table */}
        <ToolbarButton onClick={addTable} isActive={editor.isActive("table")} title="Insert Table">
          <Table className="h-4 w-4" />
        </ToolbarButton>

        {/* Image Upload */}
        <ToolbarButton onClick={() => fileInputRef.current?.click()} isActive={false} title="Upload Image">
          {uploading ? <Upload className="h-4 w-4 animate-pulse" /> : <Image className="h-4 w-4" />}
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        <Divider />

        {/* Clear */}
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} isActive={false} title="Clear Formatting">
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} isActive={false} title="Undo">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} isActive={false} title="Redo">
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Link Dialog */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Insert Link</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 h-10 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={(e) => e.key === "Enter" && saveLink()}
              autoFocus
            />
            <Button type="button" size="sm" onClick={saveLink}>
              Simpan
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setLinkOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
