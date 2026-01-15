'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider'; // Assuming installed or use native
import { Check, Brain, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExamSimulator({ documentId }: { documentId: string }) {
    const [isSimulating, setIsSimulating] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    const runSimulation = () => {
        setIsSimulating(true);
        // Mock simulation
        setTimeout(() => {
            setPrediction({
                probableTopics: [
                    { topic: "Navier-Stokes Equations", probability: 92 },
                    { topic: "Bernoulli's Principle", probability: 85 },
                    { topic: "Reynolds Number", probability: 64 },
                    { topic: "Boundary Layer Theory", probability: 45 },
                ],
                confidenceScore: 89,
                predictedQuestions: [
                    "Derive the continuity equation for incompressible flow.",
                    "Explain the physical significance of each term in the Navier-Stokes equation."
                ]
            });
            setIsSimulating(false);
        }, 2500);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8 space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Predictive Exam Simulator
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Our Monte Carlo engine runs 10,000 simulations against your course material to predict the most likely exam questions.
                </p>
            </div>

            {!prediction ? (
                <div className="flex flex-col items-center justify-center space-y-8 py-12">
                    <div className={`w-64 h-64 rounded-full border-4 border-white/5 flex items-center justify-center relative ${isSimulating ? 'animate-pulse' : ''}`}>
                        <div className="absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin opacity-50" />
                        <Brain className="w-24 h-24 text-gray-600" />
                    </div>

                    <Button
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="h-16 px-12 text-lg font-bold bg-white text-black hover:bg-gray-200 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
                    >
                        {isSimulating ? "RUNNING SIMULATIONS..." : "PREDICT EXAM (3 CREDITS)"}
                    </Button>
                    <p className="text-xs text-gray-500 font-mono">POWERED BY HYPER-MIND PREDICTIVE ENGINE v2.0</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Probability Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#111] rounded-3xl p-8 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-500" />
                                Topic Probability
                            </h3>
                            <span className="text-green-400 font-mono text-xs border border-green-500/30 px-2 py-1 rounded">
                                CONFIDENCE: {prediction.confidenceScore}%
                            </span>
                        </div>

                        <div className="space-y-4">
                            {prediction.probableTopics.map((item: any, i: number) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300">{item.topic}</span>
                                        <span className="text-gray-500">{item.probability}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.probability}%` }}
                                            transition={{ delay: i * 0.1, duration: 1 }}
                                            className={`h-full rounded-full ${i === 0 ? 'bg-purple-500' : 'bg-gray-600'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Questions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 rounded-3xl p-8 border border-white/10"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            Predicted Questions
                        </h3>
                        <div className="space-y-4">
                            {prediction.predictedQuestions.map((q: string, i: number) => (
                                <div key={i} className="flex gap-4 p-4 bg-black/40 rounded-xl border border-white/5">
                                    <div className="text-xl font-black text-gray-700">Q{i + 1}</div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{q}</p>
                                </div>
                            ))}
                        </div>

                        <Button onClick={() => setPrediction(null)} variant="ghost" className="w-full mt-4 text-gray-500 hover:text-white">
                            Reset Simulation
                        </Button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
