'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Baby, Sparkles, Swords, RotateCcw } from 'lucide-react';
import { TracingMessage } from '@/components/aceternity/tracing-beam';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    documentContext?: string;
    className?: string;
}

export const ChatInterface = ({ documentContext, className }: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feynmanMode, setFeynmanMode] = useState(false);
    const [debateMode, setDebateMode] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStreamingContent('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    mode: debateMode ? 'debate' : feynmanMode ? 'feynman' : 'default',
                    documentContext: documentContext?.substring(0, 10000),
                }),
            });

            if (!response.ok) throw new Error('Chat request failed');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.text) {
                                    fullContent += parsed.text;
                                    setStreamingContent(fullContent);
                                }
                            } catch {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent('');
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    }, [input, isLoading, messages, documentContext, feynmanMode, debateMode]);

    const handleClear = () => {
        setMessages([]);
        setStreamingContent('');
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Mode Toggles */}
            <div className="flex items-center gap-2 p-4 border-b border-[rgba(255,255,255,0.1)]">
                <button
                    onClick={() => {
                        setFeynmanMode(!feynmanMode);
                        setDebateMode(false);
                    }}
                    className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
                        feynmanMode
                            ? 'bg-[rgba(42,245,152,0.2)] text-[#2af598] border border-[rgba(42,245,152,0.3)]'
                            : 'bg-[rgba(255,255,255,0.05)] text-[#a0a0a0] hover:text-white'
                    )}
                >
                    <Baby className="w-4 h-4" />
                    Feynman Mode
                </button>

                <button
                    onClick={() => {
                        setDebateMode(!debateMode);
                        setFeynmanMode(false);
                    }}
                    className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
                        debateMode
                            ? 'bg-[rgba(255,0,128,0.2)] text-[#ff0080] border border-[rgba(255,0,128,0.3)]'
                            : 'bg-[rgba(255,255,255,0.05)] text-[#a0a0a0] hover:text-white'
                    )}
                >
                    <Swords className="w-4 h-4" />
                    Debate Mode
                </button>

                <div className="flex-1" />

                <button
                    onClick={handleClear}
                    className="p-2 rounded-lg text-[#666] hover:text-[#a0a0a0] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Mode Indicators */}
            <AnimatePresence>
                {feynmanMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-2 bg-[rgba(42,245,152,0.1)] border-b border-[rgba(42,245,152,0.2)]"
                    >
                        <p className="text-sm text-[#2af598] flex items-center gap-2">
                            <Baby className="w-4 h-4" />
                            Feynman Mode Active: Explain Like I&apos;m 5 🎈
                        </p>
                    </motion.div>
                )}
                {debateMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-2 bg-[rgba(255,0,128,0.1)] border-b border-[rgba(255,0,128,0.2)]"
                    >
                        <p className="text-sm text-[#ff0080] flex items-center gap-2">
                            <Swords className="w-4 h-4" />
                            Debate Mode: I am Socrates. Defend your understanding! ⚔️
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !streamingContent && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="w-12 h-12 text-[#00f2ff] mb-4 animate-pulse" />
                        <h3 className="text-xl font-semibold gradient-text mb-2">RapidLearn Chat</h3>
                        <p className="text-[#a0a0a0] max-w-sm">
                            Ask me anything about your document. I can explain concepts, quiz you, or
                            debate your understanding.
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <TracingMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                    />
                ))}

                {/* Streaming Message */}
                {streamingContent && (
                    <TracingMessage
                        role="assistant"
                        content={streamingContent}
                        isStreaming
                    />
                )}

                {/* Loading Indicator */}
                {isLoading && !streamingContent && (
                    <div className="flex items-center gap-3 pl-8">
                        <Loader2 className="w-5 h-5 text-[#00f2ff] animate-spin" />
                        <span className="text-[#a0a0a0]">Thinking...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                        placeholder={
                            debateMode
                                ? 'Make your argument...'
                                : feynmanMode
                                    ? 'Ask me to explain something simply...'
                                    : 'Ask anything about your document...'
                        }
                        className="flex-1 input-cyber"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !input.trim()}
                        className={cn(
                            'p-3 rounded-lg transition-all duration-300',
                            'bg-gradient-to-r from-[#00f2ff] to-[#bd00ff]',
                            'hover:shadow-[0_0_20px_rgba(0,242,255,0.5)]',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
