import { getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import SelectOutlets from '@/components/ui/customized-components/SelectOutlet';
import { JSX, ReactNode } from 'react';
import SelectProducts from '@/components/ui/customized-components/SelectProducts';
import Invoice from "@/components/ui/customized-components/Invoice"; 
import { generateId } from 'ai';
import OutletVisits from '@/components/ui/customized-components/DailyTracker';
import PaymentMethod from '@/components/ui/customized-components/PaymentMethod';
import OrderConfirmation from '@/components/ui/customized-components/OrderConfirmation';
import pb from '@/lib/pocketbase';

const getOutlets = async () => {
  const res = await pb.collection("Outlets_Data").getFullList();
  return res;
}

const fetchActivities = async (outletId: string) => {
  const res = await pb.collection("Activities_Data").getFullList();
  return res;
}

export interface ServerMessage {
  id: string,
  chatId: string,
  role: 'user' | 'assistant' | 'function';
  name?: string;
  content: ReactNode | string | JSX.Element;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant' | 'function';
  display: ReactNode | string | JSX.Element;
}

const fetchProducts = async() => {
  return [
    {
      "id": "1",
      "name": "Bingo",
      "price": 10,
    },
    {
      "id": "2",
      "name": "Dark Fantasy",
      "price": 20,
    },
    {
      "id": "3",
      "name": "Fabelle",
      "price": 15,
    }
  ];
};


export async function continueConversation(input: string, chatId: string): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();
  const ui = await streamUI({
    model: openai('gpt-4o'),
    system: 'you are a assistant for ITC Representative',
    prompt: input,
    text: async ({ content, done }) => {
      if (done) {
        history.done([
          ...history.get(),
          { role: 'user', content: input, chatId, id: generateId()},
          { role: 'assistant', content, chatId, id:generateId()},
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      // outlet fetching tool 
      fetchOutlets: {
        description: 'When only the users specifically asks for outlets',
        parameters: z.object({
          userPrompt: z.string().describe('User prompt asking for outlets'),
        }),
        generate: async function* () {
          yield `getting the outlets`;
          const outlets = await getOutlets();
          history.done([...history.get(),{role: "user", content: input, chatId, id: generateId()}, {role: "function", name: "fetchOutlets", content: JSON.stringify(outlets), chatId, id: generateId()}])
          return (<SelectOutlets toolCall="fetchOutlets" items={outlets} />);
        }
      },

      // fetch the actions for the selected outlet
      fetchActivities: {
        description: 'fetch the actions for the outlet Id and the outletName that user sends',
        parameters: z.object({
          outletId: z.string().describe("the outletId of the selected outlet"),
          outletName: z.string().describe("the name of the outlet")
        }),
        generate: async function* ({ outletId, outletName }) {
          yield `fetching the actions for the outlet ${outletName}`;
          const activities = await fetchActivities(outletId);
          history.done([...history.get(), {role: "user", content: input, chatId, id: generateId()}, {role: "function", name: "fetchActivities", content: JSON.stringify(activities), chatId, id: generateId()}])
          return (<SelectOutlets toolCall="fetchActivities" items={activities} />)
        }
      },

      // tool for fetching the products
      fetchProducts: {
        description: 'Starting visit for task',
        parameters: z.object({}),
        generate: async function* () {
          yield `fetching the products card`;
          const products = await fetchProducts();
          history.done([...history.get(), {id: generateId(), role: "user", content: input, chatId}, {id: generateId(), role: "function", name: "fetchProducts", chatId, content: JSON.stringify(products)}]);
          return <SelectProducts products={products} />;
        }
      },

      fetchOutletTracker: {
        description: "When the user prompts to start his/hre day or asks to start the process",
        parameters: z.object({
          userPrompt: z.string().describe("User prompt asking for the Daily list"),
        }),
        generate: async function* () {
          yield "Fetching the list of daily activities...";
          history.done([...history.get(), {id: generateId(), content: input, chatId, role: "user"}, {id: generateId(), role: "function", chatId, name: "fetchOutletTracker", content: JSON.stringify([{}])}])
          return <OutletVisits />;
        },
      },
      
      // Select payment tool
      selectPaymentMethod: {
        description: "Show payment method selection interface when the user requests for completing payment",
        parameters: z.object({
          totalAmount: z.number().describe("the total amount for payment"),
        }),
        generate: async function* ({ totalAmount }) {
          yield `Loading payment options...`;
          const amountToUse = totalAmount !== undefined ? totalAmount : 0;
          history.done([...history.get(), {id: generateId(), content: input, chatId, role: "user"}, {id: generateId(), role: "function", chatId, name: "selectPaymentMethod", content: JSON.stringify({})}]);
          return <PaymentMethod totalAmount={amountToUse} />;
        },
      },
      
      showOrderConfirmation: {
        description: "Show order confirmation after user confirms the order",
        parameters: z.object({
          // orderId: z.string().describe("the order ID to display").optional(),
        }),
        generate: async function* () {
          yield `Loading order confirmation...`;
          history.done([...history.get(), {id: generateId(), content: input, chatId, role: "user"}, {id: generateId(), role: "function", chatId, name: "showOrderConfirmation", content: JSON.stringify({})}]);
          return <OrderConfirmation />;
        },
      },


      orderSummary: {
        description: 'Generate and display the invoice for the order',
        parameters: z.object({
          cartItems: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              quantity: z.number(),
              price: z.number(),  // Ensure each item has a price
            })
          )
        }),
        generate: async function* ({ cartItems }) {
          yield "Generating invoice...";
          history.done([...history.get(), {id: generateId(), content: input, chatId, role: "user"}, {id: generateId(), role: "function", chatId, name: "orderSummary", content: JSON.stringify(cartItems)}]);
          return <Invoice toolcall="" cartItems={cartItems} />;
        }
      },
    },
  });
  return {id: generateId(), role: "assistant", display: ui.value};
}