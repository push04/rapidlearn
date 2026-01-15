'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { type Message } from 'ai';
// ... (lines in between are fine, I will use multi_replace or separate replace calls if needed, but let's just do imports first then usage)
// Wait, replace_file_content is for contiguous block.
// I need to change line 4 AND line 63.
// So I should use multi_replace_file_content.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Send, Swords, ShieldAlert, Bot, User, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DebateArena({ documentId }: { documentId: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Custom hook for Debate Mode
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        body: {
            documentId,
            mode: 'debate' // Triggers DEBATE_ADVERSARY system prompt
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto border border-white/10 rounded-2xl bg-black shadow-2xl overflow-hidden relative">

            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-orange-900/10 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 bg-white/5 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 rounded-lg border border-red-500/30">
                        <Swords className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Socratic Arena</h3>
                        <p className="text-xs text-red-400">Challenge your assumptions</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-full border border-orange-500/30">
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-xs font-mono text-orange-400">INTENSITY: HIGH</span>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 relative z-10" ref={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto">
                    {messages.length === 0 && (
                        <div className="text-center mt-20 opacity-50">
                            <Swords className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400">State your argument. Prepare to be tested.</p>
                        </div>
                    )}

                    {messages.map((m: Message) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-4",
                                m.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                                m.role === 'user'
                                    ? "bg-blue-600 text-white border-blue-400"
                                    : "bg-red-600 text-white border-red-500"
                            )}>
                                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            <div className={cn(
                                "p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg",
                                m.role === 'user'
                                    ? "bg-blue-600/10 border border-blue-500/30 text-blue-100 rounded-tr-none"
                                    : "bg-red-600/10 border border-red-500/30 text-red-100 rounded-tl-none"
                            )}>
                                {m.content}
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1 h-2 items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 relative z-20">
                <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto flex gap-3">
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                    >
                        <Mic className="w-5 h-5" />
                    </Button>

                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Defend your position..."
                        className="bg-white/5 border-white/10 w-full focus-visible:ring-red-500 text-white"
                    />

                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all hover:scale-105"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
