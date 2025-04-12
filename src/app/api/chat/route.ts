import { azure } from "@ai-sdk/azure"
import { convertToCoreMessages, Message, streamText, generateObject } from "ai";
import pb from "@/lib/pocketbase";
import { z } from "zod";

export const runtime = "edge"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );

  const resultListSystem = await pb.collection('AiPrompt').getList(1, 10);
  const resultListTools = await pb.collection('componentsSpec').getList(1, 10);
  const systemMsg = resultListSystem.items.map(item => String(item.systemMsg || '')).join(' ');
  const data: any[] = resultListTools.items || [];
  const dynamictools: Record<string, any> = {};
  if (Array.isArray(data)) {
    data.forEach(x => {
      try {
        if (!x || typeof x !== "object") return;
        dynamictools[x.name] = {
          description: x.description || "No description available",
          parameters: new Function("z", `return ${x.zod.obj};`)(z),
          execute: async ({ parameters }: any) => {
            try {
              console.log('Tool execution started for', x.name);
              const schemaToUse = parameters || new Function("z", `return ${x.zod.obj};`)(z);
              const functionString = x.functions?.functionString || '';
              let functionResult;
              if (functionString) {
                const functionToExecute = new Function('pb', `
                  return (${functionString})();
                `);

                functionResult = await functionToExecute(pb);

                // coreMessages.push({
                //   role: 'system',
                //   content: `Tool ${x.name} data: ${JSON.stringify({
                //     toolCall: x.name, 
                //     items: Array.isArray(functionResult) ? functionResult : [functionResult]
                //   })}`
                // });
                const response = await generateObject({
                  model: azure("gpt-4o"),
                  prompt: `Generate The Component using this data: ${JSON.stringify(functionResult)}`,
                  schema: schemaToUse
                });
                
                console.log('Generated object response:', response.object);
                return response.object;
              }

              const response = await generateObject({
                model: azure("gpt-4o"),
                prompt: `Generate The Component`,
                schema: schemaToUse
              });

              console.log('Generated object response:', response.object);
              return response.object;
            } catch (error: unknown) {
              console.error('Error in tool execution:', error);
              if (error instanceof Error) {
                return { error: error.message };
              }
              return { error: String(error) };
            }
          }
        };
      } catch (error) {
        console.error(`Error processing tool ${x?.name || "unknown"}:`, error);
      }
    });
  }
  console.log(dynamictools?.label.execute.toString(),"DYNAMIC TOOLS FOR LABEL FUNCTION")
  const result = streamText({
    model: azure("gpt-4o"),
    system: systemMsg,
    messages: coreMessages,
    tools: dynamictools,
  });
  return result.toDataStreamResponse({});
}