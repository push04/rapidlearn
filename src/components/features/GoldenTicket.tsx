'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trophy, Play, Loader2, Star, Clock, User } from 'lucide-react';
import { MovingBorder } from '@/components/aceternity/moving-border';
import { cn } from '@/lib/utils';

interface VideoResult {
    videoId: string;
    title: string;
    channelTitle: string;
    embedUrl: string;
    whyItWon?: string;
    missingFromOthers?: string[];
    summary?: string;
    scores?: {
        informationDensity: number;
        clarity: number;
        accuracy: number;
        engagement: number;
    };
}

interface GoldenTicketProps {
    className?: string;
    onVideoSelect?: (video: VideoResult) => void;
}

export const GoldenTicket = ({ className, onVideoSelect }: GoldenTicketProps) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [winner, setWinner] = useState<VideoResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);
        setWinner(null);

        try {
            // Start the analysis (returns immediately with session ID)
            const response = await fetch('/api/youtube/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    userId: 'demo-user', // In production, use actual user ID
                    maxResults: 10,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Search failed');
            }

            setSessionId(data.sessionId);

            // For demo, show a quick search result
            // In production, you'd poll for the Inngest job result
            const quickResponse = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=1`);
            const quickData = await quickResponse.json();

            if (quickData.videos?.length > 0) {
                const video = quickData.videos[0];
                setWinner({
                    videoId: video.videoId,
                    title: video.title,
                    channelTitle: video.channelTitle,
                    embedUrl: video.embedUrl,
                    whyItWon: 'This video was selected as the top result for your query. Full AI analysis is processing...',
                    scores: {
                        informationDensity: 8,
                        clarity: 9,
                        accuracy: 8,
                        engagement: 7,
                    },
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSearching(false);
        }
    }, [query]);

    const ScoreBar = ({ label, score }: { label: string; score: number }) => (
        <div className="flex items-center gap-3">
            <span className="text-xs text-[#a0a0a0] w-24">{label}</span>
            <div className="flex-1 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score * 10}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#00f2ff] to-[#bd00ff] rounded-full"
                />
            </div>
            <span className="text-xs font-mono text-[#00f2ff] w-8">{score}/10</span>
        </div>
    );

    return (
        <div className={cn('flex flex-col gap-6', className)}>
            {/* Search Input */}
            <MovingBorder duration={3000} borderRadius="0.75rem" className="p-4">
                <div className="flex items-center gap-4">
                    <Trophy className="w-6 h-6 text-[#ffd700]" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search for the best video on any topic..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#666]"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !query.trim()}
                        className={cn(
                            'px-4 py-2 rounded-lg font-semibold transition-all duration-300',
                            'bg-gradient-to-r from-[#00f2ff] to-[#bd00ff]',
                            'hover:shadow-[0_0_20px_rgba(0,242,255,0.5)]',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        {isSearching ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </MovingBorder>

            {/* Error State */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-lg bg-[rgba(255,0,128,0.1)] border border-[rgba(255,0,128,0.3)] text-[#ff0080]"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            <AnimatePresence>
                {isSearching && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 py-8"
                    >
                        <div className="relative w-16 h-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00f2ff] border-r-[#bd00ff]"
                            />
                            <Trophy className="absolute inset-0 m-auto w-8 h-8 text-[#ffd700]" />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-semibold">Finding the Golden Ticket...</p>
                            <p className="text-sm text-[#a0a0a0]">Analyzing top videos for &quot;{query}&quot;</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Winner Card */}
            <AnimatePresence>
                {winner && !isSearching && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        {/* Trophy Header */}
                        <div className="flex items-center gap-3 text-[#ffd700]">
                            <Trophy className="w-6 h-6" />
                            <span className="font-bold text-lg">The Golden Ticket Winner</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-[#ffd700] to-transparent" />
                        </div>

                        {/* Video Embed */}
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-[rgba(255,215,0,0.3)] shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                            <iframe
                                src={winner.embedUrl}
                                title={winner.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Video Info */}
                        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
                            <h3 className="font-semibold text-white text-lg mb-2">{winner.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-[#a0a0a0] mb-4">
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {winner.channelTitle}
                                </span>
                            </div>

                            {/* Scores */}
                            {winner.scores && (
                                <div className="space-y-2 mb-4">
                                    <ScoreBar label="Info Density" score={winner.scores.informationDensity} />
                                    <ScoreBar label="Clarity" score={winner.scores.clarity} />
                                    <ScoreBar label="Accuracy" score={winner.scores.accuracy} />
                                    <ScoreBar label="Engagement" score={winner.scores.engagement} />
                                </div>
                            )}

                            {/* Why It Won */}
                            {winner.whyItWon && (
                                <div className="p-3 rounded-lg bg-[rgba(0,242,255,0.05)] border border-[rgba(0,242,255,0.2)]">
                                    <h4 className="text-sm font-semibold text-[#00f2ff] mb-1">🏆 Why It Won</h4>
                                    <p className="text-sm text-[#a0a0a0]">{winner.whyItWon}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => onVideoSelect?.(winner)}
                            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-[#00f2ff] to-[#bd00ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all duration-300"
                        >
                            <Play className="w-5 h-5 inline mr-2" />
                            Study This Video
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
