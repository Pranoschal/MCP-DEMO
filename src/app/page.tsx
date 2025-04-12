"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Send, Bot, User } from "lucide-react"
import pb from "@/lib/pocketbase"
import { ComponentRenderer } from "@/components/ui/dynamicRenderer/component-render"
import { Button } from "@/components/ui/button"

export default function Chat() {
  const [tsxData, setTsxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchTSX = async () => {
  //     try {
  //       const tsxRecords = await pb.collection("componentsSpec").getFullList();
  //       const tsxOnly = tsxRecords.map(record => ({
  //         name: record.name,
  //         tsx: record.tsx,
  //         dependencies: record.dependencies || [], 
  //       }));
  //       setTsxData(tsxOnly);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTSX();
  // }, []);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "api/mcp",
    onResponse(response) {
      console.log('Got Response', response)
    },
  })
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      setIsTyping(true)
      try {
        await handleSubmit(e)
      } finally {
        setIsTyping(false)
      }
    }
  }

  return (
    <div className="flex flex-col bg-gray-900 h-screen text-white">
      <header className="bg-gray-800 p-4 text-center">
        <h1 className="bg-clip-text bg-gradient-to-r text-2xl text-transparent font-bold from-purple-400 to-pink-600">
          AI Chat Interface
        </h1>
      </header>
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => {
          console.log(messages);
          return (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${message.role === "user" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-100"
                  }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === "user" ? <User className="h-4 w-4 mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
                  <span className="font-semibold">{message.role === "user" ? "You" : "AI"}</span>
                </div>
                {message.content && <p>{message.content}</p>}

                {message.toolInvocations && message.toolInvocations.map((tool, index) => {
                  if (tool.state == 'result') {
                    const result = tool?.result?.content[0].html
                    const props = tool?.args?.parameters
                    return (<div key={index}>
                      <ComponentRenderer tsxString={result} props={props} />
                      {/* <div dangerouslySetInnerHTML={{ __html: result }} /> */}
                    </div>)
                  }
                })}
              </div>
            </div>
          );
        })}


        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-lg text-gray-100">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      <footer className="bg-gray-800 p-4">
        <form onSubmit={onSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 rounded-full text-white duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 px-4 py-2 transition-all"
          />
          <button
            type="submit"
            className="bg-purple-600 p-2 rounded-full text-white duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-purple-700 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </footer>
    </div>
  )
}

