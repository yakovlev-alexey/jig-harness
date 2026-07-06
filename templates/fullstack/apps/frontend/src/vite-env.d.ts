/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MSW_INTEGRATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
