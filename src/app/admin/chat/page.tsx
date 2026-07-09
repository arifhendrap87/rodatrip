"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Send, Copy, Check, Trash2, Plus, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface Session {
  id: string
  title: string
  created_at: string
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [sideOpen, setSideOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions")
      const json = await res.json()
      if (json.data) setSessions(json.data)
    } catch {}
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Load messages when session changes
  useEffect(() => {
    if (!activeSessionId) return
    setLoadingMsgs(true)
    fetch(`/api/chat/sessions/${activeSessionId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.messages) {
          setMessages(json.data.messages.map((m: any) => ({ role: m.role, content: m.content })))
        }
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false))
  }, [activeSessionId])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function ensureSession(): Promise<string | null> {
    if (activeSessionId) return activeSessionId
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Chat Baru" }),
      })
      const json = await res.json()
      if (json.data?.id) {
        setActiveSessionId(json.data.id)
        setMessages([])
        loadSessions()
        return json.data.id
      }
    } catch {}
    return null
  }

  async function saveMessage(sessionId: string, role: "user" | "assistant", content: string) {
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, role, content }),
      })
    } catch {}
  }

  async function handleSend() {
    if (!input.trim() || loading) return

    const sessionId = await ensureSession()
    if (!sessionId) {
      toast.error("Gagal membuat sesi chat")
      return
    }

    const userMsg: ChatMessage = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    saveMessage(sessionId, "user", userMsg.content)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || "Gagal chat")

      const reply = json.data.reply
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
      saveMessage(sessionId, "assistant", reply)
      loadSessions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal chat")
    }
    setLoading(false)
  }

  async function handleNewChat() {
    setActiveSessionId(null)
    setMessages([])
    initialized.current = false
  }

  async function handleDeleteSession(id: string) {
    await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" })
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setMessages([])
    }
    loadSessions()
    toast.success("Sesi dihapus")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
    toast.success("Teks tersalin!")
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar Sessions */}
      <div className={`${sideOpen ? "w-64" : "w-0"} shrink-0 transition-all duration-300`}>
        <div className="space-y-3">
          <Button onClick={handleNewChat} variant="default" className="w-full gap-2 justify-start">
            <Plus className="h-4 w-4" />
            Chat Baru
          </Button>

          <div className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveSessionId(s.id)}
                  className={`flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeSessionId === s.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </button>
                <button
                  onClick={() => handleDeleteSession(s.id)}
                  className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                  title="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <button onClick={() => setSideOpen(!sideOpen)} className="text-sm text-muted-foreground hover:text-foreground">
            {sideOpen ? "◀" : "▶"} Sesi
          </button>
          <p className="text-xs text-muted-foreground">AI Chat — DeepSeek</p>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeSessionId && !messages.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <span className="text-4xl mb-4">🤖</span>
              <p className="text-lg font-medium">AI Chat RodaTrip</p>
              <p className="text-sm mt-1 max-w-md">
                Klik "Chat Baru" untuk memulai percakapan. Tanya apapun tentang konten!
              </p>
            </div>
          ) : loadingMsgs ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">🤖</div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  {msg.role === "assistant" && (
                    <button onClick={() => handleCopy(msg.content, i)}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {copiedIndex === i ? <><Check className="h-3 w-3" /> Tersalin</> : <><Copy className="h-3 w-3" /> Salin</>}
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {msg.content.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">🤖</div>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan... (Enter untuk kirim)"
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Kirim
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
