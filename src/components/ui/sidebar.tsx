'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Layout, Search, Zap, Clock, User, LogOut } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
    className?: string;
    isCollapsed?: boolean;
}

export const Sidebar = ({ className, isCollapsed = false }: SidebarProps) => {
    const [activePath, setActivePath] = useState('');

    useEffect(() => {
        setActivePath(window.location.pathname);
    }, []);

    const navItems = [
        { label: 'Dashboard', icon: <Layout className="w-5 h-5" />, href: '/dashboard' },
        { label: 'Study Hub', icon: <Brain className="w-5 h-5" />, href: '/study' },
        { label: 'Golden Ticket', icon: <Search className="w-5 h-5" />, href: '/features/golden-ticket' },
        { label: 'War Room', icon: <Zap className="w-5 h-5" />, href: '/warroom' },
        { label: 'Focus Flow', icon: <Clock className="w-5 h-5" />, href: '/focus' },
    ];

    return (
        <div className={cn(
            'flex flex-col h-full bg-[#050505] border-r border-[rgba(255,255,255,0.1)]',
            isCollapsed ? 'w-20' : 'w-64',
            className
        )}>
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f2ff] to-[#bd00ff] flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                </div>
                {!isCollapsed && (
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-[#a0a0a0]">
                        RAPIDLEARN
                    </span>
                )}
            </div>

            {/* Nav Items */}
            <div className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = activePath === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                                isActive
                                    ? 'bg-[rgba(0,242,255,0.1)] border border-[rgba(0,242,255,0.2)] text-[#00f2ff]'
                                    : 'text-[#a0a0a0] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                            )}
                        >
                            <div className={cn(
                                'transition-transform group-hover:scale-110',
                                isActive && 'text-[#00f2ff]'
                            )}>
                                {item.icon}
                            </div>
                            {!isCollapsed && (
                                <span className="font-medium">{item.label}</span>
                            )}

                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-8 rounded-r-full bg-[#00f2ff]"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* User Session */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
                <div className={cn(
                    'flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]',
                    'hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer'
                )}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00f2ff] to-[#bd00ff] flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-semibold text-white truncate">Student</div>
                            <div className="text-xs text-[#a0a0a0] truncate">Free Plan</div>
                        </div>
                    )}
                    {!isCollapsed && (
                        <LogOut className="w-4 h-4 text-[#666] hover:text-[#ff0080]" />
                    )}
                </div>
            </div>
        </div>
    );
};
