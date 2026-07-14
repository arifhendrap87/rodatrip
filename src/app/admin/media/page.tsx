"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Upload, Search, Loader2, Trash2, Copy, Check, ExternalLink, FolderPlus, Pencil, X, CheckCheck, ArrowUpDown, Move, ImageIcon, ChevronRight, MoreHorizontal, File,
} from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MediaItem {
  id: string
  url: string
  filename: string
  folder: string
  size: number
  mime_type: string
  created_at: string
  updated_at?: string
}

interface FolderInfo {
  name: string
  count: number
}

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "nama", label: "Nama A-Z" },
  { value: "ukuran", label: "Ukuran" },
]

export default function MediaPage() {
  // Data
  const [items, setItems] = useState<MediaItem[]>([])
  const [folders, setFolders] = useState<FolderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [activeFolder, setActiveFolder] = useState("all")
  const [sort, setSort] = useState("terbaru")

  // Pagination
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const LIMIT = 50

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Copy
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Drag-drop
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Inline rename
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const renameRef = useRef<HTMLInputElement>(null)

  // Folder create / rename / delete
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

  // Data fetching
  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/media/folders")
      const json = await res.json()
      setFolders(json.data || [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  useEffect(() => {
    resetAndFetch()
  }, [search, activeFolder, sort])

  async function resetAndFetch() {
    setOffset(0)
    await fetchMedia(0, true)
  }

  async function fetchMedia(newOffset = 0, replace = false) {
    if (replace) setLoading(true)
    else setLoadingMore(true)

    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(newOffset) })
    if (search) params.set("search", search)
    if (activeFolder !== "all") params.set("folder", activeFolder)

    const res = await fetch(`/api/media?${params}`)
    const json = await res.json()
    setItems(replace ? (json.data || []) : [...items, ...(json.data || [])])
    setTotal(json.pagination?.total || 0)
    setOffset(newOffset + (json.data || []).length)
    setLoading(false)
    setLoadingMore(false)
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
      await fetch("/api/media", { method: "POST", body: formData })
      await resetAndFetch()
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
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    await resetAndFetch()
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
      if (!res.ok) { const j = await res.json(); throw new Error(j?.error?.message || "Gagal") }
      setItems(prev => prev.map(i => i.id === id ? { ...i, filename: renameValue.trim() } : i))
      toast.success("File diubah")
    } catch (err) { toast.error((err as Error).message) }
    setRenamingId(null)
  }

  // Copy URL
  function handleCopy(url: string, id: string) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Bulk actions
  const allSelected = items.length > 0 && selectedIds.size === items.length

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  function toggleSelectAll() {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(items.map(i => i.id)))
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Hapus ${selectedIds.size} file?`)) return
    for (const id of selectedIds) {
      await fetch(`/api/media/${id}`, { method: "DELETE" }).catch(() => {})
    }
    setSelectedIds(new Set())
    await resetAndFetch()
    await fetchFolders()
    toast.success(`${selectedIds.size} file dihapus`)
  }

  async function handleBulkMove(folder: string) {
    if (selectedIds.size === 0) return
    for (const id of selectedIds) {
      await fetch(`/api/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      }).catch(() => {})
    }
    setSelectedIds(new Set())
    setMoveOpen(false)
    await resetAndFetch()
    await fetchFolders()
    toast.success(`${selectedIds.size} file dipindah ke ${folder}`)
  }

  // Folder operations
  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    // Create folder by uploading a placeholder? No, just add it as a valid folder
    // Folders are dynamic — they exist when files have that folder value.
    // We'll just switch to that folder so user can upload into it.
    setActiveFolder(newFolderName.trim())
    setCreateFolderOpen(false)
    setNewFolderName("")
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
      await fetchFolders()
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
      await fetchFolders()
      if (activeFolder === name) setActiveFolder("all")
      await resetAndFetch()
      toast.success(`Folder "${name}" dihapus`)
    } catch (err) { toast.error((err as Error).message) }
  }

  // Context menu
  useEffect(() => {
    function handleClick() { setContextMenu(null) }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  function handleContextMenu(e: React.MouseEvent, item: MediaItem) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }

  // Format helpers
  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  const previewItem = items.find(i => i.id === previewId)

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="hidden md:block w-56 shrink-0">
        <div className="sticky top-8 space-y-1">
          <button onClick={() => setActiveFolder("all")}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeFolder === "all" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <ImageIcon className="h-4 w-4" />
            <span className="flex-1 text-left">Semua File</span>
            <span className="text-xs text-muted-foreground">{total}</span>
          </button>

          {folders.map((f) => (
            <div key={f.name} className="group relative">
              {renamingFolder === f.name ? (
                <div className="flex items-center gap-1 px-2">
                  <Input ref={folderRenameRef} value={renameFolderValue}
                    onChange={(e) => setRenameFolderValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRenameFolder(f.name, renameFolderValue); if (e.key === "Escape") setRenamingFolder(null) }}
                    className="h-7 text-xs" autoFocus />
                  <button onClick={() => handleRenameFolder(f.name, renameFolderValue)} className="shrink-0"><Check className="h-3.5 w-3.5 text-green-500" /></button>
                  <button onClick={() => setRenamingFolder(null)} className="shrink-0"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <button onClick={() => setActiveFolder(f.name)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeFolder === f.name ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="flex-1 text-left truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.count}</span>
                </button>
              )}
              {renamingFolder !== f.name && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); setRenamingFolder(f.name); setRenameFolderValue(f.name); setTimeout(() => folderRenameRef.current?.focus(), 50) }}
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted text-muted-foreground"><Pencil className="h-3 w-3" /></button>
                  {f.name !== "spots" && f.name !== "cover" && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.name) }}
                      className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted text-red-500"><Trash2 className="h-3 w-3" /></button>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-border/30">
            {createFolderOpen ? (
              <div className="flex items-center gap-1 px-2">
                <Input ref={folderCreateRef} value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nama folder" className="h-7 text-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") { setCreateFolderOpen(false); setNewFolderName("") } }} autoFocus />
                <button onClick={handleCreateFolder} className="shrink-0"><Check className="h-3.5 w-3.5 text-green-500" /></button>
                <button onClick={() => { setCreateFolderOpen(false); setNewFolderName("") }} className="shrink-0"><X className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <button onClick={() => setCreateFolderOpen(true)}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <FolderPlus className="h-4 w-4" />
                Buat Folder
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0"
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); const files = Array.from(e.dataTransfer.files); files.forEach(f => handleUpload(f)) }}
      >
        {dragOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-4 border-dashed border-primary/60 bg-primary/5 backdrop-blur-sm min-h-[400px]">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-2 text-lg font-semibold text-primary">Lepaskan file untuk upload</p>
              <p className="text-sm text-muted-foreground">JPG, PNG, WebP, AVIF — maks 10MB</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">
              Media {activeFolder !== "all" && <span className="text-muted-foreground">— {activeFolder}</span>}
            </h1>
            <p className="text-muted-foreground">{total} file</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" ref={fileRef}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = "" }} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload
            </Button>
          </div>
        </div>

        {/* Search + filter */}
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-wrap gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari file..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardContent>
        </Card>

        {/* Batch action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-lg border border-primary/20 bg-primary/5">
            <span className="text-sm font-medium">{selectedIds.size} terpilih</span>
            <Button size="sm" variant="secondary" onClick={() => setMoveOpen(true)} disabled={loadingMore}>
              <Move className="mr-1 h-3 w-3" /> Pindah ke Folder
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={loadingMore}>
              <Trash2 className="mr-1 h-3 w-3" /> Hapus
            </Button>
          </div>
        )}

        {/* Move to folder dialog */}
        {moveOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setMoveOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-semibold mb-3">Pindah ke Folder</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {folders.filter(f => f.name !== activeFolder).map(f => (
                  <button key={f.name} onClick={() => handleBulkMove(f.name)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
                    📁 {f.name} ({f.count})
                  </button>
                ))}
                {folders.filter(f => f.name !== activeFolder).length === 0 && (
                  <p className="text-xs text-muted-foreground px-3 py-2">Tidak ada folder lain</p>
                )}
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setMoveOpen(false)}>Batal</Button>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <p className="text-lg font-medium">Belum ada file</p>
              <p className="text-sm text-muted-foreground">Upload gambar untuk digunakan sebagai banner atau gambar spot</p>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload File
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {items.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 mb-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="shrink-0 rounded border-gray-300" />
                <span>{allSelected ? `${items.length} terpilih` : "Pilih semua"}</span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item) => (
                <div key={item.id}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                  className="group relative rounded-xl border border-border/50 bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="checkbox" checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-gray-300 bg-white/80" />
                  </div>

                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted relative cursor-pointer" onClick={() => setPreviewId(item.id)}>
                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={(e) => { e.stopPropagation(); handleCopy(item.url, item.id) }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-muted-foreground hover:text-foreground transition-colors">
                        {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.filename) }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 hover:bg-red-500 text-white transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    {renamingId === item.id ? (
                      <div className="flex items-center gap-1">
                        <Input ref={renameRef} value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(item.id); if (e.key === "Escape") setRenamingId(null) }}
                          className="h-6 text-xs" autoFocus onClick={(e) => e.stopPropagation()} />
                        <button onClick={() => handleRenameSubmit(item.id)} className="shrink-0"><Check className="h-3 w-3 text-green-500" /></button>
                        <button onClick={() => setRenamingId(null)} className="shrink-0"><X className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <p className="text-xs font-medium truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={() => { setRenamingId(item.id); setRenameValue(item.filename); setTimeout(() => renameRef.current?.focus(), 50) }}
                        title="Klik untuk rename"
                      >{item.filename}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <span>{formatSize(item.size)}</span>
                      <span>·</span>
                      <span className="truncate">{item.folder}</span>
                      <span>·</span>
                      <span>{formatDate(item.created_at)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && items.length < total && (
          <div className="mt-6 text-center">
            <Button onClick={() => fetchMedia(offset)} disabled={loadingMore} variant="outline">
              {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...</> : `Tampilkan lebih banyak (${items.length}/${total})`}
            </Button>
          </div>
        )}

        {/* Context menu */}
        {contextMenu && (
          <div className="fixed z-50 bg-white rounded-xl shadow-xl border border-border/50 py-1 w-44"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button onClick={() => { navigator.clipboard.writeText(contextMenu.item.url); toast.success("URL tersalin!"); setContextMenu(null) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
              <Copy className="h-3.5 w-3.5" /> Copy URL
            </button>
            <button onClick={() => { setRenamingId(contextMenu.item.id); setRenameValue(contextMenu.item.filename); setContextMenu(null) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Rename
            </button>
            <button onClick={() => { setContextMenu(null); handleDelete(contextMenu.item.id, contextMenu.item.filename) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-red-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Hapus
            </button>
          </div>
        )}

        {/* Preview lightbox */}
        <Dialog open={previewId !== null} onOpenChange={(v) => { if (!v) setPreviewId(null) }}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            {previewItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading truncate">{previewItem.filename}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <img src={previewItem.url} alt={previewItem.filename} className="w-full rounded-xl" />
                  </div>
                  <div className="w-full lg:w-56 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Nama</p>
                      <p className="font-medium break-all">{previewItem.filename}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ukuran</p>
                      <p>{formatSize(previewItem.size)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Folder</p>
                      <p>{previewItem.folder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Upload</p>
                      <p>{formatDate(previewItem.created_at)}</p>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Button size="sm" variant="default" className="w-full gap-1.5" onClick={() => { handleCopy(previewItem.url, previewItem.id); toast.success("URL tersalin!") }}>
                        {copiedId === previewItem.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy URL
                      </Button>
                      <a href={previewItem.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="w-full gap-1.5">
                          <ExternalLink className="h-4 w-4" /> Buka di Tab Baru
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
