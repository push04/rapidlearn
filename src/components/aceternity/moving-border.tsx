'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MovingBorderProps {
    children: React.ReactNode;
    duration?: number;
    className?: string;
    containerClassName?: string;
    borderClassName?: string;
    as?: React.ElementType;
    borderRadius?: string;
}

export const MovingBorder = ({
    children,
    duration = 2000,
    className,
    containerClassName,
    borderClassName,
    as: Component = 'div',
    borderRadius = '1rem',
}: MovingBorderProps) => {
    return (
        <Component
            className={cn(
                'relative p-[1px] overflow-hidden',
                containerClassName
            )}
            style={{
                borderRadius,
            }}
        >
            <div
                className="absolute inset-0"
                style={{ borderRadius }}
            >
                <MovingBorderGradient duration={duration} borderRadius={borderRadius} className={borderClassName} />
            </div>
            <div
                className={cn(
                    'relative bg-[#050505] z-10',
                    className
                )}
                style={{
                    borderRadius: `calc(${borderRadius} - 1px)`,
                }}
            >
                {children}
            </div>
        </Component>
    );
};

const MovingBorderGradient = ({
    duration,
    borderRadius,
    className,
}: {
    duration: number;
    borderRadius: string;
    className?: string;
}) => {
    const pathRef = useRef<SVGRectElement>(null);
    const [pathLength, setPathLength] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (pathRef.current) {
                const parent = pathRef.current.closest('div');
                if (parent) {
                    setDimensions({
                        width: parent.offsetWidth,
                        height: parent.offsetHeight,
                    });
                }
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength?.() || 0);
        }
    }, [dimensions]);

    return (
        <svg
            className={cn('absolute inset-0 w-full h-full', className)}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id="moving-border-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f2ff" />
                    <stop offset="50%" stopColor="#bd00ff" />
                    <stop offset="100%" stopColor="#00f2ff" />
                </linearGradient>
            </defs>
            <rect
                ref={pathRef}
                x="0.5"
                y="0.5"
                width={Math.max(0, dimensions.width - 1)}
                height={Math.max(0, dimensions.height - 1)}
                rx={borderRadius}
                ry={borderRadius}
                fill="none"
                stroke="url(#moving-border-gradient)"
                strokeWidth="2"
                className="opacity-50"
            />
            <motion.rect
                x="0.5"
                y="0.5"
                width={Math.max(0, dimensions.width - 1)}
                height={Math.max(0, dimensions.height - 1)}
                rx={borderRadius}
                ry={borderRadius}
                fill="none"
                stroke="url(#moving-border-gradient)"
                strokeWidth="2"
                strokeDasharray={pathLength}
                strokeDashoffset={pathLength}
                animate={{
                    strokeDashoffset: [pathLength, 0],
                }}
                transition={{
                    duration: duration / 1000,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
        </svg>
    );
};

// Button variant with moving border
interface MovingBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    duration?: number;
    borderRadius?: string;
    containerClassName?: string;
}

export const MovingBorderButton = ({
    children,
    duration = 2000,
    borderRadius = '0.75rem',
    containerClassName,
    className,
    ...props
}: MovingBorderButtonProps) => {
    return (
        <button
            className={cn(
                'relative p-[1px] overflow-hidden group',
                containerClassName
            )}
            style={{ borderRadius }}
            {...props}
        >
            <div className="absolute inset-0" style={{ borderRadius }}>
                <MovingBorderGradient duration={duration} borderRadius={borderRadius} />
            </div>
            <div
                className={cn(
                    'relative bg-[#050505] px-6 py-3 z-10 font-semibold text-white',
                    'transition-all duration-300',
                    'group-hover:bg-[#0a0a0f]',
                    className
                )}
                style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
            >
                {children}
            </div>
        </button>
    );
};
