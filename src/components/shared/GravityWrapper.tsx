'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';

interface GravityWrapperProps {
    children: React.ReactNode;
}

export default function GravityWrapper({ children }: GravityWrapperProps) {
    const [isActive, setIsActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const bodiesRef = useRef<{ element: HTMLElement; body: Matter.Body }[]>([]);
    const requestRef = useRef<number | null>(null);

    const activateGravity = useCallback(() => {
        if (isActive || !containerRef.current) return;

        const engine = Matter.Engine.create();
        engineRef.current = engine;

        const { world } = engine;

        // Create boundaries
        const width = window.innerWidth;
        const height = window.innerHeight;

        const ground = Matter.Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
        const leftWall = Matter.Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
        const rightWall = Matter.Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true });
        const ceiling = Matter.Bodies.rectangle(width / 2, -100, width, 100, { isStatic: true });

        Matter.Composite.add(world, [ground, leftWall, rightWall, ceiling]);

        // Find elements to apply gravity to
        // We target common interactive and content elements that are not too deeply nested
        const selectors = 'button, a, .card, h1, h2, h3, p, .bg-white, .bg-slate-900, .rounded-2xl, .chat-message';
        const elements = containerRef.current.querySelectorAll(selectors);

        const newBodies: { element: HTMLElement; body: Matter.Body }[] = [];

        elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Skip hidden or already processed elements
            if (htmlEl.offsetParent === null) return;

            const rect = htmlEl.getBoundingClientRect();
            const body = Matter.Bodies.rectangle(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                rect.width,
                rect.height,
                {
                    restitution: 0.5,
                    friction: 0.1,
                    chamfer: { radius: 4 }
                }
            );

            // Store initial style to preserve layout potentially
            htmlEl.style.position = 'fixed';
            htmlEl.style.width = `${rect.width}px`;
            htmlEl.style.height = `${rect.height}px`;
            htmlEl.style.top = '0';
            htmlEl.style.left = '0';
            htmlEl.style.margin = '0';
            htmlEl.style.zIndex = '9999';

            newBodies.push({ element: htmlEl, body });
        });

        bodiesRef.current = newBodies;
        Matter.Composite.add(world, newBodies.map(b => b.body));

        // Mouse control
        const mouse = Matter.Mouse.create(containerRef.current);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        Matter.Composite.add(world, mouseConstraint);

        setIsActive(true);

        // Simulation loop
        const update = () => {
            Matter.Engine.update(engine, 1000 / 60);

            newBodies.forEach(({ element, body }) => {
                const { x, y } = body.position;
                const angle = body.angle;
                element.style.transform = `translate(${x - body.bounds.max.x + body.bounds.min.x + (body.bounds.max.x - body.bounds.min.x) / 2 - (element.offsetWidth / 2)}px, ${y - (element.offsetHeight / 2)}px) rotate(${angle}rad)`;

                // Simpler transform if above is messy
                element.style.transform = `translate(${x - element.offsetWidth / 2}px, ${y - element.offsetHeight / 2}px) rotate(${angle}rad)`;
            });

            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);

    }, [isActive]);

    // Expose toggle to window for easy access/hidden command
    useEffect(() => {
        (window as any).activateAntigravity = activateGravity;
        return () => {
            delete (window as any).activateAntigravity;
        };
    }, [activateGravity]);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full min-h-screen">
            {children}
            {/* Hidden debug button or just let the user call it from console initially */}
            {!isActive && (
                <button
                    onClick={activateGravity}
                    className="fixed bottom-4 right-4 opacity-0 hover:opacity-10 dark:text-white text-[10px] z-[10000]"
                >
                    .
                </button>
            )}
        </div>
    );
}
