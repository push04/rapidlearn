'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoGridProps {
    className?: string;
    children?: React.ReactNode;
}

export const BentoGrid = ({ className, children }: BentoGridProps) => {
    return (
        <div
            className={cn(
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]',
                className
            )}
        >
            {children}
        </div>
    );
};

interface BentoGridItemProps {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    children,
    onClick,
}: BentoGridItemProps) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={cn(
                'group/bento relative overflow-hidden rounded-xl',
                'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]',
                'p-4 flex flex-col justify-between space-y-4',
                'hover:border-[rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.1)]',
                'transition-all duration-300 cursor-pointer',
                className
            )}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,242,255,0.05)] to-[rgba(189,0,255,0.05)] opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300" />

            {header && (
                <div className="relative z-10">
                    {header}
                </div>
            )}

            <div className="relative z-10 flex flex-col gap-2">
                {icon && (
                    <div className="flex items-center gap-2 text-[#00f2ff]">
                        {icon}
                    </div>
                )}

                {title && (
                    <div className="font-semibold text-white group-hover/bento:text-[#00f2ff] transition-colors duration-300">
                        {title}
                    </div>
                )}

                {description && (
                    <div className="text-sm text-[#a0a0a0] line-clamp-2">
                        {description}
                    </div>
                )}

                {children}
            </div>

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[rgba(0,242,255,0.1)] to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300" />
        </motion.div>
    );
};

// Feature Card with Icon
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    className?: string;
    onClick?: () => void;
    status?: 'ready' | 'processing' | 'locked';
}

export const FeatureCard = ({
    icon,
    title,
    description,
    className,
    onClick,
    status = 'ready',
}: FeatureCardProps) => {
    const statusColors = {
        ready: 'border-[rgba(0,242,255,0.3)]',
        processing: 'border-[rgba(189,0,255,0.3)] animate-pulse',
        locked: 'border-[rgba(255,255,255,0.1)] opacity-50',
    };

    return (
        <motion.div
            whileHover={status === 'ready' ? { scale: 1.03 } : {}}
            whileTap={status === 'ready' ? { scale: 0.98 } : {}}
            onClick={status === 'ready' ? onClick : undefined}
            className={cn(
                'relative p-6 rounded-xl border bg-[rgba(255,255,255,0.02)]',
                'backdrop-blur-sm transition-all duration-300',
                statusColors[status],
                status === 'ready' && 'cursor-pointer hover:bg-[rgba(255,255,255,0.05)]',
                className
            )}
        >
            <div className="flex items-start gap-4">
                <div className={cn(
                    'p-3 rounded-lg',
                    status === 'ready' ? 'bg-[rgba(0,242,255,0.1)] text-[#00f2ff]' : 'bg-[rgba(255,255,255,0.05)] text-[#666]'
                )}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className={cn(
                        'font-semibold text-lg mb-1',
                        status === 'ready' ? 'text-white' : 'text-[#666]'
                    )}>
                        {title}
                    </h3>
                    <p className="text-sm text-[#a0a0a0]">
                        {description}
                    </p>
                </div>
            </div>

            {status === 'processing' && (
                <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-[#bd00ff] animate-pulse" />
                </div>
            )}

            {status === 'locked' && (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] rounded-xl">
                    <span className="text-[#666] text-sm">Coming Soon</span>
                </div>
            )}
        </motion.div>
    );
};

// Stats Card
interface StatsCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export const StatsCard = ({
    label,
    value,
    icon,
    trend,
    trendValue,
    className,
}: StatsCardProps) => {
    const trendColors = {
        up: 'text-[#2af598]',
        down: 'text-[#ff0080]',
        neutral: 'text-[#a0a0a0]',
    };

    return (
        <div className={cn(
            'p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]',
            className
        )}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#a0a0a0]">{label}</span>
                {icon && <span className="text-[#00f2ff]">{icon}</span>}
            </div>
            <div className="text-2xl font-bold gradient-text">{value}</div>
            {trend && trendValue && (
                <div className={cn('text-sm mt-1', trendColors[trend])}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                </div>
            )}
        </div>
    );
};
