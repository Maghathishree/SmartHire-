import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  Loader2,
  BookOpen,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ChatMessage, RAGSource } from "../types";

interface MentorChatViewProps {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const MentorChatView: React.FC<MentorChatViewProps> = ({
  chatMessages,
  setChatMessages
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isSending]);

  const presetQuestions = [
    "How do I become a Data Analyst?",
    "What skills are commonly required for Python Developer jobs?",
    "What skills should I learn for Machine Learning and Generative AI?",
    "What career roadmap should I follow for Cloud & DevOps?"
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I was unable to retrieve a response.",
        guardrailStatus: data.guardrail_status,
        violation: data.violation,
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an issue connecting to the Career Mentor service.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const toggleSourceExpand = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          AI Career Mentor
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          RAG-powered conversational advisor grounded in tech role roadmaps, required skills, and job market data.
        </p>
      </div>

      {/* Suggested Questions Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-semibold text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular:
        </span>
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors shrink-0 border border-slate-200/80"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 overflow-y-auto space-y-4 shadow-sm">
        {chatMessages.map((msg) => {
          const isUser = msg.role === "user";
          const isRejected = msg.guardrailStatus === "rejected";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : isRejected
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-900 text-white"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                      : isRejected
                      ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                  }`}
                >
                  {isRejected && (
                    <div className="flex items-center gap-1 font-bold text-amber-800 text-[11px] mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Guardrail Active: Query Filtered ({msg.violation})
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                </div>

                {/* Grounding Citations */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <button
                      onClick={() => toggleSourceExpand(msg.id)}
                      className="w-full flex items-center justify-between text-slate-600 hover:text-slate-900 font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        Grounded Sources ({msg.sources.length} cited)
                      </span>
                      {expandedSources[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedSources[msg.id] && (
                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5">
                        {msg.sources.map((src, idx) => (
                          <div key={idx} className="text-slate-600 text-[11px]">
                            <span className="font-bold text-slate-800">
                              [{idx + 1}] {src.title}
                            </span>{" "}
                            <span className="text-slate-400">({src.type})</span>
                            <p className="text-slate-500 italic mt-0.5 pl-2 border-l border-slate-300">
                              {src.snippet}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] text-slate-400 ${isUser ? "text-right" : "text-left"}`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            Evaluating guardrails and retrieving career knowledge chunks...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about career paths, skills, resumes, or interview prep..."
          disabled={isSending}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Ask
        </button>
      </form>
    </div>
  );
};
