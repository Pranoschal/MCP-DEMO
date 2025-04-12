import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const newClient = new Client(
    { name: "MCP HTML Client", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  const newTransport = new SSEClientTransport(
    new URL("/sse", "http://localhost:3001"),
    {
      requestInit: {
        headers: {
          Accept: "text/event-stream",
        },
      },
    }
  );

  try {
    await newClient.connect(newTransport);
    const capabilities = await newClient.listTools();
    console.log("capabilities==========>", capabilities);
    const availableTools = capabilities.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || "No description available",
    }));
  } catch (err) {
    console.error("Failed to connect to MCP server : ", err);
  };