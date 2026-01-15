'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Volume2, User2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PodcastCallIn({ isActive = false }: { isActive?: boolean }) {
    const [isCalling, setIsCalling] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [connected, setConnected] = useState(false);

    const toggleCall = () => {
        if (!connected) {
            setIsCalling(true);
            setTimeout(() => {
                setIsCalling(false);
                setConnected(true);
            }, 2000);
        } else {
            setConnected(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col items-center gap-4 w-64"
            >
                <div className="flex items-center gap-4 w-full">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${connected ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-400'}`}>
                        {connected ? <Volume2 className="w-6 h-6 animate-pulse" /> : <User2 className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">Hyper-Live</h3>
                        <p className="text-xs text-green-400">
                            {connected ? 'On Air • 00:42' : isCalling ? 'Connecting...' : 'Call Line Open'}
                        </p>
                    </div>
                </div>

                {connected && (
                    <div className="w-full bg-white/5 h-12 rounded-xl flex items-center justify-center">
                        <div className="flex gap-1 items-end h-6">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-cyan-500 rounded-full"
                                    animate={{ height: [4, 16, 8, 24, 4] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 w-full">
                    <Button
                        onClick={toggleCall}
                        variant={connected ? "destructive" : "default"}
                        className={`flex-1 font-bold ${!connected && 'bg-green-600 hover:bg-green-500'}`}
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        {connected ? 'Hang Up' : 'Call In'}
                    </Button>

                    {connected && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsMuted(!isMuted)}
                            className="bg-white/5 border-white/10"
                        >
                            {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
