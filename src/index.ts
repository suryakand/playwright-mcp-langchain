import "dotenv/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createAgent } from "langchain";
import { LLMFactory } from "./llm-factory.js";

// 1. Setup MCP Client Transport
// We run the playwright server using npx
const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@playwright/mcp@latest"],
});

const mcpClient = new Client(
  { name: "langchain-client", version: "1.0.0" },
  { capabilities: {} }
);

async function run() {
  await mcpClient.connect(transport);

  // 2. Fetch available tools from the Playwright MCP Server
  const { tools: mcpTools } = await mcpClient.listTools();

  // 3. Convert MCP tools to LangChain compatible tools
  const langchainTools = mcpTools.map((tool) => {
    return new DynamicStructuredTool({
      name: tool.name,
      description: tool.description || "",
      schema: tool.inputSchema as any,
      func: async (input) => {
        const result = await mcpClient.callTool({
          name: tool.name,
          arguments: input as any,
        });
        return JSON.stringify(result.content);
      },
    });
  });

  // 4. Initialize LangChain Agent with LLM from Factory
  const llm = LLMFactory.getLLM();
  console.log(`Using LLM Provider: ${process.env.LLM_PROVIDER || 'google-gemini'}`);
  console.log(`Using Model: ${process.env.LLM_MODEL || 'default'}`);

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful web automation assistant. Use the browser tools to complete the user's request."],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = await createAgent({
    model: llm,
    tools: langchainTools,
    // prompt,
  });

  // 5. Execute Action
  const instruction = "Search Google for 'Neuro SAN' and tell me the title of the first result.";
  
  console.log(`Starting task: ${instruction}`);
  const response = await agent.invoke({ messages: instruction });
  console.log("\nFinal Result:", response.messages);

  process.exit(0);
}

run().catch(console.error);