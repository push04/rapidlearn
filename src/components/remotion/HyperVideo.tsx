'use client';

import React from 'react';
import { Composition, AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, Img, interpolate, spring } from 'remotion';

// Interfaces shared with backend
export interface VideoSegment {
    text: string;
    duration: number;
    visualPrompt: string;
    visualUrl: string;
}

export interface VideoProps {
    title: string;
    segments: VideoSegment[];
    primaryColor?: string;
}

const Segment: React.FC<{ segment: VideoSegment; isActive: boolean }> = ({ segment, isActive }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Zoom effect for background image
    const scale = interpolate(frame, [0, 100], [1, 1.1], {
        extrapolateRight: 'clamp',
    });

    // Fade in text
    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill className="overflow-hidden bg-black">
            {segment.visualUrl ? (
                <Img
                    src={segment.visualUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    style={{ transform: `scale(${scale})` }}
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
            )}

            <AbsoluteFill className="flex items-center justify-center p-12">
                <div
                    className="max-w-4xl bg-black/60 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-2xl"
                    style={{ opacity }}
                >
                    <p className="text-4xl font-bold text-white leading-relaxed text-center font-sans tracking-wide">
                        {segment.text}
                    </p>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

export const HyperVideoComposition: React.FC<VideoProps> = ({ title, segments, primaryColor = '#00f2ff' }) => {
    const { fps } = useVideoConfig();

    // Calculate start frames for each segment
    let currentFrame = 0;
    const segmentFrames = segments.map(seg => {
        const start = currentFrame;
        const durationInFrames = Math.floor(seg.duration * fps);
        currentFrame += durationInFrames;
        return { ...seg, start, durationInFrames };
    });

    return (
        <AbsoluteFill className="bg-black text-white font-sans">
            {/* Intro Title Card - First 3 Seconds */}
            <Sequence from={0} durationInFrames={3 * fps}>
                <AbsoluteFill className="flex flex-col items-center justify-center p-12 bg-[#050505]">
                    <h1
                        className="text-6xl font-black text-center uppercase tracking-tighter"
                        style={{ color: primaryColor, textShadow: `0 0 20px ${primaryColor}40` }}
                    >
                        {title}
                    </h1>
                    <div className="mt-4 text-xl text-gray-400">Rapid-Lecturer Analysis</div>
                </AbsoluteFill>
            </Sequence>

            {/* Segments */}
            {segmentFrames.map((seg, i) => (
                <Sequence key={i} from={seg.start + (3 * fps)} durationInFrames={seg.durationInFrames}>
                    <Segment segment={seg} isActive={true} />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};
