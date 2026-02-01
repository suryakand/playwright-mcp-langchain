import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

export type LLMProvider = "google-gemini" | "anthropic" | "openai" | "azure-openai";

export interface LLMConfig {
  provider: LLMProvider;
  model?: string;
  temperature?: number;
  maxRetries?: number;
  apiKey?: string;
  // Azure-specific config
  azureOpenAIEndpoint?: string;
  azureOpenAIDeploymentName?: string;
  azureOpenAIApiVersion?: string;
}

/**
 * Factory class for creating LLM instances based on provider configuration
 */
export class LLMFactory {
  /**
   * Creates an LLM instance based on the provided configuration
   * @param config - Configuration object containing provider and model settings
   * @returns A LangChain BaseChatModel instance
   * @throws Error if provider is unsupported or required configuration is missing
   */
  static createLLM(config: LLMConfig): BaseChatModel {
    const { provider, temperature = 0, maxRetries = 2 } = config;

    switch (provider) {
      case "google-gemini":
        return this.createGoogleGemini(config);
      
      case "anthropic":
        return this.createAnthropic(config);
      
      case "openai":
        return this.createOpenAI(config);
      
      case "azure-openai":
        return this.createAzureOpenAI(config);
      
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  /**
   * Creates a Google Gemini LLM instance
   */
  private static createGoogleGemini(config: LLMConfig): ChatGoogleGenerativeAI {
    const model = config.model || "gemini-2.5-flash";
    const apiKey = config.apiKey || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("Google API Key is required. Set GOOGLE_API_KEY in environment variables.");
    }

    return new ChatGoogleGenerativeAI({
      model,
      temperature: config.temperature ?? 0,
      maxRetries: config.maxRetries ?? 2,
      apiKey,
    });
  }

  /**
   * Creates an Anthropic Claude LLM instance
   */
  private static createAnthropic(config: LLMConfig): ChatAnthropic {
    const model = config.model || "claude-3-5-sonnet-20241022";
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("Anthropic API Key is required. Set ANTHROPIC_API_KEY in environment variables.");
    }

    return new ChatAnthropic({
      model,
      temperature: config.temperature ?? 0,
      maxRetries: config.maxRetries ?? 2,
      apiKey,
    });
  }

  /**
   * Creates an OpenAI LLM instance
   */
  private static createOpenAI(config: LLMConfig): ChatOpenAI {
    const model = config.model || "gpt-4o";
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OpenAI API Key is required. Set OPENAI_API_KEY in environment variables.");
    }

    return new ChatOpenAI({
      model,
      temperature: config.temperature ?? 0,
      maxRetries: config.maxRetries ?? 2,
      apiKey,
    });
  }

  /**
   * Creates an Azure OpenAI LLM instance
   */
  private static createAzureOpenAI(config: LLMConfig): ChatOpenAI {
    const model = config.model || "gpt-4o";
    const apiKey = config.apiKey || process.env.AZURE_OPENAI_API_KEY;
    const azureOpenAIEndpoint = config.azureOpenAIEndpoint || process.env.AZURE_OPENAI_ENDPOINT;
    const azureOpenAIDeploymentName = config.azureOpenAIDeploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    const azureOpenAIApiVersion = config.azureOpenAIApiVersion || process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

    if (!apiKey) {
      throw new Error("Azure OpenAI API Key is required. Set AZURE_OPENAI_API_KEY in environment variables.");
    }

    if (!azureOpenAIEndpoint) {
      throw new Error("Azure OpenAI Endpoint is required. Set AZURE_OPENAI_ENDPOINT in environment variables.");
    }

    if (!azureOpenAIDeploymentName) {
      throw new Error("Azure OpenAI Deployment Name is required. Set AZURE_OPENAI_DEPLOYMENT_NAME in environment variables.");
    }

    return new ChatOpenAI({
      model,
      temperature: config.temperature ?? 0,
      maxRetries: config.maxRetries ?? 2,
      openAIApiKey: apiKey,
      configuration: {
        baseURL: `${azureOpenAIEndpoint}/openai/deployments/${azureOpenAIDeploymentName}`,
        defaultQuery: { 'api-version': azureOpenAIApiVersion },
        defaultHeaders: { 'api-key': apiKey },
      },
    });
  }

  /**
   * Creates an LLM instance from environment variables
   * Reads LLM_PROVIDER, LLM_MODEL, LLM_TEMPERATURE from environment
   */
  static getLLM(): BaseChatModel {
    const provider = (process.env.LLM_PROVIDER || "google-gemini") as LLMProvider;
    const model = process.env.LLM_MODEL || undefined;
    const temperature = process.env.LLM_TEMPERATURE ? parseFloat(process.env.LLM_TEMPERATURE) : 0;
    const maxRetries = process.env.LLM_MAX_RETRIES ? parseInt(process.env.LLM_MAX_RETRIES) : 2;

    const config: LLMConfig = {
      provider,
      temperature,
      maxRetries,
    };

    if (model) config.model = model;
    if (process.env.AZURE_OPENAI_ENDPOINT) config.azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    if (process.env.AZURE_OPENAI_DEPLOYMENT_NAME) config.azureOpenAIDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    if (process.env.AZURE_OPENAI_API_VERSION) config.azureOpenAIApiVersion = process.env.AZURE_OPENAI_API_VERSION;

    return this.createLLM(config);
  }
}