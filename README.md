# Playwright MCP LangChain

A flexible LangChain agent that integrates with Playwright MCP (Model Context Protocol) for web automation with support for multiple LLM providers.

## Features

- 🤖 **Multi-LLM Support**: Easily switch between Google Gemini, Anthropic Claude, OpenAI, and Azure OpenAI
- 🏭 **Factory Pattern**: Clean, extensible architecture for LLM provider management
- 🌐 **Web Automation**: Powered by Playwright MCP for robust browser automation
- ⚙️ **Environment-Based Configuration**: Simple .env file configuration

## Supported LLM Providers

| Provider | Models | Environment Variables |
|----------|--------|----------------------|
| **Google Gemini** | gemini-2.5-flash, gemini-1.5-pro | `GOOGLE_API_KEY` |
| **Anthropic** | claude-3-5-sonnet-20241022, claude-3-opus | `ANTHROPIC_API_KEY` |
| **OpenAI** | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | `OPENAI_API_KEY` |
| **Azure OpenAI** | Your deployed models | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, etc. |

## Installation

```bash
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and configure your preferred LLM provider:

### Google Gemini (Default)
```env
LLM_PROVIDER=google-gemini
LLM_MODEL=gemini-2.5-flash
LLM_TEMPERATURE=0
GOOGLE_API_KEY=your_api_key_here
```

### Anthropic Claude
```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_TEMPERATURE=0
ANTHROPIC_API_KEY=your_api_key_here
```

### OpenAI
```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_TEMPERATURE=0
OPENAI_API_KEY=your_api_key_here
```

### Azure OpenAI
```env
LLM_PROVIDER=azure-openai
LLM_MODEL=gpt-4o
LLM_TEMPERATURE=0
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Usage

Run the agent:
```bash
npm start
```

The agent will execute the instruction defined in `src/index.ts` using your configured LLM provider.

## Architecture

### LLM Factory Pattern

The `LLMFactory` class provides a clean abstraction for creating LLM instances:

```typescript
import { LLMFactory } from "./llm-factory";

// Create from environment variables
const llm = LLMFactory.createFromEnv();

// Or create with explicit configuration
const llm = LLMFactory.createLLM({
  provider: "anthropic",
  model: "claude-3-5-sonnet-20241022",
  temperature: 0,
  maxRetries: 2,
});
```

### Project Structure

```
playwright-mcp-langchain/
├── src/
│   ├── index.ts          # Main agent implementation
│   └── llm-factory.ts    # LLM Provider Factory
├── .env                  # Your configuration (not in git)
├── .env.example          # Configuration template
├── package.json
└── README.md
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `LLM_PROVIDER` | LLM provider to use | No | `google-gemini` |
| `LLM_MODEL` | Model name/ID | No | Provider default |
| `LLM_TEMPERATURE` | Temperature (0-1) | No | `0` |
| `LLM_MAX_RETRIES` | Max retry attempts | No | `2` |
| `GOOGLE_API_KEY` | Google AI Studio API key | If using Gemini | - |
| `ANTHROPIC_API_KEY` | Anthropic Console API key | If using Claude | - |
| `OPENAI_API_KEY` | OpenAI Platform API key | If using OpenAI | - |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | If using Azure | - |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | If using Azure | - |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Azure deployment name | If using Azure | - |
| `AZURE_OPENAI_API_VERSION` | Azure API version | If using Azure | `2024-02-15-preview` |

## Extending the Factory

To add a new LLM provider:

1. Install the LangChain integration package
2. Add the provider type to `LLMProvider` in `llm-factory.ts`
3. Implement a new `createYourProvider()` method
4. Add a case in the `createLLM()` switch statement
5. Update `.env.example` with required variables

Example:
```typescript
case "your-provider":
  return this.createYourProvider(config);
```

## API Keys

Get your API keys from:
- **Google Gemini**: https://aistudio.google.com/
- **Anthropic**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/
- **Azure OpenAI**: https://portal.azure.com/

## License

ISC