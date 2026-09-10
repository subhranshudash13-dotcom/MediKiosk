/**
 * Dynamic Configuration & Universal Network Endpoint Resolver
 * Automatically resolves the backend and WebSocket URLs whether running on:
 * - localhost / 127.0.0.1
 * - LAN / WiFi IP (e.g., http://192.168.1.15:3000 -> http://192.168.1.15:8000)
 * - Custom domain or Cloud deployment
 */

export function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      return process.env.NEXT_PUBLIC_BACKEND_URL;
    }
    const { protocol, hostname } = window.location;
    // Default backend is on port 8000 on the same host
    return `${protocol}//${hostname}:8000`;
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return `${getBackendUrl()}/api/v1`;
}

export function getWebSocketUrl(): string {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${window.location.hostname}:8000/ws`;
  }
  return process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
}
