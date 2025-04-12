"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useActions, useUIState } from "ai/rsc"
import { generateId } from "ai"
import { useChatId } from "@/context/ChatIdProvider"
import MessageBubble from "@/components/chat-bot/chatDesign"
import Message from '@/components/chat-bot/message'
import { Send, Mic, ImageIcon, Sparkles } from "lucide-react"
import ChatSelect from "@/components/chat-bot/chat-select"
import type { AI } from "@/app/ai"

export default function ChatBox() {
  const [input, setInput] = useState<string>("")
  const [conversation, setConversation] = useUIState<typeof AI>()
  const { continueConversation } = useActions();
  const [chatStarted, setChatStarted] = useState(false)
  const { chatId } = useChatId()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    })
  }, [conversation])




  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
    text?: string,
  ) => {
    e.preventDefault()
    const userMessage = text || input
    if (!userMessage.trim()) return

    setInput("");
    if (!chatStarted) setChatStarted(true)

    setConversation((currentConversation) => [
      ...currentConversation,
      { id: generateId(), display: userMessage, role: "user" },
    ])

    const ui = await continueConversation(userMessage, chatId)
    setConversation((currentConversation) => [
      ...currentConversation,
      { id: generateId(), display: ui.display, role: "assistant" },
    ])

   
  }

  return (
    <div className="flex flex-1 flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2  shadow-sm">
        <ChatSelect chatStarted={chatStarted} />
        <Avatar className="h-8 w-8 cursor-pointer border">
          <AvatarFallback>JD</AvatarFallback>
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
        </Avatar>
      </div>

      {/* Messages */}
      <div className="flex-1 ">
          <div className="mx-auto max-w-3xl space-y-6 p-4">
            <MessageBubble
              sender="Agent"
              time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              content="Hi, I am here to help you with Salesforce tasks."
              isUser={false}
            />

            {conversation.map((message, i) => (
              <MessageBubble
                key={i}
                time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                sender={message.role}
                content={message.display}
                isUser={message.role === "user"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
      </div>


      {/* Input Area */}
      <div className="border-t p-3 shadow-md">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            {/* Input + Mic & Image Buttons */}
            <div className="relative flex flex-1 items-center">
              <Input
                placeholder="Type message..."
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim() !== "") {
                    handleSubmit(e);
                  }
                }}
                className="flex-1 pr-16 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              {/* Icons inside input field */}
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Mic size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ImageIcon size={18} />
                </Button>
              </div>
            </div>

            {/* Send Button (placed outside the input) */}
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-black text-white flex-shrink-0"
              onClick={handleSubmit}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}

 