'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserCircle2, Sparkles, Coffee, Glasses } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PERSONAS = [
    { id: 'ghost_nerd', name: 'Hermione', icon: Glasses, color: 'text-blue-400', desc: 'The Perfectionist' },
    { id: 'ghost_slacker', name: 'Ferris', icon: Coffee, color: 'text-yellow-400', desc: 'The Minimalist' },
    { id: 'ghost_curious', name: 'Luna', icon: Sparkles, color: 'text-purple-400', desc: 'The Dreamer' }
];

export default function GhostStudents({ documentId }: { documentId: string }) {
    const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
    const [input, setInput] = useState('');

    const { messages, sendMessage, status } = useChat({
        api: '/api/chat',
        body: { mode: selectedPersona.id, documentContext: `Document ID: ${documentId}` }
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        await sendMessage({ text: input });
        setInput('');
    };

    return (
        <div className="flex flex-col h-[600px] w-full bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-white">Ghost Students</h3>
                </div>
                <div className="flex gap-1">
                    {PERSONAS.map(p => {
                        const Icon = p.icon;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPersona(p)}
                                className={`p-2 rounded-lg transition-all ${selectedPersona.id === p.id ? 'bg-white/10 ring-1 ring-white/50' : 'hover:bg-white/5 text-gray-500'}`}
                                title={p.desc}
                            >
                                <Icon className={`w-4 h-4 ${selectedPersona.id === p.id ? p.color : 'text-current'}`} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full p-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 mt-20">
                            <selectedPersona.icon className={`w-12 h-12 ${selectedPersona.color} opacity-20`} />
                            <p className="text-sm">Chat with <span className={selectedPersona.color}>{selectedPersona.name}</span></p>
                            <p className="text-[10px] uppercase tracking-widest opacity-50">{selectedPersona.desc}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m: any) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'}`}>
                                        <p className="leading-relaxed">{m.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder={`Message ${selectedPersona.name}...`}
                    className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50"
                />
                <Button type="submit" disabled={isLoading} size="icon" className="bg-cyan-600 hover:bg-cyan-500">
                    <Sparkles className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
