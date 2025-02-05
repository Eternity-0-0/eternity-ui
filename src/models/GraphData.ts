export interface Position {
    x: number;
    y: number;
}

export interface SizeConfig {
    nodeWidth: number;
    nodeHeight: number;
    nodePadding: number;
    groupPadding: number;
}

export type NodeShape = 'ellipse' | 'rectangle' | 'octagon';

export class Node {
    id: string;
    name: string;
    nice_name: string;
    type: string;
    entity_subtype?: string;
    group?: string;
    status?: string;
    center?: Position;
    shape: NodeShape;
    width: number;
    height: number;

    constructor(data: {
        id: string;
        name: string;
        nice_name: string;
        type: string;
        entity_subtype?: string;
        group?: string;
        status?: string;
        center?: Position;
        shape?: NodeShape;
        width?: number;
        height?: number;
    }) {
        this.id = data.id;
        this.name = data.name;
        this.nice_name = data.nice_name;
        this.type = data.type;
        this.entity_subtype = data.entity_subtype;
        this.group = data.group;
        this.status = data.status;
        this.center = data.center;
        
        // Set shape based on type if not provided
        this.shape = data.shape || this.getDefaultShape(data.type);
        this.width = data.width || 140;  // Default width
        this.height = data.height || 60;  // Default height
    }

    private getDefaultShape(type: string): NodeShape {
        switch (type) {
            case 'process':
                return 'rectangle';
            case 'effect':
                return 'octagon';
            case 'entity':
            default:
                return 'ellipse';
        }
    }
}

export class Edge {
    source: string;
    target: string;

    constructor(data: { source: string; target: string }) {
        this.source = data.source;
        this.target = data.target;
    }
}

export class GraphData {
    name: string;
    nice_name: string;
    nodes: Node[];
    edges: Edge[];
    size_config?: SizeConfig;

    constructor(data: {
        name: string;
        nice_name: string;
        nodes: Array<any>;
        edges: Array<any>;
        size_config?: SizeConfig;
    }) {
        this.name = data.name;
        this.nice_name = data.nice_name;
        this.nodes = data.nodes.map(node => new Node(node));
        this.edges = data.edges.map(edge => new Edge(edge));
        this.size_config = data.size_config;
    }
}