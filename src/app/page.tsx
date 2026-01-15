'use client';

import { motion } from 'framer-motion';
import { SparklesCore, TextRevealCard, MovingBorderButton } from '@/components/aceternity';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import {
  ArrowRight, Zap, Github,
  Swords, Users, Video, Network, Cpu, Gamepad2, Ticket, Scale, Stethoscope, Search, Server, Mic, Timer
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const features = [
    {
      title: "Debate Arena",
      description: "Challenge AI personas to high-stakes intellectual duels.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />,
      icon: <Swords className="h-4 w-4 text-cyan-500" />,
    },
    {
      title: "Ghost Students",
      description: "Test your teaching skills against AI students with distinct personalities.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-900 to-purple-800" />,
      icon: <Users className="h-4 w-4 text-purple-500" />,
    },
    {
      title: "Hyper-Lecturer",
      description: "Transform PDFs into viral educational videos in seconds.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-900 to-blue-800" />,
      icon: <Video className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Neuronal Mind Map",
      description: "Navigate knowledge in a 3D interactive neural galaxy.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-900 to-green-800" />,
      icon: <Network className="h-4 w-4 text-green-500" />,
    },
    {
      title: "Eng-Lab",
      description: "Run complex engineering simulations and Python code instantly.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-900 to-orange-800" />,
      icon: <Cpu className="h-4 w-4 text-orange-500" />,
    },
    {
      title: "Dungeon Master",
      description: "Gamified exams where wrong answers deal actual HP damage.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-red-900 to-red-800" />,
      icon: <Gamepad2 className="h-4 w-4 text-red-500" />,
    },
    {
      title: "Golden Ticket",
      description: "AI hunts down the single best timestamped video explanation.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-yellow-900 to-yellow-800" />,
      icon: <Ticket className="h-4 w-4 text-yellow-500" />,
    },
    {
      title: "Lex-Mind",
      description: "AI legal analyst trained on constitutional law and case studies.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-slate-900 to-slate-800" />,
      icon: <Scale className="h-4 w-4 text-slate-400" />,
    },
    {
      title: "Medi-Sim",
      description: "Diagnose virtual patients in a high-pressure ER simulator.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-teal-900 to-teal-800" />,
      icon: <Stethoscope className="h-4 w-4 text-teal-500" />,
    },
    {
      title: "Source Detective",
      description: "Verify claims and find original sources with AI investigations.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-800" />,
      icon: <Search className="h-4 w-4 text-indigo-500" />,
    },
    {
      title: "System Nexus",
      description: "Architect complex distributed systems with AI guidance.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-pink-900 to-pink-800" />,
      icon: <Server className="h-4 w-4 text-pink-500" />,
    },
    {
      title: "Deep Dive Podcast",
      description: "Convert any topic into an engaging two-host audio podcast.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-800" />,
      icon: <Mic className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: "Focus Flow",
      description: "AI-enhanced productivity timer and flow state inducer.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-rose-900 to-rose-800" />,
      icon: <Timer className="h-4 w-4 text-rose-500" />,
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden bg-[#050505] selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#00f2ff"
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-8 text-center pt-20 md:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8 backdrop-blur-md">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">The Knowledge Singularity v2.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/10 tracking-tighter mb-6">
            RapidLearn
          </h1>

          <TextRevealCard
            text="Deconstruct Knowledge. Master Anything."
            revealText="Your Ultimate Neural Extension."
            className="text-2xl md:text-3xl text-gray-400 mb-12 font-light"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24"
        >
          <Link href="/dashboard">
            <MovingBorderButton
              borderRadius="1rem"
              className="bg-black text-white border-neutral-200 dark:border-slate-800 text-lg font-semibold"
            >
              Enter Dashboard
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </MovingBorderButton>
          </Link>

          <button className="px-8 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2 border border-transparent hover:border-white/10">
            <Github className="w-5 h-5" />
            View Source
          </button>
        </motion.div>

        {/* Premium Bento Grid */}
        <BentoGrid className="max-w-6xl mx-auto px-4 md:px-0">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </div>

      <div className="relative z-20 pb-8 text-center text-gray-600 text-sm">
        Powered by Next.js 15, Inngest & OpenRouter
      </div>
    </div>
  );
}
