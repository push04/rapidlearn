'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Unused, replaced by SimpleSelect
import { Calculator, Zap, Cpu, Activity, RotateCcw, Play } from 'lucide-react';
import { motion } from 'framer-motion';

// Quick Select for simple UI components if Shadcn select is missing or complex to scaffold quickly
const SimpleSelect = ({ value, onChange, options }: any) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
    >
        {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
);

declare global {
    interface Window {
        loadPyodide: any;
        pyodide: any;
    }
}

const SCIENTIFIC_PRESETS = [
    {
        name: "Stress/Strain Analysis",
        code: `import numpy as np

# Parameters
force = 5000  # Newtons
area = 0.002  # m^2
length = 2.0  # meters
modulus = 200e9 # Pascals (Steel)

stress = force / area
strain = stress / modulus
elongation = strain * length

print(f"Applied Stress: {stress/1e6:.2f} MPa")
print(f"Resulting Strain: {strain:.6f}")
print(f"Elongation: {elongation*1000:.4f} mm")`
    },
    {
        name: "RC Circuit Time Constant",
        code: `import numpy as np

R = 1000 # Ohms
C = 470e-6 # Farads
V_source = 12 # Volts

tau = R * C
t = np.linspace(0, 5*tau, 10)
v_c = V_source * (1 - np.exp(-t/tau))

print(f"Time Constant (tau): {tau:.4f} s")
print("\\nVoltage charge over time:")
for time, voltage in zip(t, v_c):
    print(f"t={time:.2f}s: {voltage:.2f}V")`
    }
];

export default function EngLab({ documentId }: { documentId: string }) {
    const [output, setOutput] = useState<string[]>([]);
    const [code, setCode] = useState(SCIENTIFIC_PRESETS[0].code);
    const [isPyodideReady, setIsPyodideReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const pyodideRef = useRef<any>(null);

    const initPyodide = async () => {
        if (window.loadPyodide && !pyodideRef.current) {
            try {
                const pyodide = await window.loadPyodide();
                await pyodide.loadPackage("numpy");
                pyodideRef.current = pyodide;
                setIsPyodideReady(true);
                setOutput(prev => [...prev, "System Ready: Python 3.11 + NumPy Loaded."]);
            } catch (err) {
                console.error(err);
                setOutput(prev => [...prev, "System Failure: Could not load scientific kernel."]);
            }
        }
    };

    const runSimulation = async () => {
        if (!pyodideRef.current) return;
        setIsLoading(true);
        setOutput([]); // Clear previous, or keep? Let's clear for calculating.

        try {
            pyodideRef.current.setStdout({
                batched: (msg: string) => {
                    setOutput(prev => [...prev, msg]);
                }
            });
            await pyodideRef.current.runPythonAsync(code);
        } catch (error: any) {
            setOutput(prev => [...prev, `Runtime Error: ${error.message}`]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 h-[700px] flex flex-col gap-6">
            <Script
                src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"
                onLoad={initPyodide}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Cpu className="w-8 h-8 text-orange-500" />
                        Eng-Lab
                    </h2>
                    <p className="text-gray-400 font-mono text-sm mt-1">
                        Advanced Engineering Workbench (NumPy/SciPy Accelerated)
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full border border-gray-800">
                        <Activity className={`w-4 h-4 ${isPyodideReady ? 'text-green-500' : 'text-yellow-500 animate-pulse'}`} />
                        <span className="text-xs font-bold text-gray-400">
                            KERNEL: {isPyodideReady ? 'ONLINE' : 'INITIALIZING...'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {/* Sidebar Controls */}
                <div className="md:col-span-1 bg-[#0f0f13] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Simulation Preset</label>
                        <SimpleSelect
                            options={[
                                { value: '0', label: 'Stress/Strain Analysis' },
                                { value: '1', label: 'RC Circuit Response' }
                            ]}
                            onChange={(val: string) => setCode(SCIENTIFIC_PRESETS[parseInt(val)].code)}
                            value={SCIENTIFIC_PRESETS.findIndex(p => p.code === code).toString()}
                        />
                    </div>

                    <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/5 space-y-4">
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Unit Converter</div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Value (m)" className="h-8 text-xs bg-transparent" />
                            <Input placeholder="Result (ft)" className="h-8 text-xs bg-transparent" readOnly />
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs border-white/10 hover:bg-white/5">
                            <RotateCcw className="w-3 h-3 mr-2" /> Convert
                        </Button>
                    </div>

                    <Button
                        onClick={runSimulation}
                        disabled={!isPyodideReady || isLoading}
                        className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                    >
                        {isLoading ? (
                            <Zap className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Play className="w-5 h-5 mr-2" /> Run Simulation
                            </>
                        )}
                    </Button>
                </div>

                {/* Editor & Console */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    <div className="flex-1 bg-[#050507] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                        <div className="bg-[#1a1a20] px-4 py-2 border-b border-white/10 flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-mono">script.py</span>
                            <Calculator className="w-4 h-4 text-gray-500" />
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 bg-transparent p-4 font-mono text-sm text-gray-300 focus:outline-none resize-none"
                            spellCheck="false"
                        />
                    </div>

                    <div className="h-48 bg-black border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                        <div className="bg-[#1a1a20] px-4 py-2 border-b border-white/10 text-xs text-gray-500 font-bold uppercase tracking-widest">
                            Console Output
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="font-mono text-xs space-y-1">
                                {output.map((line, i) => (
                                    <div key={i} className="text-green-400 border-l-2 border-green-900 pl-2">
                                        {line}
                                    </div>
                                ))}
                                {output.length === 0 && <span className="text-gray-700 italic">Ready for calculations...</span>}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
}
