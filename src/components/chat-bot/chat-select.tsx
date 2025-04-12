"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { fetchAgents } from "@/lib/pocketdb";
import pb from "@/lib/pocketbase"; // ✅ Import PocketBase instance
import { useChatId } from "@/context/ChatIdProvider";

interface ChatSelectProps {
  chatStarted: boolean;
}

export default function ChatSelect({ chatStarted }: ChatSelectProps) {
  const [selected, setSelected] = useState<string>("");
  const [agents, setAgents] = useState<{ id: string; name: string; icon: string | null }[]>([]);
  const [isDisabled, setIsDisabled] = useState<boolean>(false); // ✅ Track if selection should be disabled
  const router = useRouter();
  const { chatId, setChatId } = useChatId();

  // ✅ Fetch agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agentData = await fetchAgents();
        console.log("✅ Agents fetched:", agentData);
        setAgents(agentData);
      } catch (error) {
        console.error("❌ Failed to load agents:", error);
      }
    };
    loadAgents();
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const checkAgent = async () => {
      console.log("checking agent selct");
      try {
        const chatData = await pb.collection("Chat_Data").getOne(chatId);
        if (chatData.agent_id) {
          setSelected(chatData.agent_id);
          setIsDisabled(true); // Disable selection if agent already assigned
        } else {
          setIsDisabled(false); // Enable selection if no agent assigned
        }
      } catch (error) {
        console.error("❌ Error fetching chat data:", error);
      }
    };

    checkAgent();
  }, []);

  // ✅ Update chat when agent is selected
  const handleAgentSelect = async (agentId: string) => {
    setSelected(agentId);
    try {
      await pb.collection("Chat_Data").update(chatId, {
        agent_id: agentId,
      });
      console.log("✅ Chat updated with agent:", agentId);
      setIsDisabled(true); // Lock selection after choosing an agent
    } catch (error) {
      console.error("❌ Error updating chat session:", error);
    }
  };

  return (
    <Select value={selected} onValueChange={handleAgentSelect} disabled={isDisabled || chatStarted}>
      <SelectTrigger
        className={`w-[180px] h-8 px-2 py-1 border border-gray-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500
          ${isDisabled || chatStarted ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <SelectValue placeholder="Select an agent" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {agents.length > 0 ? (
            agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                <div className="flex items-center gap-2">
                  {agent.icon && <img src={agent.icon} alt={agent.name} className="w-4 h-4 rounded-full" />}
                  {agent.name}
                </div>
              </SelectItem>
            ))
          ) : (
            <p className="text-gray-500 p-2">No agents available</p>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
 