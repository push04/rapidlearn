'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlitchMnemonics() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const generate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            // setGeneratedImage('https://placeholder.com/glitch-art.png'); // Placeholder
            setGeneratedImage('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80'); // Cyberpunk placeholder
        }, 2000);
    };

    return (
        <div className="w-full h-full p-6 flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Glitch-Mnemonics
                </h2>
                <p className="text-gray-400 text-sm mt-1">Generate surreal visual aids for memory retention.</p>
            </div>

            <div className="flex gap-2">
                <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe a concept to visualize..."
                    className="bg-white/5 border-white/10 text-white"
                />
                <Button onClick={generate} disabled={isGenerating || !prompt} className="bg-purple-600 hover:bg-purple-500">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                </Button>
            </div>

            <div className="flex-1 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center p-4 relative group">
                {generatedImage ? (
                    <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={generatedImage}
                        alt="Generated Mnemonic"
                        className="max-h-full rounded-lg shadow-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="text-gray-600 flex flex-col items-center">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">Enter a prompt to manifest visuals</p>
                    </div>
                )}

                {generatedImage && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <p className="text-white font-mono text-xs">GLITCH_V1 // MEMORY_ANCHOR_ESTABLISHED</p>
                    </div>
                )}
            </div>
        </div>
    );
}
