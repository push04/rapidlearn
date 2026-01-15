'use client';

import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Network, Server, Database, Code, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

// Initialize mermaid
mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
});

const MermaidChart = ({ chart }: { chart: string }) => {
    useEffect(() => {
        mermaid.contentLoaded();
    }, [chart]);

    return <div className="mermaid flex justify-center">{chart}</div>;
};

export default function SystemNexus({ documentId }: { documentId: string }) {
    const [requirements, setRequirements] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const generateArchitecture = async () => {
        if (!requirements.trim()) return;
        setIsGenerating(true);
        setResult(null);

        // Mock response simulating Inngest call
        setTimeout(() => {
            setResult({
                diagram: `graph TD
    Client[Client App] --> CDN[CDN / Edge]
    CDN --> LB[Load Balancer]
    LB --> API[API Gateway]
    API --> Auth[Auth Service]
    API --> Core[Core Service]
    API --> Pay[Payment Service]
    Core --> Cache[(Redis Cache)]
    Core --> DB[(PostgreSQL Primary)]
    Pay --> QUEUE[[Msg Queue]]
    QUEUE --> Worker[Background Worker]`,
                stack: [
                    { component: "Frontend", tech: "React Native + Next.js", reason: "Unified code sharing" },
                    { component: "Database", tech: "PostgreSQL + TimescaleDB", reason: "Relational + Time-series needs" },
                    { component: "Queue", tech: "RabbitMQ", reason: "High throughput messaging" }
                ],
                analysis: "Microservices architecture chosen to decouple Payment processing from Core logic, ensuring fault tolerance. Redis implemented for high-read throughput.",
                chaosScenario: "🚨 SIMULATION: Redis Cache Failure. System latency increases by 200ms, but DB read replicas handle the load. No downtime."
            });
            setIsGenerating(false);
        }, 3000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto h-[700px] grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

            {/* Input Panel */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-[#0a0a0f] p-6 rounded-2xl border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <Network className="w-6 h-6 text-purple-500" />
                        System-Nexus
                    </h2>
                    <p className="text-xs text-gray-500 mb-6">AI Architect & Chaos Simulator</p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">System Requirements</label>
                            <Textarea
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                placeholder="e.g. A global video streaming platform like Netflix, handling 10M concurrent users..."
                                className="mt-2 h-40 bg-black/50 border-white/10 text-gray-300 text-sm focus:border-purple-500 resize-none"
                            />
                        </div>

                        <Button
                            onClick={generateArchitecture}
                            disabled={isGenerating || !requirements}
                            className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02]"
                        >
                            {isGenerating ? "Architecting..." : "Design System"}
                        </Button>
                    </div>
                </div>

                {/* Stack Recommendations */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-y-auto"
                    >
                        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Code className="w-4 h-4" /> Recommended Stack
                        </h3>
                        <div className="space-y-3">
                            {result.stack.map((item: any, i: number) => (
                                <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-white">{item.tech}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">{item.component}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-tight">{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Diagram & Chaos Canvas */}
            <div className="lg:col-span-2 bg-[#020204] border border-white/10 rounded-2xl flex flex-col relative overflow-hidden">
                {/* Dot Pattern BG */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 flex-1 flex flex-col p-6">
                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-50">
                            <Server className="w-16 h-16 mb-4" />
                            <p>Awaiting System Design specs...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-purple-900/20 border border-purple-500/30 px-3 py-1 rounded-full text-xs text-purple-300 font-mono">
                                    ARCHITECTURE_DIAGRAM_V1.0
                                </div>
                                <div className="bg-red-900/20 border border-red-500/30 px-3 py-1 rounded-lg max-w-xs">
                                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs mb-1">
                                        <ShieldAlert className="w-3 h-3" /> CHAOS REPORT
                                    </div>
                                    <p className="text-[10px] text-red-300 leading-tight">
                                        {result.chaosScenario}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-auto p-4 cursor-grab active:cursor-grabbing">
                                <MermaidChart chart={result.diagram} />
                            </div>

                            <div className="mt-4 p-4 bg-white/5 rounded-xl border-l-4 border-purple-500">
                                <h4 className="text-sm font-bold text-white mb-2">Architect's Analysis</h4>
                                <p className="text-sm text-gray-300 leading-relaxed font-serif">
                                    "{result.analysis}"
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
