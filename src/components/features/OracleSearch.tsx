'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function OracleSearch({ documentId }: { documentId: string }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        // Mock Tavily Search API call
        setTimeout(() => {
            setResults([
                { title: "Advanced Quantum Computing States", snippet: "New breakthroughs in qubit stability have led to...", url: "#" },
                { title: "MIT Physics: Entanglement Explained", snippet: "Lecture notes covering the basics of EPR paradox...", url: "#" },
                { title: "Recent Papers on Bell's Theorem", snippet: "A collection of 2024 research regarding local realism...", url: "#" },
            ]);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-8 rounded-3xl border border-cyan-500/20 relative overflow-hidden">
                <Globe className="absolute -right-6 -top-6 w-32 h-32 text-cyan-500/10 rotate-12" />

                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Oracle Search
                </h2>
                <p className="text-gray-400 text-sm mb-6 max-w-md">
                    Augment your document with live data from the web. The Oracle finds the latest research to fill knowledge gaps.
                </p>

                <div className="flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask the Oracle..."
                        className="bg-black/50 border-white/10 text-white focus-visible:ring-cyan-500"
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={isLoading || !query}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </Button>
                </div>

                {results.length > 0 && (
                    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {results.map((res, i) => (
                            <div key={i} className="bg-black/40 p-4 rounded-xl border-l-2 border-cyan-500 hover:bg-cyan-500/5 transition-colors cursor-pointer group">
                                <div className="font-semibold text-cyan-300 group-hover:underline mb-1 truncate">{res.title}</div>
                                <p className="text-xs text-gray-400 line-clamp-2">{res.snippet}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
