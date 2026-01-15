'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, XCircle, Search, ScanLine, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HandwritingGrader({ documentId }: { documentId: string }) {
    const [image, setImage] = useState<string | null>(null);
    const [isGrading, setIsGrading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock upload - just read as data URL for preview
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const gradeSubmission = async () => {
        setIsGrading(true);
        // Mock API call to Inngest function `handwriting/grade`
        setTimeout(() => {
            setResult({
                score: 75,
                transcription: "x^2 + 5x + 6 = 0\n(x + 2)(x + 3) = 0\nx = 2, x = 3",
                feedback: "You correctly factored the quadratic equation, but you made a sign error in the final step. If (x+2)=0, then x should be -2, not 2.",
                redInkOverlay: [
                    { x: 10, y: 80, comment: "Sign Error: Should be x = -2" },
                    { x: 50, y: 80, comment: "Sign Error: Should be x = -3" }
                ]
            });
            setIsGrading(false);
        }, 3000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Upload/Preview Section */}
            <div className="space-y-4">
                <div className="h-[500px] border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-black/40 relative overflow-hidden group">
                    {image ? (
                        <>
                            <img src={image} alt="Homework" className="w-full h-full object-contain opacity-80" />
                            {/* Simulated Red Ink Overlay */}
                            {result && result.redInkOverlay.map((overlay: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.5 }}
                                    className="absolute bg-red-600/20 border-2 border-red-500 rounded-lg p-2 text-xs font-bold text-red-500 shadow-lg backdrop-blur-sm"
                                    style={{ left: `${overlay.x}%`, top: `${overlay.y}%` }}
                                >
                                    <XCircle className="w-4 h-4 inline-block mr-1 mb-0.5" />
                                    {overlay.comment}
                                </motion.div>
                            ))}
                            {isGrading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="absolute top-0 w-full h-1 bg-cyan-500 animate-[scan_2s_ease-in-out_infinite]" />
                                    <div className="text-cyan-500 font-mono text-sm animate-pulse flex items-center gap-2">
                                        <ScanLine className="w-5 h-5" />
                                        SCANNING HANDWRITING...
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-400 mb-4">Upload a photo of your handwritten homework</p>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="max-w-xs mx-auto text-white"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Grading Panel */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Handwriting Grader</h2>
                    <p className="text-gray-400 text-sm">AI OCR + Logic Verification</p>
                </div>

                {!result ? (
                    <Button
                        onClick={gradeSubmission}
                        disabled={!image || isGrading}
                        className="w-full h-12 bg-white text-black hover:bg-gray-200 font-bold"
                    >
                        {isGrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Grade My Work"}
                    </Button>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className={`text-4xl font-black ${result.score > 70 ? 'text-green-500' : 'text-red-500'}`}>
                                {result.score}/100
                            </div>
                            <div>
                                <div className="font-bold text-white">Final Score</div>
                                <div className="text-gray-400 text-xs">Based on accuracy & logic</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-300 uppercase">AI Feedback</h4>
                            <p className="text-gray-300 leading-relaxed bg-black/40 p-4 rounded-xl border-l-4 border-red-500">
                                {result.feedback}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-300 uppercase">Transcription</h4>
                            <div className="font-mono text-xs bg-black p-4 rounded-xl text-gray-400 whitespace-pre-wrap">
                                {result.transcription}
                            </div>
                        </div>

                        <Button onClick={() => { setImage(null); setResult(null); }} variant="outline" className="w-full">
                            Upload Another
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
