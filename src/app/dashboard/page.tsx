'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import {
    BentoGrid,
    BentoGridItem,
    StatsCard,
    FeatureCard
} from '@/components/aceternity';
import {
    Youtube,
    FileText,
    Mic,
    Brain,
    Swords,
    Clock,
    Search,
    Users,
    Zap,
    Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-[#050505]">
            {/* Sidebar */}
            <Sidebar
                className="hidden md:flex border-r border-[rgba(255,255,255,0.1)]"
                isCollapsed={isSidebarCollapsed}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Command Center</h1>
                            <p className="text-[#a0a0a0]">Welcome back, Cadet. Systems online.</p>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(0,242,255,0.1)] border border-[rgba(0,242,255,0.2)] text-[#00f2ff] hover:bg-[rgba(0,242,255,0.2)] transition-all">
                            <Upload className="w-4 h-4" />
                            Upload Document
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            label="Study Streak"
                            value="12 Days"
                            icon={<Zap className="w-5 h-5" />}
                            trend="up"
                            trendValue="Level 5"
                        />
                        <StatsCard
                            label="Focus Time"
                            value="42h 15m"
                            icon={<Clock className="w-5 h-5" />}
                            trend="up"
                            trendValue="+12% this week"
                        />
                        <StatsCard
                            label="Knowledge Nodes"
                            value="1,248"
                            icon={<Brain className="w-5 h-5" />}
                            trend="neutral"
                            trendValue="Growing"
                        />
                        <StatsCard
                            label="XP Gained"
                            value="8,950"
                            icon={<TrophyIcon className="w-5 h-5" />}
                            trend="up"
                            trendValue="Top 5%"
                        />
                    </div>

                    {/* Feature Grid */}
                    <h2 className="text-xl font-semibold text-white pt-6">Hyper Modules</h2>
                    <BentoGrid>
                        {/* Feature 1: Golden Ticket */}
                        <BentoGridItem
                            className="col-span-1 md:col-span-2"
                            title="The Golden Ticket"
                            description="Find the single best YouTube video for any topic. AI watches them all so you don't have to."
                            header={<div className="h-40 w-full rounded-lg bg-gradient-to-br from-[#ff0000] to-[#990000] flex items-center justify-center mb-4"><Youtube className="w-16 h-16 text-white" /></div>}
                            icon={<Search className="w-4 h-4" />}
                        />

                        {/* Feature 2: Hyper-Lecturer */}
                        <BentoGridItem
                            className="col-span-1"
                            title="Hyper-Lecturer"
                            description="Convert PDFs into viral-style 60s videos."
                            header={<div className="h-40 w-full rounded-lg bg-gradient-to-br from-[#00f2ff] to-[#0099ff] flex items-center justify-center mb-4"><FileText className="w-16 h-16 text-white" /></div>}
                            icon={<Zap className="w-4 h-4" />}
                        />

                        {/* Feature 5: Dungeon Master */}
                        <BentoGridItem
                            className="col-span-1"
                            title="Dungeon Master"
                            description="Gamified exams where wrong answers deal damage."
                            header={<div className="h-40 w-full rounded-lg bg-gradient-to-br from-[#ff0080] to-[#99004d] flex items-center justify-center mb-4"><Swords className="w-16 h-16 text-white" /></div>}
                            icon={<Swords className="w-4 h-4" />}
                        />

                        {/* Feature 3: Deep Dive Podcast */}
                        <BentoGridItem
                            className="col-span-1 md:col-span-2"
                            title="Deep Dive Podcast"
                            description="Generate a 2-person conversational podcast about your documents."
                            header={<div className="h-40 w-full rounded-lg bg-gradient-to-br from-[#bd00ff] to-[#660099] flex items-center justify-center mb-4"><Mic className="w-16 h-16 text-white" /></div>}
                            icon={<Mic className="w-4 h-4" />}
                        />
                    </BentoGrid>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
                        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-[#2af598]" />
                                Recent Knowledge Uploads
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[rgba(0,242,255,0.1)] flex items-center justify-center text-[#00f2ff]">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">Advanced Quantum Mechanics.pdf</div>
                                                <div className="text-xs text-[#a0a0a0]">Processed • 128 MB</div>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-[rgba(42,245,152,0.1)] text-[#2af598]">Ready</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-[#ff0080]" />
                                War Room Status
                            </h3>
                            <div className="flex items-center justify-center h-48 rounded-xl bg-[rgba(0,0,0,0.3)] border border-dashed border-[rgba(255,255,255,0.1)] text-[#666]">
                                No active multiplayer sessions
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function TrophyIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
