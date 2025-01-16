export interface Node {
    id: string;
    nice_name: string;
    type: string;
    group?: string;
    status?: string;
}

export interface Edge {
    source: string;
    target: string;
}

export interface GraphData {
    name: string;
    nice_name: string;
    nodes: Node[];
    edges: Edge[];
}