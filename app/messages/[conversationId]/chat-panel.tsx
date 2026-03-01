"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/lib/actions/conversations";
import { toast } from "sonner";
import { format, isToday } from "date-fns";
import type { ConversationMessage } from "@/lib/db/conversations";

interface Props {
  conversationId: string;
  initialMessages: ConversationMessage[];
  currentUserId: string;
}

function formatMsgTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  return format(d, "MMM d, h:mm a");
}

export function ChatPanel({ conversationId, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            body: string;
            created_at: string;
          };

          // Don't duplicate messages we already have
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                conversation_id: newMsg.conversation_id,
                sender_id: newMsg.sender_id,
                sender_name: newMsg.sender_id === currentUserId ? "You" : "Them",
                body: newMsg.body,
                created_at: newMsg.created_at,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const handleSend = useCallback(async () => {
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setBody("");
    textareaRef.current?.focus();

    const result = await sendMessage(conversationId, trimmed);
    if (result.error) {
      toast.error(result.error);
      setBody(trimmed);
    }
    setSending(false);
  }, [body, conversationId, sending]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date for date separators
  const grouped: Array<{ date: string; messages: ConversationMessage[] }> = [];
  for (const msg of messages) {
    const dateKey = format(new Date(msg.created_at), "yyyy-MM-dd");
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateKey) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: dateKey, messages: [msg] });
    }
  }

  function dateSeparatorLabel(dateStr: string) {
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    return format(d, "MMMM d, yyyy");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {grouped.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  <span className="text-xs font-medium text-slate-400">{dateSeparatorLabel(group.date)}</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                {group.messages.map((msg, idx) => {
                  const isMe = msg.sender_id === currentUserId;
                  const prevMsg = group.messages[idx - 1];
                  const showName = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                      <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                        {showName && (
                          <p className="mb-0.5 ml-1 text-xs font-medium text-slate-500">{msg.sender_name}</p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isMe
                              ? "rounded-br-sm bg-indigo-600 text-white"
                              : "rounded-bl-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                          }`}
                        >
                          <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.body}</p>
                        </div>
                        <p className={`mt-0.5 text-xs text-slate-400 ${isMe ? "text-right" : "text-left"} px-1`}>
                          {formatMsgTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            className="flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-700"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!body.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-40"
            aria-label="Send message"
          >
            <svg className="h-4 w-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
