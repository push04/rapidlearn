'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { MousePointer2, Users, MessageSquare, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Cursor {
    x: number;
    y: number;
    user: string;
    color: string;
}

export default function WarRoom({ documentId }: { documentId: string }) {
    const [cursors, setCursors] = useState<Record<string, Cursor>>({});
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    // Mock current user
    const currentUser = 'Commander-' + Math.floor(Math.random() * 1000);
    const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

    useEffect(() => {
        // In a real app, this would use Supabase Realtime 'presence' and 'broadcast'
        // const channel = supabase.channel('room1').on('presence', ...).subscribe();

        // Simulating remote cursors
        const interval = setInterval(() => {
            setCursors(prev => ({
                ...prev,
                'user-2': {
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10,
                    user: 'Lieutenant Star',
                    color: '#2af598'
                },
                'user-3': {
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10,
                    user: 'Cadet Space',
                    color: '#ff0080'
                }
            }));
            setActiveUsers(['Lieutenant Star', 'Cadet Space', currentUser]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        // Broadcast position logic would go here
    };

    return (
        <div className="w-full h-[600px] border border-white/10 rounded-2xl bg-[#050505] relative overflow-hidden cursor-none" onMouseMove={handleMouseMove}>

            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Header */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-4">
                <div className="bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 font-bold text-sm tracking-widest">LIVE WAR ROOM</span>
                </div>
                <div className="flex -space-x-2">
                    {activeUsers.map((u, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-xs font-bold text-gray-300">
                            {u[0]}
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-black flex items-center justify-center text-xs text-gray-500">
                        +2
                    </div>
                </div>
            </div>

            {/* Cursors */}
            <AnimatePresence>
                {Object.entries(cursors).map(([id, cursor]) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, left: `${cursor.x}%`, top: `${cursor.y}%` }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="absolute z-10 pointer-events-none"
                    >
                        <MousePointer2
                            className="w-4 h-4 -rotate-12"
                            fill={cursor.color}
                            color={cursor.color}
                        />
                        <div
                            className="absolute left-4 top-2 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ backgroundColor: cursor.color, color: '#000' }}
                        >
                            {cursor.user}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* User's Cursor (Simulated for visual) */}
            <motion.div
                className="absolute z-30 pointer-events-none"
                style={{ left: '50%', top: '50%' }} // Just center for demo static
            >
                <MousePointer2 className="w-4 h-4 -rotate-12" fill={userColor} color={userColor} />
                <div className="absolute left-4 top-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black">
                    You
                </div>
            </motion.div>

            {/* Content Mockup */}
            <div className="absolute inset-20 bg-white/5 border border-white/10 rounded-xl p-8 flex items-center justify-center text-center">
                <div>
                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Collaborative Canvas</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Real-time study synchronization enabled. Cursors, highlights, and notes are shared instantly across the squad.
                    </p>
                    <Button className="mt-8 bg-white/10 hover:bg-white/20">
                        <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                        Ping Squad
                    </Button>
                </div>
            </div>

            {/* Chat Sidebar Overlay */}
            <div className="absolute top-4 right-4 bottom-4 w-64 bg-black/80 backdrop-blur-xl border-l border-white/10 p-4 rounded-xl flex flex-col">
                <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Tactical Comms
                </h4>
                <div className="flex-1 space-y-3 overflow-y-auto text-xs">
                    <div className="text-gray-400"><span className="text-[#2af598] font-bold">Lt. Star:</span> Check page 42, critical formula.</div>
                    <div className="text-gray-400"><span className="text-[#ff0080] font-bold">Cdt. Space:</span> On it. Calculating divergence.</div>
                </div>
            </div>
        </div>
    );
}
