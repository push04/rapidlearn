'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Play, Pause, FastForward, Rewind, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeepDivePodcast({ documentId, userId }: { documentId: string; userId: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [script, setScript] = useState<Array<{ speaker: 'alex' | 'jordan'; text: string }>>([]);

    // Mock data loader
    useEffect(() => {
        // Simulate fetching generated podcast
        setTimeout(() => {
            setScript([
                { speaker: 'alex', text: "So, we're looking at Quantum Entanglement today. It sounds complicated." },
                { speaker: 'jordan', text: "It is, but think of it like this: two particles linked across space. Change one, the other changes instantly." },
                { speaker: 'alex', text: "Instantly? Faster than light?" },
                { speaker: 'jordan', text: "Exactly. That's why Einstein called it 'spooky action at a distance'." },
                { speaker: 'alex', text: "That breaks everything I thought I knew about physics." },
                { speaker: 'jordan', text: "You're not alone. It challenged the very foundation of local realism." }
            ]);
            setDuration(180); // 3 minutes
        }, 1500);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Deep Dive Audio</h2>
                <p className="text-gray-400">AI-generated conversation about your document.</p>
            </div>

            {/* Audio Player Card */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">

                {/* Visualizer Background Mock */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none gap-1">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ height: isPlaying ? [20, 60, 30, 80, 40] : 10 }}
                            transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
                            className="w-4 bg-cyan-500 rounded-full"
                        />
                    ))}
                </div>

                <div className="relative z-10 flex flex-col item-center justify-center space-y-8">
                    {/* Speakers */}
                    <div className="flex justify-between items-center px-12">
                        <div className={`flex flex-col items-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-50'}`}>
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-2">
                                <span className="text-xl font-bold text-white">A</span>
                            </div>
                            <span className="text-xs font-medium text-blue-400">ALEX</span>
                        </div>

                        <div className="flex-1 text-center px-4">
                            <span className="text-xs text-xs tracking-widest text-gray-500 uppercase">Now Playing</span>
                            <h3 className="text-xl font-semibold text-white mt-1">Quantum Mechanics 101</h3>
                        </div>

                        <div className={`flex flex-col items-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-50'}`}>
                            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mb-2">
                                <span className="text-xl font-bold text-white">J</span>
                            </div>
                            <span className="text-xs font-medium text-purple-400">JORDAN</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center space-y-4">
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />

                        <div className="flex items-center gap-6">
                            <button className="text-gray-400 hover:text-white transition-colors"><Rewind className="w-6 h-6" /></button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                            </button>
                            <button className="text-gray-400 hover:text-white transition-colors"><FastForward className="w-6 h-6" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transcript */}
            <div className="bg-black/20 border border-white/5 rounded-xl p-6 h-[400px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                <h4 className="text-sm font-semibold text-gray-400 sticky top-0 bg-[#050505] pb-2 border-b border-white/5">Transcript</h4>
                {script.map((line, i) => (
                    <div key={i} className={`flex gap-4 ${line.speaker === 'alex' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${line.speaker === 'alex' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'}`}>
                            {line.speaker === 'alex' ? 'A' : 'J'}
                        </div>
                        <div className={`bg-white/5 rounded-lg p-3 max-w-[80%] text-sm text-gray-300`}>
                            {line.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
