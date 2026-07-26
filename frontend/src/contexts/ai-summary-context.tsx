import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';

interface QuantifiedData {
    cpu_usage_percentage: string;
    memory_usage_percentage: string;
    disk_usage_percentage: string;
    storage_gb: string;
    pods: string;
    nodes: string;
    deployments: string;
    services: string;
    namespaces: string;
    events: string;
}

export interface SummaryData {
    textSummary: string;
    quantify?: QuantifiedData;
}

interface AiSummaryContextType {
    summaryData: SummaryData | null;
    isGenerating: boolean;
    isDismissed: boolean;
    isNewSummary: boolean;
    fetchSummary: (clusterId: string) => Promise<void>;
    dismissSummary: () => void;
    openSummary: () => void;
    markAsRead: () => void;
}

const AiSummaryContext = createContext<AiSummaryContextType | undefined>(undefined);

export function AiSummaryProvider({ children }: { children: ReactNode }) {
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isNewSummary, setIsNewSummary] = useState(false);
    // Cache to prevent re-fetching for the same cluster in a session
    const [cachedClusterId, setCachedClusterId] = useState<string | null>(null);

    const fetchSummary = useCallback(async (clusterId: string) => {
        if (!clusterId) return;
        
        // Use cache to prevent hammering the LLM on every tab switch
        if (cachedClusterId === clusterId && summaryData) {
            return;
        }

        setIsGenerating(true);
        setCachedClusterId(clusterId);
        
        try {
            const prompt = "Give me a cluster summary. Please ensure you strictly follow the required JSON structure provided in your system instructions.";
            
            const response = await api.post('/ai/chat', {
                message: prompt,
                clusterId: clusterId,
                isBackground: true
            });

            const content: string = response.data.message.content;
            
            let parsedData: SummaryData = { textSummary: "Cluster summary generated." };
            
            try {
                // Try to find a JSON block
                const firstBrace = content.indexOf('{');
                const lastBrace = content.lastIndexOf('}');
                
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    const textPart = content.substring(0, firstBrace)
                                         .replace(/```json/gi, '')
                                         .replace(/```/g, '')
                                         .trim();
                                         
                    let jsonPart = content.substring(firstBrace, lastBrace + 1);
                    
                    let quantifyData = null;
                    
                    // Attempt proper JSON parse first
                    try {
                        // Sometimes AI outputs unquoted keys or invalid trailing commas, let's try strict parse
                        const parsed = JSON.parse(jsonPart);
                        if (parsed && parsed.quantify) {
                            quantifyData = parsed.quantify;
                        }
                    } catch (e) {
                        // Fallback to regex extraction if JSON parse fails
                        const extractValue = (key: string) => {
                            const match = new RegExp(`["']?${key}["']?\\s*:\\s*["']?([^"'},\\s]+)["']?`).exec(jsonPart);
                            return match ? match[1].replace(/["']/g, '') : "N/A";
                        };

                        quantifyData = {
                            cpu_usage_percentage: extractValue('cpu_usage_percentage'),
                            memory_usage_percentage: extractValue('memory_usage_percentage'),
                            disk_usage_percentage: extractValue('disk_usage_percentage'),
                            storage_gb: extractValue('storage_gb'),
                            pods: extractValue('pods'),
                            nodes: extractValue('nodes'),
                            deployments: extractValue('deployments'),
                            services: extractValue('services'),
                            namespaces: extractValue('namespaces'),
                            events: extractValue('events')
                        };
                    }

                    parsedData = {
                        textSummary: textPart || "The cluster is operating normally.",
                        quantify: quantifyData
                    };
                } else {
                    parsedData = { textSummary: content };
                }
            } catch (parseErr) {
                console.error("Failed to parse AI summary JSON:", parseErr);
                parsedData = { textSummary: content };
            }

            setSummaryData(parsedData);
            setIsDismissed(false);
            setIsNewSummary(true);
        } catch (error) {
            console.error("Failed to fetch AI cluster summary:", error);
            // Don't show a broken banner
            setIsDismissed(true);
        } finally {
            setIsGenerating(false);
        }
    }, [cachedClusterId, summaryData]);

    const dismissSummary = useCallback(() => {
        setIsDismissed(true);
    }, []);

    const openSummary = useCallback(() => {
        setIsDismissed(false);
        setIsNewSummary(false); // Reading it clears the "new" badge
    }, []);

    const markAsRead = useCallback(() => {
        setIsNewSummary(false);
    }, []);

    return (
        <AiSummaryContext.Provider value={{
            summaryData,
            isGenerating,
            isDismissed,
            isNewSummary,
            fetchSummary,
            dismissSummary,
            openSummary,
            markAsRead
        }}>
            {children}
        </AiSummaryContext.Provider>
    );
}

export function useAiSummary() {
    const context = useContext(AiSummaryContext);
    if (context === undefined) {
        throw new Error('useAiSummary must be used within an AiSummaryProvider');
    }
    return context;
}
