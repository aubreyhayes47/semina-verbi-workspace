/// <reference types="vite/client" />

// This file ensures ImportMeta.env is properly typed for Vite projects.
declare interface ImportMetaEnv {
  readonly VITE_HF_API_KEY?: string;
  readonly VITE_MAGISTERIUM_API_KEY?: string;
  // add other env vars as needed
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
