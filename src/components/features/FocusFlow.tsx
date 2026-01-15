'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Music, CheckSquare, Square, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority?: 'high' | 'medium' | 'low';
}

interface FocusFlowProps {
    className?: string;
    documentId?: string;
}

export const FocusFlow = ({ className, documentId }: FocusFlowProps) => {
    // Pomodoro Timer State
    const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);

    // LoFi Radio State
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(30);
    const audioRef = useRef<HTMLIFrameElement>(null);

    // Task List State
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', text: 'Review key concepts from Chapter 1', completed: false, priority: 'high' },
        { id: '2', text: 'Practice quiz questions', completed: false, priority: 'medium' },
        { id: '3', text: 'Create mind map of relationships', completed: false, priority: 'low' },
    ]);
    const [newTask, setNewTask] = useState('');

    const durations = {
        focus: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
    };

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer finished
            setIsRunning(false);
            if (mode === 'focus') {
                setPomodoroCount((prev) => prev + 1);
                // Auto switch to break
                if ((pomodoroCount + 1) % 4 === 0) {
                    setMode('longBreak');
                    setTimeLeft(durations.longBreak);
                } else {
                    setMode('shortBreak');
                    setTimeLeft(durations.shortBreak);
                }
            } else {
                // Break finished, back to focus
                setMode('focus');
                setTimeLeft(durations.focus);
            }
            // Play notification sound or show alert
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Hyper Mind', {
                    body: mode === 'focus' ? 'Great work! Time for a break.' : 'Break over! Ready to focus?',
                });
            }
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode, pomodoroCount, durations.focus, durations.longBreak, durations.shortBreak]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

    const handleModeChange = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
        setMode(newMode);
        setTimeLeft(durations[newMode]);
        setIsRunning(false);
    };

    const handleReset = () => {
        setTimeLeft(durations[mode]);
        setIsRunning(false);
    };

    // Task Management
    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks((prev) => [
            ...prev,
            { id: Date.now().toString(), text: newTask, completed: false },
        ]);
        setNewTask('');
    };

    const toggleTask = (id: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const completedTasks = tasks.filter((t) => t.completed).length;

    return (
        <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
            {/* Pomodoro Timer */}
            <div className="lg:col-span-2 p-6 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
                <div className="flex items-center gap-2 mb-6">
                    <Timer className="w-5 h-5 text-[#00f2ff]" />
                    <h3 className="font-semibold text-white">Focus Timer</h3>
                </div>

                {/* Mode Selector */}
                <div className="flex gap-2 mb-8">
                    {(['focus', 'shortBreak', 'longBreak'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => handleModeChange(m)}
                            className={cn(
                                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300',
                                mode === m
                                    ? 'bg-gradient-to-r from-[#00f2ff] to-[#bd00ff] text-black'
                                    : 'bg-[rgba(255,255,255,0.05)] text-[#a0a0a0] hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                            )}
                        >
                            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        </button>
                    ))}
                </div>

                {/* Timer Display */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                    {/* Progress Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        <motion.circle
                            cx="128"
                            cy="128"
                            r="120"
                            fill="none"
                            stroke="url(#timer-gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 120}
                            animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                            transition={{ duration: 0.5 }}
                        />
                        <defs>
                            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#00f2ff" />
                                <stop offset="100%" stopColor="#bd00ff" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Time Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold font-mono gradient-text">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-sm text-[#a0a0a0] mt-2">
                            {mode === 'focus' ? 'Stay focused!' : 'Take a break'}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handleReset}
                        className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                        <RotateCcw className="w-5 h-5 text-[#a0a0a0]" />
                    </button>
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={cn(
                            'p-4 rounded-full transition-all duration-300',
                            isRunning
                                ? 'bg-[rgba(255,0,128,0.2)] hover:bg-[rgba(255,0,128,0.3)]'
                                : 'bg-gradient-to-r from-[#00f2ff] to-[#bd00ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.5)]'
                        )}
                    >
                        {isRunning ? (
                            <Pause className="w-6 h-6" />
                        ) : (
                            <Play className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Pomodoro Count */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <span className="text-sm text-[#a0a0a0]">Pomodoros completed:</span>
                    <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'w-3 h-3 rounded-full transition-colors',
                                    i < pomodoroCount % 4
                                        ? 'bg-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.5)]'
                                        : 'bg-[rgba(255,255,255,0.1)]'
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-bold text-[#00f2ff]">×{Math.floor(pomodoroCount / 4)}</span>
                </div>
            </div>

            {/* Right Column: Radio + Tasks */}
            <div className="space-y-6">
                {/* LoFi Radio */}
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center gap-2 mb-4">
                        <Music className="w-5 h-5 text-[#bd00ff]" />
                        <h3 className="font-semibold text-white">LoFi Radio</h3>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-[rgba(0,0,0,0.5)] mb-4">
                        {isPlaying ? (
                            <iframe
                                ref={audioRef}
                                src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1"
                                title="LoFi Radio"
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay"
                                style={{ opacity: 0.3 }}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Music className="w-12 h-12 text-[#666]" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-4xl"
                            >
                                {isPlaying ? '🎧' : '🎵'}
                            </motion.div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={cn(
                            'w-full py-2 rounded-lg font-medium transition-all duration-300',
                            isPlaying
                                ? 'bg-[rgba(189,0,255,0.2)] text-[#bd00ff] border border-[rgba(189,0,255,0.3)]'
                                : 'bg-[rgba(255,255,255,0.05)] text-[#a0a0a0] hover:text-white'
                        )}
                    >
                        {isPlaying ? 'Stop Radio' : 'Start LoFi Beats'}
                    </button>
                </div>

                {/* Task List */}
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-[#2af598]" />
                            <h3 className="font-semibold text-white">Study Tasks</h3>
                        </div>
                        <span className="text-sm text-[#a0a0a0]">
                            {completedTasks}/{tasks.length}
                        </span>
                    </div>

                    {/* Task Input */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            placeholder="Add a task..."
                            className="flex-1 input-cyber text-sm"
                        />
                        <button
                            onClick={addTask}
                            className="p-2 rounded-lg bg-[rgba(0,242,255,0.1)] text-[#00f2ff] hover:bg-[rgba(0,242,255,0.2)] transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Task List */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        <AnimatePresence>
                            {tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] group"
                                >
                                    <button onClick={() => toggleTask(task.id)}>
                                        {task.completed ? (
                                            <CheckSquare className="w-5 h-5 text-[#2af598]" />
                                        ) : (
                                            <Square className="w-5 h-5 text-[#666]" />
                                        )}
                                    </button>
                                    <span
                                        className={cn(
                                            'flex-1 text-sm transition-all duration-300',
                                            task.completed && 'line-through text-[#666]'
                                        )}
                                    >
                                        {task.text}
                                    </span>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="opacity-0 group-hover:opacity-100 text-[#666] hover:text-[#ff0080] transition-all"
                                    >
                                        ×
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
