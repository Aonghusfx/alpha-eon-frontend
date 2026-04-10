import { useEffect } from "react";

interface PlaidIframeHostProps {
    idvSessionUrl: string;
    onSuccess?: (payload: any) => void;
    onExit?: (error: any, metadata: any) => void;
    onEvent?: (eventName: string, metadata: any) => void;
}

/**
 * Component to host the Plaid Identity Verification (IDV) iframe.
 * Handles the postMessage events from Plaid as described in the documentation.
 * https://plaid.com/docs/identity-verification/
 */
export function PlaidIframeHost({
    idvSessionUrl,
    onSuccess,
    onExit,
    onEvent,
}: PlaidIframeHostProps) {
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            // Plaid events usually come from link.plaid.com
            if (!event.origin.includes("plaid.com")) return;

            const data = event.data;
            if (typeof data !== "object" || !data.action) return;

            console.log("📥 Plaid IDV Message:", data.action, data);

            // Map Plaid actions to callbacks
            switch (data.action) {
                case "plaid_link-success":
                    onSuccess?.(data.metadata);
                    break;
                case "plaid_link-exit":
                    onExit?.(data.error, data.metadata);
                    break;
                case "plaid_link-event":
                    onEvent?.(data.event_name, data.metadata);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [onSuccess, onExit, onEvent]);

    if (!idvSessionUrl) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-sm">Waiting for identity verification session...</p>
            </div>
        );
    }

    return (
        <iframe
            src={idvSessionUrl}
            className="w-full h-full border-0"
            title="Plaid Identity Verification"
            allow="camera; microphone; geolocation"
            loading="lazy"
        />
    );
}
