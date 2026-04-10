/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ALPHAEON_API_URL: string;
    readonly VITE_ALPHAEON_AUDIENCE?: string;
    readonly VITE_ALPHAEON_MERCHANT_ID?: string;
    readonly VITE_ALPHAEON_CLIENT_ID: string;
    readonly VITE_ALPHAEON_CLIENT_SECRET: string;
    readonly VITE_ENV?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
