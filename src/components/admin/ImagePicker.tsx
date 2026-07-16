"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Loader2, Search, Check, Upload, Trash2, FolderPlus, Pencil, X, Move, ImageIcon, ChevronRight, Copy, ExternalLink,
} from "lucide-react"

interface MediaItem {
  id: string
  url: string
  filename: string
  folder: string
  size: number
  mime_type: string
  created_at: string
}

interface FolderInfo {
  name: string
  count: number
}

interface ImagePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (urls: string[]) => void
  multi?: boolean
}

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "nama", label: "Nama A-Z" },
  { value: "ukuran", label: "Ukuran" },
]

function getLocalFolders(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try { return new Set(JSON.parse(localStorage.getItem("mediaLocalFolders") || "[]")) }
  catch { return new Set() }
}

function saveLocalFolders(set: Set<string>) {
  try { localStorage.setItem("mediaLocalFolders", JSON.stringify([...set])) } catch { /* ignore */ }
}

export function ImagePicker({ open, onClose, onSelect, multi = false }: ImagePickerProps) {
  // Data
  const [items, setItems] = useState<MediaItem[]>([])
  const [folders, setFolders] = useState<FolderInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [activeFolder, setActiveFolder] = useState("all")
  const [sort, setSort] = useState("terbaru")

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Drag-drop
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Inline rename
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const renameRef = useRef<HTMLInputElement>(null)

  // Folder management
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null)
  const [renameFolderValue, setRenameFolderValue] = useState("")
  const folderCreateRef = useRef<HTMLInputElement>(null)
  const folderRenameRef = useRef<HTMLInputElement>(null)

  // Move to folder
  const [moveOpen, setMoveOpen] = useState(false)

  // Preview lightbox
  const [previewId, setPreviewId] = useState<string | null>(null)

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: MediaItem } | null>(null)

  const count = selected.size

  // Folders
  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/media/folders")
      const json = await res.json()
      const apiFolders: FolderInfo[] = json.data || []
      const merged = new Map<string, number>()
      for (const f of apiFolders) merged.set(f.name, f.count)
      const local = getLocalFolders()
      for (const name of local) { if (!merged.has(name)) merged.set(name, 0) }
      setFolders(Array.from(merged.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!open) return
    setSelected(new Set())
    fetchFolders()
    fetchMedia()
  }, [open, activeFolder, sort])

  async function fetchMedia() {
    setLoading(true)
    const params = new URLSearchParams({ limit: "100" })
    if (search) params.set("search", search)
    if (activeFolder !== "all") params.set("folder", activeFolder)

    const res = await fetch(`/api/media?${params}`)
    const json = await res.json()
    let list: MediaItem[] = json.data || []

    // Client-side sort
    if (sort === "nama") list = list.sort((a, b) => a.filename.localeCompare(b.filename))
    else if (sort === "ukuran") list = list.sort((a, b) => (b.size || 0) - (a.size || 0))
    else list = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setItems(list)
    setLoading(false)
  }

  // Upload
  async function handleUpload(file: File) {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) { toast.error("File maksimal 10MB"); return }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!allowed.includes(file.type)) { toast.error("Tipe file harus jpg, png, webp, atau avif"); return }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", activeFolder === "all" ? "spots" : activeFolder)

    try {
      const res = await fetch("/api/media", { method: "POST", body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || "Gagal upload") }
      await fetchMedia()
      await fetchFolders()
    } catch (err) {
      toast.error("Gagal upload: " + (err as Error).message)
    }
    setUploading(false)
  }

  // Delete
  async function handleDelete(id: string, filename: string) {
    if (!confirm(`Hapus "${filename}"?`)) return
    await fetch(`/api/media/${id}`, { method: "DELETE" })
    const item = items.find(i => i.id === id)
    if (item) setSelected(prev => { const n = new Set(prev); n.delete(item.url); return n })
    await fetchMedia()
    await fetchFolders()
  }

  // Rename file
  async function handleRenameSubmit(id: string) {
    if (!renameValue.trim()) { setRenamingId(null); return }
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: renameValue.trim() }),
      })
      if (!res.ok) throw new Error("Gagal rename")
      setItems(prev => prev.map(i => i.id === id ? { ...i, filename: renameValue.trim() } : i))
      toast.success("File diubah")
    } catch (err) { toast.error((err as Error).message) }
    setRenamingId(null)
  }

  // Folder operations
  async function handleCreateFolder() {
    const name = newFolderName.trim().replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    if (!name) return
    const updated = getLocalFolders()
    updated.add(name)
    saveLocalFolders(updated)
    setFolders(prev => {
      if (prev.some(f => f.name === name)) return prev
      return [...prev, { name, count: 0 }].sort((a, b) => a.name.localeCompare(b.name))
    })
    setActiveFolder(name)
    setCreateFolderOpen(false)
    setNewFolderName("")
    toast.success(`Folder "${name}" siap`)
  }

  async function handleRenameFolder(oldName: string, newName: string) {
    if (!newName.trim() || newName === oldName) { setRenamingFolder(null); return }
    try {
      const res = await fetch("/api/media/folders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: newName.trim() }),
      })
      if (!res.ok) throw new Error("Gagal rename folder")
      const updated = getLocalFolders()
      if (updated.has(oldName)) { updated.delete(oldName); updated.add(newName.trim()) }
      saveLocalFolders(updated)
      setFolders(prev => prev.map(f => f.name === oldName ? { ...f, name: newName.trim() } : f))
      if (activeFolder === oldName) setActiveFolder(newName.trim())
      toast.success(`Folder "${oldName}" → "${newName.trim()}"`)
    } catch (err) { toast.error((err as Error).message) }
    setRenamingFolder(null)
  }

  async function handleDeleteFolder(name: string) {
    if (!confirm(`Hapus folder "${name}" dan semua file di dalamnya?`)) return
    try {
      const res = await fetch("/api/media/folders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error("Gagal hapus folder")
      const updated = getLocalFolders()
      updated.delete(name)
      saveLocalFolders(updated)
      await fetchFolders()
      if (activeFolder === name) setActiveFolder("all")
      await fetchMedia()
      toast.success(`Folder "${name}" dihapus`)
    } catch (err) { toast.error((err as Error).message) }
  }

  // Bulk move
  async function handleMoveSelected(folder: string) {
    for (const url of selected) {
      const item = items.find(i => i.url === url)
      if (item) {
        await fetch(`/api/media/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        }).catch(() => {})
      }
    }
    setSelected(new Set())
    setMoveOpen(false)
    await fetchMedia()
    await fetchFolders()
    toast.success(`File dipindah ke ${folder}`)
  }

  // Selection
  function toggleSelect(url: string) {
    if (multi) {
      setSelected(prev => { const n = new Set(prev); if (n.has(url)) n.delete(url); else n.add(url); return n })
    } else {
      setSelected(new Set([url]))
    }
  }

  function handleSelect() {
    if (selected.size === 0) return
    onSelect([...selected])
    onClose()
  }

  // Context menu
  useEffect(() => {
    function handleClick() { setContextMenu(null) }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  // Format
  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const previewItem = items.find(i => i.id === previewId)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="font-heading">
            {multi ? "Pilih Gambar" : "Pilih dari Media Library"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="hidden sm:block w-44 shrink-0 border-r border-border/30 p-3 overflow-y-auto">
            <button onClick={() => setActiveFolder("all")}
              className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${activeFolder === "all" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">Semua</span>
              <span className="text-[10px] text-muted-foreground">{items.length}</span>
            </button>
            {folders.map(f => (
              <div key={f.name} className="group relative">
                {renamingFolder === f.name ? (
                  <div className="flex items-center gap-1 px-1">
                    <Input ref={folderRenameRef} value={renameFolderValue}
                      onChange={e => setRenameFolderValue(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleRenameFolder(f.name, renameFolderValue); if (e.key === "Escape") setRenamingFolder(null) }}
                      className="h-6 text-[11px]" autoFocus />
                    <button onClick={() => handleRenameFolder(f.name, renameFolderValue)}><Check className="h-3 w-3 text-green-500" /></button>
                    <button onClick={() => setRenamingFolder(null)}><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <button onClick={() => setActiveFolder(f.name)}
                    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${activeFolder === f.name ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                    <ChevronRight className="h-3 w-3" />
                    <span className="flex-1 text-left truncate">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground">{f.count}</span>
                  </button>
                )}
                {renamingFolder !== f.name && (
                  <div className="absolute right-0.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); setRenamingFolder(f.name); setRenameFolderValue(f.name) }}
                      className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted text-muted-foreground"><Pencil className="h-2.5 w-2.5" /></button>
                    {f.name !== "spots" && f.name !== "cover" && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.name) }}
                        className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted text-red-500"><Trash2 className="h-2.5 w-2.5" /></button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2 border-t border-border/20 mt-2">
              {createFolderOpen ? (
                <div className="flex items-center gap-1 px-1">
                  <Input ref={folderCreateRef} value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                    placeholder="Nama" className="h-6 text-[11px]" autoFocus
                    onKeyDown={e => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") { setCreateFolderOpen(false); setNewFolderName("") } }} />
                  <button onClick={handleCreateFolder}><Check className="h-3 w-3 text-green-500" /></button>
                  <button onClick={() => { setCreateFolderOpen(false); setNewFolderName("") }}><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <button onClick={() => setCreateFolderOpen(true)}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <FolderPlus className="h-3.5 w-3.5" />
                  Buat Folder
                </button>
              )}
            </div>
          </div>

          {/* Main content */}
          <div
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
            onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }}
            onDrop={e => { e.preventDefault(); e.stopPropagation(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }}
            className="flex-1 flex flex-col min-w-0 p-4 pt-2 relative"
          >
            {dragOver && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-4 border-dashed border-primary/60 bg-primary/5 backdrop-blur-sm">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-1 text-sm font-semibold text-primary">Lepaskan file untuk upload</p>
                </div>
              </div>
            )}
            {/* Top bar */}
            <div className="flex items-center gap-2 mb-3 shrink-0 flex-wrap">
              <div className="relative flex-1 min-w-[120px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari file..." className="pl-8 h-8 text-xs" />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-muted-foreground">
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
                onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-2 border-dashed px-3 py-1.5 text-xs transition-colors shrink-0 ${dragOver ? "border-primary bg-primary/5 text-primary" : "border-border/30 text-muted-foreground hover:bg-muted/20"}`}
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {dragOver ? "Lepaskan" : "Upload"}
              </div>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" ref={fileRef}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = "" }} />
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-lg border border-primary/20 bg-primary/5 shrink-0">
                <span className="text-xs font-medium">{selected.size} terpilih</span>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setMoveOpen(true)}>
                  <Move className="h-3 w-3" /> Pindah
                </Button>
              </div>
            )}

            {/* Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="py-16 text-center text-muted-foreground text-sm">Loading...</div>
              ) : items.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  <p>Belum ada file di folder ini</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {items.map((item) => {
                    const isSelected = selected.has(item.url)
                    return (
                      <div key={item.id} className="group relative rounded-xl border border-border/40 bg-white overflow-hidden hover:shadow-sm transition-shadow"
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX - 300, y: e.clientY - 100, item }) }}
                      >
                        <div className="aspect-[4/3] bg-muted relative cursor-pointer" onClick={() => toggleSelect(item.url)}>
                          <img src={item.url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => { e.stopPropagation(); handleDelete(item.id, item.filename) }}
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white">
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div className="p-1.5">
                          {renamingId === item.id ? (
                            <div className="flex items-center gap-0.5">
                              <Input ref={renameRef} value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleRenameSubmit(item.id); if (e.key === "Escape") setRenamingId(null) }}
                                className="h-5 text-[10px]" autoFocus />
                              <button onClick={() => handleRenameSubmit(item.id)}><Check className="h-2.5 w-2.5 text-green-500" /></button>
                              <button onClick={() => setRenamingId(null)}><X className="h-2.5 w-2.5" /></button>
                            </div>
                          ) : (
                            <p className="text-[10px] font-medium truncate cursor-pointer hover:text-primary"
                              onClick={(e) => { e.stopPropagation(); setRenamingId(item.id); setRenameValue(item.filename) }}
                            >{item.filename}</p>
                          )}
                          <p className="text-[9px] text-muted-foreground">{formatSize(item.size)} · {item.folder}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/30 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>Batal</Button>
          <Button size="sm" onClick={handleSelect} disabled={count === 0}>
            Pilih{count > 0 ? ` (${count})` : ""}
          </Button>
        </div>

        {/* Context menu */}
        {contextMenu && (
          <div className="fixed z-[60] bg-white rounded-xl shadow-xl border border-border/50 py-1 w-36"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button onClick={() => { navigator.clipboard.writeText(contextMenu.item.url); toast.success("URL tersalin!"); setContextMenu(null) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted"><Copy className="h-3 w-3" /> Copy URL</button>
            <button onClick={() => { setRenamingId(contextMenu.item.id); setRenameValue(contextMenu.item.filename); setContextMenu(null) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted"><Pencil className="h-3 w-3" /> Rename</button>
            <button onClick={() => { setContextMenu(null); handleDelete(contextMenu.item.id, contextMenu.item.filename) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted text-red-500"><Trash2 className="h-3 w-3" /> Hapus</button>
          </div>
        )}

        {/* Move dialog */}
        {moveOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20" onClick={() => setMoveOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl p-5 w-64" onClick={e => e.stopPropagation()}>
              <h4 className="text-sm font-semibold mb-3">Pindah ke Folder</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {folders.filter(f => f.name !== activeFolder).map(f => (
                  <button key={f.name} onClick={() => handleMoveSelected(f.name)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-muted">📁 {f.name}</button>
                ))}
                {folders.filter(f => f.name !== activeFolder).length === 0 && (
                  <p className="text-xs text-muted-foreground px-3 py-2">Tidak ada folder lain</p>
                )}
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setMoveOpen(false)}>Batal</Button>
            </div>
          </div>
        )}

        {/* Preview lightbox */}
        <Dialog open={previewId !== null} onOpenChange={(v) => { if (!v) setPreviewId(null) }}>
          <DialogContent className="sm:max-w-3xl rounded-2xl">
            {previewItem && (
              <>
                <DialogHeader><DialogTitle className="font-heading truncate text-sm">{previewItem.filename}</DialogTitle></DialogHeader>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <img src={previewItem.url} alt={previewItem.filename} className="w-full rounded-xl" />
                  </div>
                  <div className="w-full lg:w-48 space-y-2 text-xs shrink-0">
                    <div><p className="text-muted-foreground">Ukuran</p><p className="font-medium">{formatSize(previewItem.size)}</p></div>
                    <div><p className="text-muted-foreground">Folder</p><p>{previewItem.folder}</p></div>
                    <Button size="sm" variant="default" className="w-full gap-1 text-xs" onClick={() => { navigator.clipboard.writeText(previewItem.url); toast.success("URL tersalin!") }}>
                      <Copy className="h-3 w-3" /> Copy URL
                    </Button>
                    <a href={previewItem.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="w-full gap-1 text-xs"><ExternalLink className="h-3 w-3" /> Buka</Button>
                    </a>
                    <Button size="sm" variant="ghost" className="w-full gap-1 text-xs text-red-500" onClick={() => { handleDelete(previewItem.id, previewItem.filename); setPreviewId(null) }}>
                      <Trash2 className="h-3 w-3" /> Hapus
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
