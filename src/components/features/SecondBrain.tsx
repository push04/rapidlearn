'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Link2, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Connection {
    id: string;
    documentTitle: string;
    snippet: string;
    similarity: number;
}

export default function SecondBrain({ documentId }: { documentId: string }) {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const findConnections = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/brain/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId })
            });
            const data = await res.json();
            setConnections(data.connections || []);
            setHasLoaded(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full bg-[#050505] p-6 border-lborder-white/10 flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-pink-500" />
                    Second Brain
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    Neural Semantic Linking across your knowledge base.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {!hasLoaded && (
                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-4">
                        <div className="p-4 rounded-full bg-white/5 border border-white/10">
                            <Link2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Discover hidden connections between this document and your other studies.
                        </p>
                        <Button
                            onClick={findConnections}
                            disabled={isLoading}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                            Activate Neural Link
                        </Button>
                    </div>
                )}

                <AnimatePresence>
                    {connections.map((conn, i) => (
                        <motion.div
                            key={conn.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-4 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all cursor-pointer"
                        >
                            <div className="absolute top-3 right-3 text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full">
                                {Math.round(conn.similarity * 100)}% MATCH
                            </div>

                            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <FileText className="w-3 h-3 text-gray-400" />
                                {conn.documentTitle}
                            </h3>

                            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 group-hover:text-gray-300">
                                "{conn.snippet}"
                            </p>

                            <div className="mt-3 flex items-center text-[10px] text-pink-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                VIEW SOURCE <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {hasLoaded && connections.length === 0 && (
                    <div className="text-center text-gray-500 text-sm mt-10">
                        No semantic connections found. Try adding more documents.
                    </div>
                )}
            </div>
        </div>
    );
}
