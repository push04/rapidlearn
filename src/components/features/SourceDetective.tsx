'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShieldCheck, AlertTriangle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Source {
    id: number;
    title: string;
    url: string;
    snippet: string;
    reliability: 'high' | 'medium' | 'low';
}

export default function SourceDetective({ documentId }: { documentId: string }) {
    const [query, setQuery] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [sources, setSources] = useState<Source[]>([]);
    const [verdict, setVerdict] = useState<'verified' | 'questionable' | null>(null);

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerdict(null);
        setSources([]);

        try {
            // Integrate with /api/tavily/search logic here
            // Mocking for demo
            setTimeout(() => {
                setSources([
                    {
                        id: 1,
                        title: "Quantum Entanglement Verification - Nature Journal",
                        url: "https://nature.com/articles/...",
                        snippet: "Recent experiments confirm Bell's inequality violation with high statistical significance...",
                        reliability: "high"
                    },
                    {
                        id: 2,
                        title: "Physics Stack Exchange Discussion",
                        url: "https://physics.stackexchange.com/...",
                        snippet: "The faster-than-light communication part is a common misconception...",
                        reliability: "medium"
                    }
                ]);
                setVerdict('verified');
                setIsVerifying(false);
            }, 2500);
        } catch (e) {
            setIsVerifying(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 p-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-green-500" />
                    Source Detective
                </h2>
                <p className="text-gray-400">AI Hallucination Checker & Fact Validator</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-14 bg-black/40 border-white/10 text-lg text-white rounded-xl focus:border-green-500/50"
                    placeholder="Paste a claim or statement to verify..."
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                    <Button
                        onClick={handleVerify}
                        disabled={!query.trim() || isVerifying}
                        className="bg-green-600 hover:bg-green-500 text-white font-semibold"
                    >
                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                    </Button>
                </div>
            </div>

            {/* Results */}
            {verdict && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-6"
                >
                    {/* Verdict Card */}
                    <div className={`p-6 rounded-2xl border ${verdict === 'verified' ? 'bg-green-900/10 border-green-500/30' : 'bg-yellow-900/10 border-yellow-500/30'} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${verdict === 'verified' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                                {verdict === 'verified' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${verdict === 'verified' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {verdict === 'verified' ? 'Claim Verified' : 'Evidence Inconclusive'}
                                </h3>
                                <p className="text-gray-400 text-sm">Cross-referenced with {sources.length} authoritative sources.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-white">96%</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest">Confidence</div>
                        </div>
                    </div>

                    {/* Source List */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider ml-2">Evidence Corroboration</h4>
                        {sources.map((source) => (
                            <div key={source.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <a href={source.url} target="_blank" className="font-medium text-cyan-400 hover:underline flex items-center gap-2">
                                        {source.title}
                                        <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                    </a>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded bg-black/50 border ${source.reliability === 'high' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'
                                        }`}>
                                        {source.reliability}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed font-serif italic">"{source.snippet}"</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
