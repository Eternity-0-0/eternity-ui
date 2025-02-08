import type { Selection } from 'd3'
import type { Node, NodeShape } from '@/models/GraphData'
import { LAYOUT_CONFIG } from '@/constants/graph'

type D3Selection = Selection<any, any, any, any>

interface ShapeConfig {
    width: number
    height: number
    fill: string
    stroke: string
    strokeWidth: string
}

export function renderNode(selection: D3Selection, node: Node, config: ShapeConfig) {
    if (node.entity_subtype === 'cofactor') return

    // For point nodes, override the fill color to use edge color
    const nodeConfig = node.shape === 'point' ? {
        ...config,
        fill: 'var(--edge-color-dark)'
    } : config

    switch (node.shape) {
        case 'point':
            renderPoint(selection, nodeConfig)
            break
        case 'rectangle':
            renderRectangle(selection, nodeConfig)
            break
        case 'ellipse':
            renderEllipse(selection, nodeConfig)
            break
        case 'octagon':
            renderOctagon(selection, nodeConfig)
            break
    }
}

function renderPoint(selection: D3Selection, config: ShapeConfig) {
    selection.append('circle')
        .attr('r', config.width / 2)  // Using width as diameter
        .attr('fill', config.fill)
        .attr('stroke', 'none')
}

function renderRectangle(selection: D3Selection, config: ShapeConfig) {
    selection.append('rect')
        .attr('width', config.width)
        .attr('height', config.height)
        .attr('x', -config.width / 2)
        .attr('y', -config.height / 2)
        .attr('fill', config.fill)
        .attr('stroke', config.stroke)
        .attr('stroke-width', config.strokeWidth)
        .attr('rx', LAYOUT_CONFIG.RECTANGLE_CORNER_RADIUS)
}

function renderEllipse(selection: D3Selection, config: ShapeConfig) {
    selection.append('ellipse')
        .attr('rx', config.width / 2)
        .attr('ry', config.height / 2)
        .attr('fill', config.fill)
        .attr('stroke', config.stroke)
        .attr('stroke-width', config.strokeWidth)
}

function renderOctagon(selection: D3Selection, config: ShapeConfig) {
    const points = calculateOctagonPoints(config.width / 2, config.height / 2)
    selection.append('polygon')
        .attr('points', points)
        .attr('fill', config.fill)
        .attr('stroke', config.stroke)
        .attr('stroke-width', config.strokeWidth)
}

function calculateOctagonPoints(width: number, height: number): string {
    const w = width * LAYOUT_CONFIG.OCTAGON_FACTOR
    const points = [
        [-width + w, -height],
        [width - w, -height],
        [width, -height + w],
        [width, height - w],
        [width - w, height],
        [-width + w, height],
        [-width, height - w],
        [-width, -height + w]
    ]
    return points.map(p => p.join(',')).join(' ')
}

export function renderNeonEffect(selection: D3Selection, node: Node, config: ShapeConfig) {
    if (node.entity_subtype === 'cofactor' || node.shape === 'point') return

    // Create a group for the neon effect
    const neonGroup = selection.append('g')
        .attr('class', 'neon-effect')

    const neonConfig = {
        ...config,
        fill: 'none',
        stroke: 'white'
    }

    switch (node.shape) {
        case 'rectangle':
            renderRectangle(neonGroup, neonConfig)
            break
        case 'ellipse':
            renderEllipse(neonGroup, neonConfig)
            break
        case 'octagon':
            renderOctagon(neonGroup, neonConfig)
            break
    }

    // Add blur filter only to the neon effect group
    neonGroup.attr('filter', 'url(#overlay-blur)')
} 