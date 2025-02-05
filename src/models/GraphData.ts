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

export class Node {
    id: string;
    nice_name: string;
    type: string;
    group?: string;
    status?: string;
    position?: Position;

    constructor(data: {
        id: string;
        nice_name: string;
        type: string;
        group?: string;
        status?: string;
        position?: Position;
    }) {
        this.id = data.id;
        this.nice_name = data.nice_name;
        this.type = data.type;
        this.group = data.group;
        this.status = data.status;
        this.position = data.position;
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