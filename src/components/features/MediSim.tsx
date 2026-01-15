'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeartPulse, Stethoscope, Activity, User, Bot, AlertTriangle, Syringe, Pill, FileHeart } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'patient' | 'system';
    content: string;
}

export default function MediSim({ documentId }: { documentId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'system', content: 'VIRTUAL PATIENT ENCOUNTER STARTED. \nPatient: 45M \nChief Complaint: "Chest pain started 30 mins ago"' },
        { id: '2', role: 'patient', content: "Doc, my chest feels terrifyingly tight. Like an elephant is sitting on it." }
    ]);
    const [input, setInput] = useState('');
    const [vitals, setVitals] = useState({ hr: 110, bp: '145/90', o2: 96, temp: 37.2 });
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsTyping(true);

        // Mock AI Response simulation
        // In production, this would call /api/medisim/run (Inngest)
        setTimeout(() => {
            let responseContent = "I don't know doc, it just hurts.";
            // Simple mock logic for demo
            if (input.toLowerCase().includes('radiate') || input.toLowerCase().includes('arm')) {
                responseContent = "Yeah, it shoots down my left arm actually. My jaw aches too.";
            } else if (input.toLowerCase().includes('breath')) {
                responseContent = "I feel a bit short of breath, yes.";
            } else if (input.toLowerCase().includes('ecg') || input.toLowerCase().includes('ekg')) {
                setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: 'ORDERING: 12-lead ECG...' }]);
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: 'res-' + Date.now(), role: 'system', content: 'RESULT: ST-segment elevation in leads V2-V4 (Anterior STEMI)' }]);
                }, 1000);
                responseContent = "Is it bad doc? I'm sweating bullets here.";
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'patient', content: responseContent }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="w-full max-w-6xl mx-auto h-[700px] grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">

            {/* Patient Vitals Monitor (Sidebar) */}
            <div className="lg:col-span-1 bg-black border border-gray-800 rounded-2xl p-4 flex flex-col gap-4 shadow-[0_0_30px_rgba(0,255,0,0.05)]">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                    <span className="font-mono text-green-500 text-sm font-bold tracking-widest">LIVE VITALS</span>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border-l-4 border-green-500">
                    <div className="text-gray-400 text-xs uppercase mb-1">Heart Rate</div>
                    <div className="text-3xl font-black text-green-400 font-mono flex items-end gap-2">
                        {vitals.hr} <span className="text-sm text-gray-500 mb-1">bpm</span>
                    </div>
                    <div className="h-8 w-full mt-2">
                        {/* Mock ECG Line */}
                        <svg className="w-full h-full text-green-900" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path d="M0,10 L10,10 L15,2 L20,18 L25,10 L35,10 L40,10 L45,2 L50,18 L55,10 L100,10" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border-l-4 border-blue-500">
                    <div className="text-gray-400 text-xs uppercase mb-1">Blood Pressure</div>
                    <div className="text-3xl font-black text-blue-400 font-mono flex items-end gap-2">
                        {vitals.bp} <span className="text-sm text-gray-500 mb-1">mmHg</span>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border-l-4 border-cyan-500">
                    <div className="text-gray-400 text-xs uppercase mb-1">O2 Saturation</div>
                    <div className="text-3xl font-black text-cyan-400 font-mono flex items-end gap-2">
                        {vitals.o2}% <span className="text-sm text-gray-500 mb-1">Ra</span>
                    </div>
                </div>

                <div className="mt-auto">
                    <Button variant="destructive" className="w-full font-bold animate-pulse">
                        CODE BLUE
                    </Button>
                </div>
            </div>

            {/* Main Encounter Area */}
            <div className="lg:col-span-3 bg-[#0a0a0a] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Case #892: Acute Chest Pain</h2>
                            <p className="text-xs text-gray-400">Time Elapsed: 00:04:12</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/10">
                            <FileHeart className="w-4 h-4 mr-2" />
                            Labs
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/10">
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Exam
                        </Button>
                    </div>
                </div>

                {/* Chat Feed */}
                <ScrollArea className="flex-1 p-6 space-y-6">
                    <div className="space-y-6 pb-4">
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {m.role === 'system' ? (
                                    <div className="w-full flex justify-center my-4">
                                        <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            {m.content}
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${m.role === 'user' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-green-700 border-green-500 text-white'
                                            }`}>
                                            {m.role === 'user' ? <Stethoscope className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-md ${m.role === 'user'
                                                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none'
                                                : 'bg-gray-800/80 border border-gray-700 text-gray-100 rounded-tl-none'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-700 border border-green-500 text-white flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1 h-2 items-center">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 z-20">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
                        <Button size="sm" variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs border border-white/10">
                            <Pill className="w-3 h-3 mr-1" /> Administer Aspirin
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs border border-white/10">
                            <Syringe className="w-3 h-3 mr-1" /> IV Access
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs border border-white/10">
                            <Activity className="w-3 h-3 mr-1" /> 12-Lead ECG
                        </Button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask patient or order test..."
                            className="bg-gray-900 border-gray-700 text-white focus-visible:ring-green-500"
                        />
                        <Button type="submit" disabled={!input || isTyping} className="bg-green-600 hover:bg-green-500 text-white font-bold">
                            Send
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
