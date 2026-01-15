'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scale, Gavel, FileText, Briefcase, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LexMind({ documentId }: { documentId: string }) {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'brief' | 'argue'>('brief');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Mock Analysis Function
    const runAnalysis = () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setResult('');

        // Mock response simulating Inngest delay
        setTimeout(() => {
            if (mode === 'brief') {
                setResult(`**CASE BRIEF ANALYSIS**
            
**I. FACTS:**
The defendant, Mr. Smith, was apprehended at the scene with...

**II. ISSUE:**
Whether the search conducted by Officer Jones violated the Fourth Amendment protections against unreasonable search and seizure.

**III. HOLDING:**
No. The court held that the Exigent Circumstances exception applied.

**IV. REASONING:**
The court reasoned that the potential destruction of evidence created an immediate necessity...`);
            } else {
                setResult(`**OPPOSING COUNSEL REBUTTAL**

"Your Honor, the prosecution's argument rests efficiently on the 'Exigent Circumstances' doctrine, yet they conveniently ignore the precedent set in *mumble v. mumble*.

1. **Lack of Immediacy**: There was no immediate threat to evidence.
2. **Warrant Feasibility**: Officers had ample time to secure a telephonic warrant.
3. **Privacy Expectation**: The defendant was in his private residence.

Therefore, the evidence must be suppressed."`);
            }
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 h-[700px]">

            {/* Control Panel */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-[#1a1614] border border-[#d4af37]/30 p-6 rounded-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Scale className="w-24 h-24 text-[#d4af37]" />
                    </div>

                    <h2 className="text-2xl font-serif text-[#d4af37] mb-2 flex items-center gap-2">
                        <Gavel className="w-6 h-6" />
                        Lex-Mind
                    </h2>
                    <p className="text-xs text-[#a8a8a8] font-serif italic mb-6">Automated Legal Associate & Adversary</p>

                    <div className="space-y-4">
                        <Button
                            variant={mode === 'brief' ? 'secondary' : 'ghost'}
                            onClick={() => setMode('brief')}
                            className={`w-full justify-start ${mode === 'brief' ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/50' : 'text-gray-400'}`}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Case Brief
                        </Button>
                        <Button
                            variant={mode === 'argue' ? 'secondary' : 'ghost'}
                            onClick={() => setMode('argue')}
                            className={`w-full justify-start ${mode === 'argue' ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/50' : 'text-gray-400'}`}
                        >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Argue Motion
                        </Button>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-xs text-gray-500 font-mono">
                    <div className="mb-2 font-bold text-gray-400 flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        CITED PRECEDENTS
                    </div>
                    <ul className="space-y-2">
                        <li className="flex justify-between">
                            <span>Miranda v. Arizona</span>
                            <span className="text-[#d4af37]">1966</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Terry v. Ohio</span>
                            <span className="text-[#d4af37]">1968</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Mapp v. Ohio</span>
                            <span className="text-[#d4af37]">1961</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Workspace */}
            <div className="md:col-span-2 flex flex-col gap-4">
                {/* Input */}
                <div className="bg-[#1a1614] p-4 rounded-xl border border-white/10 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider">
                        {mode === 'brief' ? 'Paste Case Text / Facts' : 'Draft Your Argument'}
                    </h3>
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'brief' ? "Paste the full text of the judicial opinion here..." : "State your legal argument for the motion..."}
                        className="min-h-[120px] bg-black/30 border-[#d4af37]/20 text-gray-300 font-serif focus-visible:ring-[#d4af37]"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={runAnalysis}
                            disabled={isLoading || !input.trim()}
                            className="bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold font-serif"
                        >
                            {isLoading ? "Consulting Precedents..." : "Analyze"}
                        </Button>
                    </div>
                </div>

                {/* Output */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col relative">
                    <div className="bg-black/50 p-3 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400">LEGAL MEMORANDUM</span>
                        {result && <span className="text-[10px] text-green-500 font-mono">READY</span>}
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        {result ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="prose prose-invert prose-sm max-w-none font-serif text-gray-300 whitespace-pre-wrap leading-relaxed"
                            >
                                {result.split('\n').map((line, i) => (
                                    <div key={i}>
                                        {line.startsWith('**') ? <strong className="text-[#d4af37] block mt-4 mb-2 text-lg">{line.replace(/\*\*/g, '')}</strong> : line}
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600 italic font-serif">
                                Awaiting input for analysis...
                            </div>
                        )}
                    </ScrollArea>

                    {isLoading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                                <Scale className="w-12 h-12 text-[#d4af37] animate-pulse" />
                                <div className="text-[#d4af37] font-serif text-sm">Weighing Arguments...</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
