import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, Mic } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { LiveVoice } from "./LiveVoice";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function Chatbot({ contextData }: { contextData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Hi! I'm your Aletheo assistant. Ask me anything about your audit or SEO/GEO strategies." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const systemInstruction = `
        You are the AI assistant for Aletheo, a Local SEO and GEO audit platform.
        User is currently viewing an audit report.
        Context Data: ${JSON.stringify(contextData || {})}
        
        Answer questions about the audit, explain SEO/GEO concepts, and provide actionable advice.
        Keep answers concise and helpful.
      `;

      const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction,
        },
      });

      // Send history
      // Note: In a real app, we'd maintain the chat history properly with the SDK
      // For this simple demo, we just send the new message with context in system prompt
      
      const result = await chat.sendMessage({ message: userMessage });
      const response = result.text;

      setMessages((prev) => [...prev, { role: "model", text: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 ${isOpen ? "hidden" : "flex"}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Aletheo Assistant</h3>
                <p className="text-xs text-slate-500">Powered by Gemini 3.1 Pro</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVoice(true)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Start Voice Chat"
              >
                <Mic size={20} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none"
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="animate-spin text-slate-400" size={18} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about your audit..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showVoice && <LiveVoice onClose={() => setShowVoice(false)} />}
    </>
  );
}
