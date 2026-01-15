'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Terminal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

declare global {
    interface Window {
        loadPyodide: any;
        pyodide: any;
    }
}

const DEFAULT_CODE = `# Write Python code here
import math

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print("Fibonacci sequence for 10:")
print([fibonacci(i) for i in range(10)])

# Calculate hypotenuse
a = 3
b = 4
c = math.sqrt(a**2 + b**2)
print(f"Hypotenuse of {a} and {b} is {c}")
`;

export default function LiveCodeSandbox() {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isPyodideReady, setIsPyodideReady] = useState(false);
    const pyodideRef = useRef<any>(null);

    const initPyodide = async () => {
        if (window.loadPyodide && !pyodideRef.current) {
            try {
                const pyodide = await window.loadPyodide();
                await pyodide.loadPackage("micropip");
                pyodideRef.current = pyodide;
                setIsPyodideReady(true);
                setOutput(["Python 3.11 environment ready."]);
            } catch (err) {
                console.error(err);
                setOutput(["Failed to initialize Python environment."]);
            }
        }
    };

    const runCode = async () => {
        if (!pyodideRef.current) return;
        setIsRunning(true);
        setOutput([]); // Clear previous output

        try {
            // Redirect stdout to capture print statements
            pyodideRef.current.setStdout({
                batched: (msg: string) => {
                    setOutput(prev => [...prev, msg]);
                }
            });

            await pyodideRef.current.runPythonAsync(code);
        } catch (error: any) {
            setOutput(prev => [...prev, `Error: ${error.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto border border-white/10 rounded-2xl overflow-hidden bg-[#0d1117] shadow-2xl flex flex-col h-[600px]">
            <Script
                src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"
                onLoad={initPyodide}
            />

            {/* Header */}
            <div className="bg-[#161b22] px-4 py-3 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-sm font-mono text-gray-400 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Hyper-SandBox.py
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center mr-4">
                        <div className={cn("w-2 h-2 rounded-full mr-2", isPyodideReady ? "bg-green-500" : "bg-yellow-500 animate-pulse")} />
                        <span className="text-xs text-gray-500">{isPyodideReady ? 'Ready' : 'Loading WASM...'}</span>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setCode(DEFAULT_CODE); setOutput([]); }}
                        className="text-gray-400 hover:text-white"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={runCode}
                        disabled={!isPyodideReady || isRunning}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                        Run
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Code Editor (Simple Textarea for Demo) */}
                <div className="flex-1 border-r border-white/5 relative">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full bg-[#0d1117] text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none scrollbar-thin scrollbar-thumb-white/10"
                        spellCheck="false"
                    />
                </div>

                {/* Output Console */}
                <div className="w-1/3 bg-[#010409] p-4 font-mono text-xs overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                    <h4 className="text-gray-500 mb-2 uppercase tracking-wider text-[10px] font-bold">Terminal Output</h4>
                    <div className="space-y-1">
                        {output.map((line, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-gray-300 break-words"
                            >
                                <span className="text-green-500 mr-2">➜</span>{line}
                            </motion.div>
                        ))}
                        {output.length === 0 && !isRunning && (
                            <div className="text-gray-600 italic">No output yet. Run the code to see results.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
