"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useChatId } from "@/context/ChatIdProvider";
import pb from "@/lib/pocketbase";
import { generateId } from "ai";
import axios from "axios";
import { LogOut, Menu, Moon, Plus, Settings, Sun, Trash, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { RecordModel } from "pocketbase";
import { useState, useEffect, useCallback } from "react";

export default function SidePanel() {
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { chatId, setChatId } = useChatId();
  const [chats, setChats] = useState<RecordModel[]>([]);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  /** Fetch user ID on component mount */
  useEffect(() => {
    axios
      .get("/api/login", { withCredentials: true })
      .then((response) => setUserId(response.data.userId))
      .catch((error) => console.error("Error fetching userId:", error));
  }, []);

  /** Function to fetch chats */
  const getChats = useCallback(async () => {
    try {
      const fetchedChats = await pb.collection("Chat_Data").getFullList();
      setChats(fetchedChats);
    } catch (error) {
      console.error("❌ Error fetching chats:", error);
    }
  }, []);

  /** Fetch chats only on initial render */
  useEffect(() => {
    getChats();
  }, [getChats]);

  /** Detect mobile view */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /** Create a new chat */
  const handleNewChat = async () => {
    try {
      const newChatId = generateId();
      await pb.collection("Chat_Data").create({
        id: newChatId,
        name: "New Chat",
        agent_id: "",
        user_id: userId,
      });

      setChatId(newChatId);
      // getChats(); // Refresh chats after creating a new chat
      router.push("/chat/" + chatId);
    } catch (e) {
      console.error("❌ Error creating chat:", e);
    }

    if (isMobile) setIsOpen(false);
  };

  /** Delete a chat */
  const handleDeleteChat = async (chatIdToDelete: string) => {
    try {
      await pb.collection("Chat_Data").delete(chatIdToDelete);
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatIdToDelete));

      if (chatId === chatIdToDelete) {
        setChatId("");
        const res = await pb.collection("Chat_Data").create({
          name: "New Chat",
          agent_id: "",
          user_id: userId,
        });

        setChatId(res.id);
        router.push("/chat/" + res.id);
      }
    } catch (error) {
      console.error("❌ Error deleting chat:", error);
    }
  };

  /** Clear chat messages */
  const handleClearChat = async () => {
    if (!chatId) return;

    try {
      const messages = await pb.collection("Message_Data").getFullList({
        filter: `chat_id = "${chatId}"`,
      });

      for (const message of messages) {
        await pb.collection("Message_Data").delete(message.id);
      }

      console.log(`✅ Cleared messages for chat ID: ${chatId}`);
    } catch (error) {
      console.error("❌ Error clearing chat messages:", error);
    }
  };

  useEffect(() => {
    if (chatId) {
        router.push(`/chat/${chatId}`, undefined);
    }
}, [chatId]);
  /** Change chat */
  const handleChangeChatId = (chatId: string) => {
    setChatId(chatId);
    // router.push("/chat/" + chatId);
  };

  const PanelContent = () => (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between p-4">
        <Button variant="outline" className="flex flex-1 items-center justify-between gap-2" onClick={handleNewChat}>
          <Plus size={16} />
          <span>New chat</span>
        </Button>
        {isMobile && (
          <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {chats.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between">
              <Button
                variant={chatId === chat.id ? "default" : "ghost"}
                className="flex-1 flex items-center justify-start gap-2 px-2 text-left"
                onClick={() => handleChangeChatId(chat.id)}
              >
                <span className="text-sm">{chat.name}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteChat(chat.id)}>
                <Trash size={16} className="text-red-500 hover:text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t p-2">
        <Button variant="ghost" onClick={handleClearChat} className="flex w-full items-center justify-start gap-2 px-2 text-left">
          <Trash size={16} />
          <span className="text-sm">Clear chat</span>
        </Button>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-2 px-2 text-left"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span className="text-sm">Toggle theme</span>
        </Button>
        <Button variant="ghost" className="flex w-full items-center justify-start gap-2 px-2 text-left">
          <LogOut size={16} />
          <span className="text-sm">Log out</span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="fixed left-4 top-4 md:hidden" onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </Button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-[240px] p-0">
            <PanelContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className="hidden w-[240px] flex-col border-r md:flex">
      <PanelContent />
    </div>
  );
}
