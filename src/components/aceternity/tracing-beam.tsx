'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TracingBeamProps {
    children: React.ReactNode;
    className?: string;
}

export const TracingBeam = ({ children, className }: TracingBeamProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [svgHeight, setSvgHeight] = useState(0);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end end'],
    });

    useEffect(() => {
        if (contentRef.current) {
            setSvgHeight(contentRef.current.offsetHeight);
        }
    }, []);

    const y1 = useTransform(scrollYProgress, [0, 1], [0, svgHeight]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, svgHeight - 200]);

    return (
        <div ref={ref} className={cn('relative', className)}>
            <div className="absolute left-0 top-3 w-10 h-full">
                <svg
                    viewBox={`0 0 20 ${svgHeight}`}
                    width="20"
                    height={svgHeight}
                    className="block"
                    aria-hidden="true"
                >
                    <motion.path
                        d={`M 10 0 V ${svgHeight}`}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                    />
                    <motion.path
                        d={`M 10 0 V ${svgHeight}`}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        style={{
                            pathLength: scrollYProgress,
                        }}
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00f2ff" />
                            <stop offset="50%" stopColor="#bd00ff" />
                            <stop offset="100%" stopColor="#00f2ff" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Animated dot */}
                <motion.div
                    className="absolute left-[5px] w-[10px] h-[10px] rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]"
                    style={{ top: y1 }}
                />
            </div>

            <div ref={contentRef} className="pl-16">
                {children}
            </div>
        </div>
    );
};

// Chat message with tracing effect
interface TracingMessageProps {
    content: string;
    role: 'user' | 'assistant';
    isStreaming?: boolean;
    className?: string;
}

export const TracingMessage = ({
    content,
    role,
    isStreaming,
    className,
}: TracingMessageProps) => {
    return (
        <div className={cn(
            'relative pl-8 py-4',
            className
        )}>
            {/* Connection line */}
            <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-[rgba(0,242,255,0.3)] to-transparent" />

            {/* Node dot */}
            <div className={cn(
                'absolute left-[-4px] top-6 w-[9px] h-[9px] rounded-full border-2',
                role === 'user'
                    ? 'bg-[#bd00ff] border-[#bd00ff] shadow-[0_0_10px_rgba(189,0,255,0.5)]'
                    : 'bg-[#00f2ff] border-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.5)]'
            )} />

            {/* Message content */}
            <div className={cn(
                'p-4 rounded-xl',
                role === 'user'
                    ? 'bg-[rgba(189,0,255,0.1)] border border-[rgba(189,0,255,0.2)]'
                    : 'bg-[rgba(0,242,255,0.05)] border border-[rgba(0,242,255,0.1)]'
            )}>
                <div className="text-xs text-[#a0a0a0] mb-2">
                    {role === 'user' ? 'You' : 'RapidLearn'}
                </div>
                <div className="text-white whitespace-pre-wrap">
                    {content}
                    {isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-[#00f2ff] animate-pulse" />
                    )}
                </div>
            </div>
        </div>
    );
};

// Timeline component
interface TimelineItem {
    title: string;
    description: string;
    icon?: React.ReactNode;
    status?: 'complete' | 'active' | 'pending';
}

interface TimelineProps {
    items: TimelineItem[];
    className?: string;
}

export const Timeline = ({ items, className }: TimelineProps) => {
    return (
        <div className={cn('relative', className)}>
            {items.map((item, index) => (
                <div key={index} className="relative pl-8 pb-8 last:pb-0">
                    {/* Connecting line */}
                    {index < items.length - 1 && (
                        <div className={cn(
                            'absolute left-[11px] top-6 w-px h-full',
                            item.status === 'complete'
                                ? 'bg-gradient-to-b from-[#00f2ff] to-[#bd00ff]'
                                : 'bg-[rgba(255,255,255,0.1)]'
                        )} />
                    )}

                    {/* Status dot */}
                    <div className={cn(
                        'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center',
                        item.status === 'complete' && 'bg-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.5)]',
                        item.status === 'active' && 'bg-[#bd00ff] shadow-[0_0_15px_rgba(189,0,255,0.5)] animate-pulse',
                        item.status === 'pending' && 'bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)]'
                    )}>
                        {item.icon || (
                            item.status === 'complete' ? (
                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    item.status === 'active' ? 'bg-white' : 'bg-[rgba(255,255,255,0.3)]'
                                )} />
                            )
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <h4 className={cn(
                            'font-semibold',
                            item.status === 'pending' ? 'text-[#666]' : 'text-white'
                        )}>
                            {item.title}
                        </h4>
                        <p className="text-sm text-[#a0a0a0] mt-1">
                            {item.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
