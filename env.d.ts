// env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_LINK: string;
      NEXT_PUBLIC_SUPABASE_KEY: string;
      NEXT_PUBLIC_CHAT_GPT_API_KEY: string;
      NEXT_PUBLIC_CHAT_GPT_PROJECT_ID: string;
      NEXT_PUBLIC_CHAT_GPT_ORGANIZATION: string;
      NEXT_PUBLIC_CLAUDE_AI_API_KEY: string;
      NEXT_PUBLIC_PERPLEXITY_AI_API_KEY: string;
      NEXT_PUBLIC_PINECONE_AI_API_KEY: string;
      NEXT_PUBLIC_COPYSCAPE_USERNAME: string;
      NEXT_PUBLIC_COPYSCAPE_API_KEY: string;
      NEXT_PUBLIC_MONGODB_URI: string;
      NEXT_PUBLIC_JWT_TOKEN: string;
      // Add other variables here
    }
  }
  