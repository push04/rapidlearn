'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Share2, Expand, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-cyan-500">Initializing Neural Link...</div>
});

interface Node {
    id: string;
    label: string;
    type: string;
    description?: string;
    val: number;
    color: string;
}

interface Edge {
    source: string;
    target: string;
    relationship: string;
}

export default function NeuronalMindMap({ documentId }: { documentId: string }) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Edge[]>([]);
    const [loading, setLoading] = useState(true);
    const graphRef = useRef<any>(null);

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                // Simulate fetching data (replace with actual Supabase call)
                // const supabase = createBrowserClient();
                // const { data: nodeData } = await supabase...

                // Mock Data for Demo
                setTimeout(() => {
                    const mockNodes = [
                        { id: '1', label: 'Quantum Entanglement', type: 'concept', val: 20, color: '#00f2ff' },
                        { id: '2', label: 'Albert Einstein', type: 'person', val: 15, color: '#ff0080' },
                        { id: '3', label: 'Spooky Action', type: 'concept', val: 10, color: '#bd00ff' },
                        { id: '4', label: 'Bell Inequality', type: 'formula', val: 12, color: '#2af598' },
                        { id: '5', label: 'Local Realism', type: 'concept', val: 10, color: '#bd00ff' },
                    ];

                    const mockLinks = [
                        { source: '2', target: '1', relationship: 'criticized' },
                        { source: '2', target: '3', relationship: 'coined' },
                        { source: '1', target: '3', relationship: 'aka' },
                        { source: '4', target: '5', relationship: 'disproved' },
                        { source: '1', target: '5', relationship: 'violates' },
                    ];

                    setNodes(mockNodes);
                    setLinks(mockLinks);
                    setLoading(false);
                }, 1000);

            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchGraph();
    }, [documentId]);

    return (
        <div className="relative w-full h-[600px] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">

            {/* HUD Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
                <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                        Neuronal Mind Map
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                        NODES: {nodes.length} | CONNECTIONS: {links.length}
                    </p>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <Button variant="outline" size="icon" className="bg-black/50 border-white/20 hover:bg-white/10">
                        <Filter className="w-4 h-4 text-cyan-500" />
                    </Button>
                    <Button variant="outline" size="icon" className="bg-black/50 border-white/20 hover:bg-white/10">
                        <Expand className="w-4 h-4 text-purple-500" />
                    </Button>
                </div>
            </div>

            {/* 3D Graph */}
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                </div>
            ) : (
                <ForceGraph3D
                    ref={graphRef}
                    graphData={{ nodes, links }}
                    nodeLabel="label"
                    nodeColor="color"
                    nodeVal="val"
                    linkColor={() => 'rgba(255,255,255,0.2)'}
                    linkWidth={1}
                    linkOpacity={0.5}
                    backgroundColor="#000000"
                    onNodeClick={(node: any) => {
                        // Focus camera on node
                        const distance = 40;
                        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
                        graphRef.current?.cameraPosition(
                            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                            node,
                            3000
                        );
                    }}
                />
            )}

            {/* Legend */}
            <div className="absolute bottom-6 left-6 pointer-events-none">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#00f2ff]" />
                        <span className="text-xs text-gray-300">Core Concepts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#ff0080]" />
                        <span className="text-xs text-gray-300">People</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#2af598]" />
                        <span className="text-xs text-gray-300">Events/Data</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
