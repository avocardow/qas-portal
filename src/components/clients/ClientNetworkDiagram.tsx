import React, { useMemo, useRef, useState, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, Node, Edge, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

export type NetworkNode = {
  id: string;
  label: string;
  type: 'client' | 'contact' | 'trustAccount';
};

export type NetworkEdge = {
  id: string;
  source: string;
  target: string;
};

interface ClientNetworkDiagramProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  width?: number;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;
const HORIZONTAL_GAP = 200;
const VERTICAL_GAP = 100;

export default function ClientNetworkDiagram({
  nodes,
  edges,
  width = 800,
  onNodeClick
}: ClientNetworkDiagramProps) {
  // Responsive container width
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(width);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const [rfNodes, rfEdges] = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};

    // Position client node at top center
    const clientNode = nodes.find(n => n.type === 'client');
    if (clientNode) {
      positions[clientNode.id] = {
        x: containerWidth / 2 - NODE_WIDTH / 2,
        y: VERTICAL_GAP
      };
    }

    // Position contact nodes
    const contactNodes = nodes.filter(n => n.type === 'contact');
    contactNodes.forEach((node, idx) => {
      const totalWidth = contactNodes.length * (NODE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP;
      positions[node.id] = {
        x: containerWidth / 2 - totalWidth / 2 + idx * (NODE_WIDTH + HORIZONTAL_GAP),
        y: VERTICAL_GAP * 2 + NODE_HEIGHT
      };
    });

    // Position trust account nodes
    const trustNodes = nodes.filter(n => n.type === 'trustAccount');
    trustNodes.forEach((node, idx) => {
      const totalWidth = trustNodes.length * (NODE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP;
      positions[node.id] = {
        x: containerWidth / 2 - totalWidth / 2 + idx * (NODE_WIDTH + HORIZONTAL_GAP),
        y: VERTICAL_GAP * 3 + NODE_HEIGHT * 2
      };
    });

    // Map to React Flow nodes
    const rfNodes: Node[] = nodes.map(n => ({
      id: n.id,
      data: { label: n.label, type: n.type },
      position: positions[n.id] || { x: 0, y: 0 },
      style: {
        border: n.type === 'client'
          ? '2px solid #856404'
          : n.type === 'contact'
          ? '2px solid #155724'
          : '2px solid #004085',
        borderRadius: 4,
        padding: 10,
        background: n.type === 'client'
          ? '#FFF3CD'
          : n.type === 'contact'
          ? '#D4EDDA'
          : '#D1ECF1',
        color: '#212529'
      }
    }));

    // Map to React Flow edges
    const rfEdges: Edge[] = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: '#333' }
    }));

    return [rfNodes, rfEdges];
  }, [nodes, edges, containerWidth]);

  return (
    <ReactFlowProvider>
      <div ref={containerRef} data-testid="network-diagram" className="w-full h-64 sm:h-80 md:h-96 lg:h-[400px]">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          fitView
          style={{ width: '100%', height: '100%' }}
          panOnScroll
          zoomOnPinch
          onNodeClick={onNodeClick}
        >
          <Controls />
          <Background gap={20} color="#aaa" />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
} 