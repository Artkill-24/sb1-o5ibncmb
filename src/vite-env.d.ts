/// <reference types="vite/client" />

interface Window {
  ethereum: any;
}

interface ImportMetaEnv {
  VITE_WEB3_STORAGE_TOKEN: string;
}