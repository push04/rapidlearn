'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Music, Volume2, Waves } from 'lucide-react';

export default function SleepLearning() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <div className="bg-[#0a0a12] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500">
                {/* Visualizer Background */}
                <div className={`absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-30'}`} />

                <div className="relative z-10 text-center space-y-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-white/5 flex items-center justify-center relative">
                        {isPlaying && (
                            <div className="absolute inset-0 rounded-full border border-purple-500/50 animate-ping" />
                        )}
                        <Moon className={`w-8 h-8 ${isPlaying ? 'text-purple-400' : 'text-gray-600'}`} />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white">Theta Wave Generator</h3>
                        <p className="text-xs text-gray-500 mt-2">Binaural beats (4-7Hz) for subconscious retention</p>
                    </div>

                    <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-full h-12 rounded-xl text-sm font-bold tracking-widest transition-all duration-300 ${isPlaying
                                ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.4)]'
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {isPlaying ? 'PAUSE SESSION' : 'INITIATE SLEEP MODE'}
                    </Button>

                    <div className="flex justify-between items-center text-xs text-gray-600 px-4">
                        <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> 432 Hz</span>
                        <span className="flex items-center gap-1"><Waves className="w-3 h-3" /> Theta</span>
                        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Ambient</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
