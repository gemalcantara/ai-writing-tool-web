// env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_LINK: string;
      NEXT_PUBLIC_SUPABASE_KEY: string;
      // Add other variables here
    }
  }
  