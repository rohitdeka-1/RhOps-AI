import { useEffect, useState } from "react";

export type ClusterStreamData = {
  pods?: any[];
  nodes?: any[];
  deployments?: any[];
  services?: any[];
  namespaces?: any[];
  events?: any[];
  nodeMetrics?: any[];
  podMetrics?: any[];
};

export function useClusterStream(clusterId: string | null) {
  const [data, setData] = useState<ClusterStreamData>({});
  const [status, setStatus] = useState<"connecting" | "connected" | "error" | "disconnected">("disconnected");

  useEffect(() => {
    if (!clusterId) return;

    const token = localStorage.getItem("jwt_token");
    if (!token) {
        setStatus("error");
        return;
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    // Check if there is an explicit API URL provided in env
    let wsHost = window.location.host;
    let wsPath = `/api/v1/ws/clusters/${clusterId}/stream?token=${token}`;
    
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
        try {
            const url = new URL(apiUrl);
            wsHost = url.host;
            wsPath = `${url.pathname}/ws/clusters/${clusterId}/stream?token=${token}`;
        } catch (e) {
            console.error("Invalid VITE_API_URL", e);
        }
    }

    const wsUrl = `${wsProtocol}//${wsHost}${wsPath.replace('//', '/')}`;

    let ws: WebSocket;
    
    const connect = () => {
        setStatus("connecting");
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setStatus("connected");
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === "CLUSTER_UPDATE") {
                    setData(message.data);
                }
            } catch (err) {
                console.error("Failed to parse websocket message", err);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setStatus("error");
        };

        ws.onclose = () => {
            setStatus("disconnected");
        };
    };

    connect();

    return () => {
        if (ws && ws.readyState !== WebSocket.CLOSED) {
            ws.close();
        }
    };
  }, [clusterId]);

  return { data, status };
}
