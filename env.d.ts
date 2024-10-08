// env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_LINK: string;
      NEXT_PUBLIC_SUPABASE_KEY: string;
      NEXT_PUBLIC_CHAT_GPT_API_KEY: string;
      NEXT_PUBLIC_CHAT_GPT_PROJECT_ID: string;
      NEXT_PUBLIC_CHAT_GPT_ORGANIZATION: string;
      NEXT_PUBLIC_CLAUDE_AI_API_KEY: string
      // Add other variables here
    }
  }
  