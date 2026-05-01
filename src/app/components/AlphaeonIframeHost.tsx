import { useEffect, useRef } from "react";
import { PatientInfo } from "./PatientInfoForm";

export interface AlphaeonPortalEvent {
  eventType: string;
  payload: unknown;
}

interface AlphaeonIframeHostProps {
  partnerTrackingGuid?: string;
  patientInfo?: PatientInfo;
  locationId?: string;
  overrideUrl?: string | null;
  onApplicationCreated?: (payload: any) => void;
  onPrequalification?: (payload: any) => void;
  onCreditDecision?: (payload: any) => void;
  onReceiptSigned?: (payload: any) => void;
  /** Fired for every `alphaeon-credit-portal` message, before per-event handlers. */
  onAnyAlphaeonEvent?: (e: AlphaeonPortalEvent) => void;
}

export function AlphaeonIframeHost({
  partnerTrackingGuid,
  patientInfo,
  locationId = "6594",
  overrideUrl,
  onApplicationCreated,
  onPrequalification,
  onCreditDecision,
  onReceiptSigned,
  onAnyAlphaeonEvent,
}: AlphaeonIframeHostProps) {
  // Use refs so the message handler always has the latest callbacks
  // without needing to tear down and re-register the listener on every render
  const callbacksRef = useRef({
    onApplicationCreated,
    onPrequalification,
    onCreditDecision,
    onReceiptSigned,
    onAnyAlphaeonEvent,
  });

  // Keep refs in sync with latest props
  useEffect(() => {
    callbacksRef.current = {
      onApplicationCreated,
      onPrequalification,
      onCreditDecision,
      onReceiptSigned,
      onAnyAlphaeonEvent,
    };
  });

  const getIframeUrl = () => {
    if (overrideUrl) return overrideUrl;
    if (!partnerTrackingGuid) return '';

    const baseUrl = `https://iframe.go.sandbox.alphaeontest.com/credit-portal/location/${locationId}`;
    const params = new URLSearchParams({
      partner_identifier: 'ad_vital',
      partner_tracking_guid: partnerTrackingGuid,
    });

    // Pre-fill application data if available
    if (patientInfo) {
      if (patientInfo.firstName) params.append("first_name", patientInfo.firstName);
      if (patientInfo.lastName) params.append("last_name", patientInfo.lastName);
      if (patientInfo.email) params.append("email", patientInfo.email);
      if (patientInfo.phone) params.append("mobile_phone", patientInfo.phone);
      if (patientInfo.ssn) params.append("ssn", patientInfo.ssn);
      if (patientInfo.address.zipCode) params.append("zip", patientInfo.address.zipCode);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const iframeUrl = getIframeUrl();

  // Register the message listener ONCE and never tear it down until unmount
  useEffect(() => {
    console.log("🔌 Alphaeon postMessage listener registered");

    const handler = (event: MessageEvent) => {
      let data = event.data;

      // === CATCH-ALL DEBUG: Log EVERY single postMessage regardless of type ===
      console.log("📨 [RAW postMessage]", {
        type: typeof data,
        origin: event.origin,
        raw: typeof data === "string" ? data.substring(0, 500) : data,
      });

      // If data is a string, try to JSON.parse it (some iframes send stringified JSON)
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
          console.log("📨 [Parsed string postMessage]", data);
        } catch {
          // Not JSON, skip
          return;
        }
      }

      if (!data || typeof data !== "object") return;

      // Check for Alphaeon source
      if (data.source !== "alphaeon-credit-portal") return;

      console.log("✅ Alphaeon Iframe Event:", data.eventType, data.payload);

      const cbs = callbacksRef.current;
      cbs.onAnyAlphaeonEvent?.({ eventType: data.eventType, payload: data.payload });

      switch (data.eventType) {
        case "application_created":
          console.log("📥 Application created:", data.payload?.application_id);
          cbs.onApplicationCreated?.(data.payload);
          break;
        case "prequalification":
          console.log("📥 Prequalification:", data.payload?.status);
          cbs.onPrequalification?.(data.payload);
          break;
        case "credit_decision":
          console.log("📥 Credit decision:", data.payload?.status);
          cbs.onCreditDecision?.(data.payload);
          break;
        case "receipt_signed":
          console.log("📥 Receipt signed:", data.payload?.status);
          cbs.onReceiptSigned?.(data.payload);
          break;
        default:
          console.log("📥 Unknown Alphaeon event:", data.eventType, data.payload);
          break;
      }
    };

    window.addEventListener("message", handler);
    return () => {
      console.log("🔌 Alphaeon postMessage listener removed");
      window.removeEventListener("message", handler);
    };
  }, []); // Empty deps = register once, never re-register

  return (
    <iframe
      src={iframeUrl}
      className="w-full h-full border-0"
      title="Alphaeon Credit Portal"
      allow="geolocation; microphone; camera"
    />
  );
}
