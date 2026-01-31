import "dotenv/config"; // Add this at the very first line
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
// import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

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

  // 4. Initialize LangChain Agent
  // const llm = new ChatOpenAI({ 
  //   modelName: "gpt-4o", 
  //   temperature: 0,
  //   apiKey: process.env.OPENAI_API_KEY 
  // });

  const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      maxRetries: 2,
      // other params...
  })

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

  // const executor = new AgentExecutor({
  //   agent,
  //   tools: langchainTools,
  //   verbose: true, // See the thought process
  // });

  // 5. Execute Action
  const instruction = "Search Google for 'LangChain MCP' and tell me the title of the first result.";
  
  console.log(`Starting task: ${instruction}`);
  // const response = await executor.invoke({ input: instruction });
  // console.log("\nFinal Result:", response.output);

  const response = await agent.invoke({ messages: instruction });
  console.log("\nFinal Result:", response.messages);

  process.exit(0);
}

run().catch(console.error);