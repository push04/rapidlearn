'use client';

import { motion } from 'framer-motion';
import { SparklesCore, TextRevealCard, MovingBorderButton } from '@/components/aceternity';
import { ArrowRight, Brain, Zap, Github } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden bg-[#050505]">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full">
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
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-8 text-center pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(0,242,255,0.1)] border border-[rgba(0,242,255,0.2)] mb-6">
            <Zap className="w-4 h-4 text-[#00f2ff]" />
            <span className="text-sm font-medium text-[#00f2ff]">The Knowledge Singularity v2.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-wb from-white via-[#a0a0a0] to-[rgba(255,255,255,0.1)] tracking-tight mb-4">
            HYPER MIND
          </h1>

          <TextRevealCard
            text="Deconstruct Knowledge. Master Anything."
            revealText="Your Neural Extension."
            className="text-2xl md:text-3xl text-[#a0a0a0] mb-8 font-light"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <Link href="/dashboard">
            <MovingBorderButton
              borderRadius="1rem"
              className="bg-[#050505] text-white border-0 text-lg"
            >
              Enter Dashboard
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </MovingBorderButton>
          </Link>

          <button className="px-8 py-4 rounded-xl text-[#a0a0a0] hover:text-white transition-colors flex items-center gap-2">
            <Github className="w-5 h-5" />
            View Source
          </button>
        </motion.div>

        {/* Feature Grid Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4"
        >
          {[
            {
              title: "Golden Ticket",
              desc: "AI hunts down the single best video for any topic.",
              icon: "🏆"
            },
            {
              title: "Hyper-Lecturer",
              desc: "Turns boring PDFs into viral 60s video explanations.",
              icon: "🎥"
            },
            {
              title: "Dungeon Master",
              desc: "Gamified exams where wrong answers deal actual damage.",
              icon: "🎮"
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,242,255,0.2)] transition-all duration-300 hover:transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-[#a0a0a0] text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="relative z-20 pb-8 text-center text-[#333] text-sm">
        Powered by Next.js 15, Inngest & OpenRouter
      </div>
    </div>
  );
}
