'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { HyperVideoComposition, VideoProps } from '@/components/remotion/HyperVideo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Clapperboard, Play, Sparkles } from 'lucide-react';
import { inngest } from '@/inngest/client';

export default function HyperLecturer({ documentId, userId }: { documentId: string; userId: string }) {
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState('viral');
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoData, setVideoData] = useState<VideoProps | null>(null);

    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true);

        try {
            // Trigger Inngest function
            // Note: In a real client, we'd call an API route that triggers Inngest
            // For now, simulating the response or connecting via API
            // Mocking the result for immediate feedback while waiting for backend integration

            // Simulating a delay and success for the UI
            setTimeout(() => {
                setVideoData({
                    title: topic,
                    primaryColor: "#00f2ff",
                    segments: [
                        { text: "Welcome to the future of learning.", duration: 3, visualPrompt: "Futuristic city", visualUrl: "" },
                        { text: "Quantum entanglement connects us all.", duration: 4, visualPrompt: "Particles connecting", visualUrl: "" },
                        { text: "This is RapidLearn.", duration: 3, visualPrompt: "Brain network", visualUrl: "" }
                    ]
                });
                setIsGenerating(false);
            }, 3000);

        } catch (error) {
            console.error("Failed to generate", error);
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 p-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center gap-3">
                    <Clapperboard className="w-8 h-8 text-cyan-400" />
                    Rapid-Lecturer Studio
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto">
                    Transform your documents into viral educational shorts using AI & Remotion.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-lg h-fit">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Video Topic</label>
                        <Input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. key concepts, summary, history of..."
                            className="bg-black/50 border-white/10 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Style</label>
                        <div className="flex gap-2">
                            {['viral', 'academic', 'documentary'].map(s => (
                                <Button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    variant={style === s ? 'default' : 'outline'}
                                    className={`flex-1 capitalize ${style === s ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-white/10 bg-transparent text-gray-400'}`}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating Script & Scenes...</>
                        ) : (
                            <><Sparkles className="w-4 h-4 mr-2" /> Generate Video</>
                        )}
                    </Button>
                </div>

                {/* Player Preview */}
                <div className="relative aspect-[9/16] max-h-[700px] mx-auto w-full max-w-sm bg-black rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl">
                    {videoData ? (
                        <Player
                            component={HyperVideoComposition}
                            inputProps={videoData}
                            durationInFrames={videoData.segments.reduce((acc, s) => acc + (s.duration * 30), 3 * 30)}
                            fps={30}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            controls
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-8 text-center bg-[#050505]">
                            <Clapperboard className="w-12 h-12 opacity-20 mb-4" />
                            <h3 className="text-lg font-bold text-gray-500">Preview Canvas</h3>
                            <p className="text-sm mt-2">Generated video content will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
