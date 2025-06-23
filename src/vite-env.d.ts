/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_DEFAULT_AI_PROVIDER?: string
  readonly VITE_DEFAULT_OPENROUTER_MODEL?: string
  readonly VITE_DEFAULT_OPENAI_MODEL?: string
  readonly VITE_AI_ENABLED_DEFAULT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
