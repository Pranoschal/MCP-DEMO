import { createAI, getAIState, getMutableAIState } from 'ai/rsc';
import { ClientMessage, ServerMessage, continueConversation } from './actions';
import { generateId } from 'ai';
import SelectOutlets from '@/components/ui/customized-components/SelectOutlet';
import SelectProducts from '@/components/ui/customized-components/SelectProducts';
import pb from '@/lib/pocketbase';
import OutletVisits from '@/components/ui/customized-components/DailyTracker';
import PaymentMethod from '@/components/ui/customized-components/PaymentMethod'



const saveChat = async (state: ServerMessage[]) => {
  try {
    const existingMessages = await pb.collection("FW_MESSAGES_DATA").getFullList({
      fields: "id",
    });

    const existingIds = new Set(existingMessages.map((msg) => msg.id));

    const newMessages = state.filter((message) => message.id && !existingIds.has(message.id));
    if (newMessages.length === 0) {
      return;
    } 
    for (const message of newMessages) {
      await pb.collection("FW_MESSAGES_DATA").create({
        id: message.id,
        chat_id: "trial",
        role: message.role,
        content: message.content,
        tool: message.name,
      });
    }
  } catch (error) {
    console.error("Error storing chat messages:", error);
  }
};



export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  onSetAIState: async ({ state, done }) => {
    'use server';
    if (done) {
      saveChat(state);
    }
  },
  onGetUIState: async () => {
    'use server';

    const history: ServerMessage[] = getAIState();
    return history.map(({ id, role, content, name }: { name?: string }) => {
      let display = content; // Default to content
      let items = [];
      if (role === "function") {
        const parsedContent = JSON.parse(content);
        switch (name) {
          case "fetchOutlets":
            items = parsedContent || [];
            display = <SelectOutlets toolCall="fetchOutlets" items={items} />;
            break;

          case "fetchActivities":
            items = parsedContent || [];
            display = <SelectOutlets toolCall="fetchActivities" items={items} />;
            break;
            
          default:
            display = content;
        }
      }
      return { id, role, display };
    })
  }
});