import type { Node, Edge } from 'reactflow';

export interface ClientNodeData {
  id: string;
  label: string;
  type: 'client';
}

export interface ContactNodeData {
  id: string;
  label: string;
  type: 'contact';
}

export interface TrustAccountNodeData {
  id: string;
  label: string;
  type: 'trustAccount';
}

export type NetworkNodeData = ClientNodeData | ContactNodeData | TrustAccountNodeData;
export type NetworkNode = Node<NetworkNodeData>;
export type NetworkEdge = Edge; 