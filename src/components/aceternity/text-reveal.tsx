'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextRevealProps {
    text: string;
    className?: string;
    once?: boolean;
    revealText?: string;
}

export const TextRevealCard = ({
    text,
    className,
    once = true,
    revealText,
}: TextRevealProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);

    const words = text.split(' ');

    return (
        <div ref={ref} className={cn('relative overflow-hidden', className)}>
            <motion.div
                initial="hidden"
                animate={controls}
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.05,
                        },
                    },
                }}
                className="flex flex-wrap gap-x-2"
            >
                {words.map((word, i) => (
                    <motion.span
                        key={i}
                        variants={{
                            hidden: {
                                opacity: 0,
                                y: 20,
                                filter: 'blur(10px)',
                            },
                            visible: {
                                opacity: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                transition: {
                                    duration: 0.5,
                                    ease: [0.25, 0.4, 0.25, 1],
                                },
                            },
                        }}
                        className="inline-block"
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.div>
            {revealText && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: words.length * 0.05 + 0.5, duration: 0.5 }}
                    className="mt-4 text-[#a0a0a0]"
                >
                    {revealText}
                </motion.div>
            )}
        </div>
    );
};

// Typewriter effect
interface TypewriterProps {
    words: string[];
    className?: string;
    cursorClassName?: string;
    typingSpeed?: number;
    deletingSpeed?: number;
    delayBetweenWords?: number;
}

export const TypewriterEffect = ({
    words,
    className,
    cursorClassName,
    typingSpeed = 100,
    deletingSpeed = 50,
    delayBetweenWords = 2000,
}: TypewriterProps) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const word = words[currentWordIndex];

        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    if (currentText.length < word.length) {
                        setCurrentText(word.slice(0, currentText.length + 1));
                    } else {
                        setTimeout(() => setIsDeleting(true), delayBetweenWords);
                    }
                } else {
                    if (currentText.length > 0) {
                        setCurrentText(word.slice(0, currentText.length - 1));
                    } else {
                        setIsDeleting(false);
                        setCurrentWordIndex((prev) => (prev + 1) % words.length);
                    }
                }
            },
            isDeleting ? deletingSpeed : typingSpeed
        );

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords]);

    return (
        <span className={className}>
            {currentText}
            <span className={cn('animate-pulse', cursorClassName)}>|</span>
        </span>
    );
};

// Gradient text reveal on scroll
interface GradientTextRevealProps {
    children: string;
    className?: string;
}

export const GradientTextReveal = ({ children, className }: GradientTextRevealProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleScroll = () => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate progress based on element position in viewport
            const progress = Math.max(0, Math.min(1,
                (windowHeight - rect.top) / (windowHeight + rect.height)
            ));

            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div ref={ref} className={cn('relative', className)}>
            <span className="text-[#333]">{children}</span>
            <span
                className="absolute inset-0 gradient-text overflow-hidden whitespace-nowrap"
                style={{
                    clipPath: `inset(0 ${(1 - scrollProgress) * 100}% 0 0)`,
                }}
            >
                {children}
            </span>
        </div>
    );
};

// Letter-by-letter animation
interface AnimatedLettersProps {
    text: string;
    className?: string;
    letterClassName?: string;
    delay?: number;
}

export const AnimatedLetters = ({
    text,
    className,
    letterClassName,
    delay = 0,
}: AnimatedLettersProps) => {
    const letters = text.split('');

    return (
        <motion.div className={cn('flex', className)}>
            {letters.map((letter, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: delay + i * 0.05,
                        duration: 0.5,
                        ease: [0.25, 0.4, 0.25, 1],
                    }}
                    className={cn(letter === ' ' ? 'w-2' : '', letterClassName)}
                >
                    {letter}
                </motion.span>
            ))}
        </motion.div>
    );
};
