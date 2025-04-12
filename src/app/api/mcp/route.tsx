import { convertToCoreMessages, experimental_createMCPClient, generateText, streamText } from 'ai';
import { azure } from '@ai-sdk/azure';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { NextResponse } from 'next/server';
import { streamUI } from 'ai/rsc';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );  

  let client 
  try {
    client = await experimental_createMCPClient({
      transport: {
        type: 'sse',
        url: 'http://localhost:8081/sse', 
      },
    });

    const fetchedTools = await client.tools();
    const tools = {
      ...fetchedTools
    }


    const result = await streamText({
        model: azure('gpt-4o'),
        tools : tools,
        messages: [...coreMessages],
      });
      return result.toDataStreamResponse({})
    // console.log(result,'RESPONSE FROM LLM');
    // console.log(result.toolResults[0]?.result,'RESPONSE FROM LLM');
    // return NextResponse.json({text : result.text,toolResults: result.toolResults || []})
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } 
}