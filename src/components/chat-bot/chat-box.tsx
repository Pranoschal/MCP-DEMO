"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';
export const maxDuration = 30;
import { useChatId } from "@/context/ChatIdProvider";
import Message from "@/components/chat-bot/message";

import {
    ArrowLeft,
    ChevronDown,
    Copy,
    ExternalLink,
    ImageIcon,
    LogOut,
    MessageSquare,
    Mic,
    Moon,
    Plus,
    RefreshCw,
    Send,
    Settings,
    Trash,
    X,
} from "lucide-react";
import ChatSelect from "@/components/chat-bot/chat-select";
import { AI } from "@/app/ai";


export default function ChatBox() {

    const [message, setMessage] = useState("");
    const [isExpanded, setIsExpanded] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState<string>('');
    const [conversation, setConversation] = useUIState<typeof AI>();
    const { continueConversation } = useActions();
    const [chatStarted, setChatStarted] = useState(false);
    const { chatId, setChatId } = useChatId();
    const [agent, setAgent] = useState();

    useEffect(() => {
        const scrollToBottom = () => {
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            });
        };
        scrollToBottom();
    }, [conversation]);
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent) => {
        e.preventDefault();
        setInput('');
        if (!chatStarted) setChatStarted(true);
        setConversation(currentConversation => [
            ...currentConversation, { id: generateId(), display: (<div>{input}</div>), role: "user" }
        ]);
        const ui = await continueConversation(input, chatId);
        const message = ui.display;
        setConversation(currentConversation => [...currentConversation, { id: generateId(), display: message, role: "assistant" }]);
    };

    return (
        <div className="flex flex-1 flex-col">
            {/* Header */}

            <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ArrowLeft size={18} /> : <MessageSquare size={18} />}
                    </Button>

                    <ChatSelect chatStarted={chatStarted} />
                </div>

                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 cursor-pointer border">
                        <AvatarFallback>JD</AvatarFallback>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    </Avatar>
                </div>
            </div>


            {/* Messages */}
            <div className="flex-1">
                <div className="mx-auto max-w-3xl space-y-8 p-4">
                    <Message
                        sender="Agent"
                        time="02:25 AM"
                        content="Hi, I am here to help you with salesforce tasks."
                        isUser={false}
                    />
                    {conversation.map((message, i) => {
                        if (message) {
                            return (
                                <Message key={i} time={Date.now().toString()} sender={message.role} content={message.display} isUser={message.role === "user"} />
                            )
                        }
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
                <div className="mx-auto max-w-3xl">
                    <div className="relative">
                        <Input
                            placeholder="Type message"
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && input.trim() !== "") {
                                    handleSubmit(e);
                                }
                            }}
                            className="pr-20 py-6 rounded-full"
                        />
                        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <Mic size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <ImageIcon size={18} />
                            </Button>
                            <Button size="icon" className="h-8 w-8 rounded-full" onClick={handleSubmit}>
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )


}