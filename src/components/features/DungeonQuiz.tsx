'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Swords, Trophy, Star, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
    question: string;
    options: string[];
    correct: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface DungeonQuizProps {
    documentId: string;
    sessionId: string;
    onGameOver?: (stats: GameStats) => void;
    className?: string;
}

interface GameStats {
    totalQuestions: number;
    correctAnswers: number;
    finalXp: number;
    maxStreak: number;
}

export const DungeonQuiz = ({
    documentId,
    sessionId,
    onGameOver,
    className,
}: DungeonQuizProps) => {
    const [hp, setHp] = useState(100);
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [level, setLevel] = useState(1);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [questionCount, setQuestionCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showDamage, setShowDamage] = useState(false);
    const [showXpGain, setShowXpGain] = useState(false);
    const [lastXpGain, setLastXpGain] = useState(0);

    const hpBarRef = useRef<HTMLDivElement>(null);

    // Calculate level from XP
    useEffect(() => {
        const newLevel = Math.floor(xp / 100) + 1;
        if (newLevel !== level) {
            setLevel(newLevel);
        }
    }, [xp, level]);

    // Adaptive difficulty
    useEffect(() => {
        if (streak >= 5) {
            setDifficulty('hard');
        } else if (streak >= 3) {
            setDifficulty('medium');
        } else {
            setDifficulty('easy');
        }
    }, [streak]);

    // Fetch next question
    const fetchQuestion = useCallback(async () => {
        if (hp <= 0) return;

        setIsLoading(true);
        setSelectedAnswer(null);
        setIsAnswered(false);

        try {
            // Trigger question generation
            await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    documentId,
                    difficulty,
                    count: 1,
                }),
            });

            // For demo, generate a sample question
            // In production, poll for Inngest job result
            const sampleQuestions: Question[] = [
                {
                    question: 'What is the primary purpose of this concept?',
                    options: [
                        'A: To simplify complex processes',
                        'B: To increase computational overhead',
                        'C: To reduce memory usage',
                        'D: To enable parallel processing',
                    ],
                    correct: 'A',
                    explanation: 'The concept is designed to simplify complex processes by breaking them into manageable components.',
                    difficulty,
                },
            ];

            setCurrentQuestion(sampleQuestions[0]);
            setQuestionCount((prev) => prev + 1);
        } catch (error) {
            console.error('Failed to fetch question:', error);
        } finally {
            setIsLoading(false);
        }
    }, [documentId, sessionId, difficulty, hp]);

    // Submit answer
    const handleAnswer = async (answer: string) => {
        if (isAnswered || !currentQuestion) return;

        setSelectedAnswer(answer);
        setIsAnswered(true);

        const isCorrect = answer === currentQuestion.correct;

        if (isCorrect) {
            const xpGain = { easy: 10, medium: 25, hard: 50 }[currentQuestion.difficulty];
            const streakBonus = streak >= 3 ? Math.floor(streak / 3) * 5 : 0;
            const totalXp = xpGain + streakBonus;

            setXp((prev) => prev + totalXp);
            setStreak((prev) => prev + 1);
            setMaxStreak((prev) => Math.max(prev, streak + 1));
            setCorrectCount((prev) => prev + 1);
            setLastXpGain(totalXp);
            setShowXpGain(true);
            setTimeout(() => setShowXpGain(false), 1000);
        } else {
            const damage = { easy: 10, medium: 15, hard: 25 }[currentQuestion.difficulty];
            setHp((prev) => Math.max(0, prev - damage));
            setStreak(0);
            setShowDamage(true);
            setTimeout(() => setShowDamage(false), 500);

            if (hp - damage <= 0) {
                setGameOver(true);
                onGameOver?.({
                    totalQuestions: questionCount,
                    correctAnswers: correctCount,
                    finalXp: xp,
                    maxStreak,
                });
            }
        }

        // Update server
        try {
            await fetch('/api/quiz', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    questionId: `q-${questionCount}`,
                    userAnswer: answer,
                    correctAnswer: currentQuestion.correct,
                    isCorrect,
                    difficulty: currentQuestion.difficulty,
                }),
            });
        } catch (error) {
            console.error('Failed to submit answer:', error);
        }
    };

    // Restart game
    const handleRestart = () => {
        setHp(100);
        setXp(0);
        setStreak(0);
        setLevel(1);
        setGameOver(false);
        setQuestionCount(0);
        setCorrectCount(0);
        setDifficulty('easy');
        fetchQuestion();
    };

    // Start game
    useEffect(() => {
        fetchQuestion();
    }, []);

    return (
        <div className={cn('flex flex-col gap-6', className)}>
            {/* Game Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
                {/* HP Bar */}
                <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className={cn('w-5 h-5', hp > 30 ? 'text-red-500' : 'text-red-500 animate-pulse')} />
                        <span className="text-sm font-semibold">HP</span>
                        <span className="text-sm text-[#a0a0a0]">{hp}/100</span>
                    </div>
                    <div
                        ref={hpBarRef}
                        className={cn('hp-bar relative overflow-hidden', showDamage && 'animate-shake')}
                    >
                        <motion.div
                            className="hp-bar-fill"
                            animate={{ width: `${hp}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* XP Bar */}
                <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-5 h-5 text-[#00f2ff]" />
                        <span className="text-sm font-semibold">XP</span>
                        <span className="text-sm text-[#a0a0a0]">{xp} (Level {level})</span>
                        <AnimatePresence>
                            {showXpGain && (
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-[#00f2ff] font-bold"
                                >
                                    +{lastXpGain}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="xp-bar">
                        <motion.div
                            className="xp-bar-fill"
                            animate={{ width: `${(xp % 100)}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)]">
                    <Star className="w-5 h-5 text-[#ffd700]" />
                    <span className="font-bold text-[#ffd700]">{streak}</span>
                    <span className="text-sm text-[#a0a0a0]">Streak</span>
                </div>

                {/* Difficulty */}
                <div className={cn(
                    'px-3 py-1 rounded-full text-sm font-semibold',
                    difficulty === 'easy' && 'bg-[rgba(42,245,152,0.2)] text-[#2af598]',
                    difficulty === 'medium' && 'bg-[rgba(255,215,0,0.2)] text-[#ffd700]',
                    difficulty === 'hard' && 'bg-[rgba(255,0,128,0.2)] text-[#ff0080]'
                )}>
                    {difficulty.toUpperCase()}
                </div>
            </div>

            {/* Game Over Screen */}
            <AnimatePresence>
                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.9)] backdrop-blur-sm"
                    >
                        <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,0,128,0.3)] text-center max-w-md">
                            <Swords className="w-16 h-16 mx-auto mb-4 text-[#ff0080]" />
                            <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
                            <p className="text-[#a0a0a0] mb-6">You fought bravely, but the dungeon claimed you.</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                                    <div className="text-2xl font-bold gradient-text">{correctCount}/{questionCount}</div>
                                    <div className="text-xs text-[#a0a0a0]">Correct</div>
                                </div>
                                <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                                    <div className="text-2xl font-bold gradient-text">{xp}</div>
                                    <div className="text-xs text-[#a0a0a0]">Total XP</div>
                                </div>
                                <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                                    <div className="text-2xl font-bold text-[#ffd700]">{maxStreak}</div>
                                    <div className="text-xs text-[#a0a0a0]">Max Streak</div>
                                </div>
                                <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                                    <div className="text-2xl font-bold text-[#bd00ff]">Lv.{level}</div>
                                    <div className="text-xs text-[#a0a0a0]">Final Level</div>
                                </div>
                            </div>

                            <button
                                onClick={handleRestart}
                                className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-[#00f2ff] to-[#bd00ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all duration-300"
                            >
                                <RotateCcw className="w-5 h-5 inline mr-2" />
                                Try Again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Question Card */}
            {!gameOver && (
                <motion.div
                    key={questionCount}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]"
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <Swords className="w-12 h-12 text-[#00f2ff] animate-pulse" />
                            <p className="text-[#a0a0a0]">Summoning next challenge...</p>
                        </div>
                    ) : currentQuestion ? (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-[#a0a0a0]">Question #{questionCount}</span>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-6">
                                {currentQuestion.question}
                            </h3>

                            <div className="grid gap-3">
                                {currentQuestion.options.map((option, index) => {
                                    const optionLetter = option.charAt(0);
                                    const isSelected = selectedAnswer === optionLetter;
                                    const isCorrect = optionLetter === currentQuestion.correct;

                                    return (
                                        <motion.button
                                            key={index}
                                            onClick={() => handleAnswer(optionLetter)}
                                            disabled={isAnswered}
                                            whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                            whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                            className={cn(
                                                'quiz-option text-left',
                                                isAnswered && isCorrect && 'correct',
                                                isAnswered && isSelected && !isCorrect && 'incorrect'
                                            )}
                                        >
                                            {option}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            <AnimatePresence>
                                {isAnswered && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 p-4 rounded-lg bg-[rgba(0,242,255,0.05)] border border-[rgba(0,242,255,0.2)]"
                                    >
                                        <p className="text-sm text-[#a0a0a0]">
                                            <span className="font-semibold text-[#00f2ff]">Explanation: </span>
                                            {currentQuestion.explanation}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Next Button */}
                            {isAnswered && hp > 0 && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={fetchQuestion}
                                    className="mt-4 w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-[#00f2ff] to-[#bd00ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all duration-300"
                                >
                                    Next Challenge
                                    <ArrowRight className="w-5 h-5 inline ml-2" />
                                </motion.button>
                            )}
                        </>
                    ) : null}
                </motion.div>
            )}
        </div>
    );
};
