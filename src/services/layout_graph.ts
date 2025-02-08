import ELK from 'elkjs/lib/elk.bundled.js'
import { GraphData, Node } from '@/models/GraphData'

export async function computeGraphLayout(graph: GraphData): Promise<GraphData> {
    // Check if any node already has a position
    const hasPositions = graph.nodes.some(node => node.center !== undefined)
    if (hasPositions) {
        return graph
    }

    const elk = new ELK()

    // Get unique groups
    const groups = [...new Set(graph.nodes.filter(node => node.group).map(node => node.group))]

    // Prepare ELK-compatible data structure
    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': graph.rendering_config.orientation === 'right' ? 'RIGHT' : 'DOWN',
            'elk.spacing.nodeNode': '40',
            'elk.padding': '[top=25,left=25,bottom=25,right=25]',
            'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
            'elk.edgeRouting': 'POLYLINE',
            'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
            'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        },
        children: [
            // Add group nodes first
            ...groups.map(group => ({
                id: `group-${group}`,
                layoutOptions: {
                    'elk.padding': '[top=15,left=15,bottom=15,right=15]'
                },
                children: graph.nodes
                    .filter(node => node.group === group)
                    .map(node => ({
                        id: node.id,
                        width: node.width,
                        height: node.height,
                        type: node.type,
                        label: node.nice_name
                    }))
            })),
            // Add ungrouped nodes
            ...graph.nodes
                .filter(node => !node.group)
                .map(node => ({
                    id: node.id,
                    width: node.width,
                    height: node.height,
                    type: node.type,
                    label: node.nice_name
                }))
        ],
        edges: graph.edges.map(edge => ({
            id: `${edge.source}-${edge.target}`,
            sources: [edge.source],
            targets: [edge.target]
        }))
    }

    // Compute layout with ELK
    const elkLayout = await elk.layout(elkGraph)

    // Apply computed positions to nodes
    elkLayout.children?.forEach(child => {
        if ('children' in child) {
            // This is a group
            child.children?.forEach(node => {
                const graphNode = graph.nodes.find(n => n.id === node.id)
                if (graphNode) {
                    graphNode.center = {
                        x: (child.x || 0) + (node.x || 0),
                        y: (child.y || 0) + (node.y || 0)
                    }
                }
            })
        } else {
            // This is an ungrouped node
            const graphNode = graph.nodes.find(n => n.id === child.id)
            if (graphNode) {
                graphNode.center = {
                    x: child.x || 0,
                    y: child.y || 0
                }
            }
        }
    })

    return graph
}
