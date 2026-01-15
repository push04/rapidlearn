'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SparklesProps {
    id?: string;
    className?: string;
    background?: string;
    minSize?: number;
    maxSize?: number;
    particleDensity?: number;
    particleColor?: string;
    children?: React.ReactNode;
}

export const SparklesCore = ({
    id = 'sparkles',
    className,
    background = 'transparent',
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 100,
    particleColor = '#00f2ff',
    children,
}: SparklesProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const updateDimensions = () => {
            const parent = canvas.parentElement;
            if (parent) {
                setDimensions({
                    width: parent.offsetWidth,
                    height: parent.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        const particles: Array<{
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            opacitySpeed: number;
        }> = [];

        // Create particles
        for (let i = 0; i < particleDensity; i++) {
            particles.push({
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                size: Math.random() * (maxSize - minSize) + minSize,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random(),
                opacitySpeed: Math.random() * 0.02 + 0.005,
            });
        }

        let animationId: number;

        const animate = () => {
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, dimensions.width, dimensions.height);

            particles.forEach((particle) => {
                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Wrap around edges
                if (particle.x < 0) particle.x = dimensions.width;
                if (particle.x > dimensions.width) particle.x = 0;
                if (particle.y < 0) particle.y = dimensions.height;
                if (particle.y > dimensions.height) particle.y = 0;

                // Update opacity
                particle.opacity += particle.opacitySpeed;
                if (particle.opacity > 1 || particle.opacity < 0) {
                    particle.opacitySpeed *= -1;
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor.replace(')', `, ${particle.opacity})`).replace('rgb', 'rgba');
                ctx.fill();

                // Draw glow
                const gradient = ctx.createRadialGradient(
                    particle.x,
                    particle.y,
                    0,
                    particle.x,
                    particle.y,
                    particle.size * 4
                );
                gradient.addColorStop(0, particleColor.replace(')', `, ${particle.opacity * 0.5})`).replace('rgb', 'rgba'));
                gradient.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationId);
    }, [dimensions, background, minSize, maxSize, particleDensity, particleColor]);

    return (
        <div className={cn('relative overflow-hidden', className)}>
            <canvas
                ref={canvasRef}
                id={id}
                className="absolute inset-0 pointer-events-none"
            />
            {children}
        </div>
    );
};
