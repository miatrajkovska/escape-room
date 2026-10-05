// Адреса на FastAPI backend-от
// - На серверот (Docker/RepoRun): API_INTERNAL_URL, на пр. http://api:8001
// - Во прелистувачот: NEXT_PUBLIC_API_URL ("" = истиот домен, преку rewrites во next.config.ts)
// - На Vercel API_INTERNAL_URL не постои, па и двата го користат NEXT_PUBLIC_API_URL (Render)
export const API_URL =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
