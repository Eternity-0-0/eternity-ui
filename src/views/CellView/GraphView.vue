<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as d3 from 'd3'
import ELK from 'elkjs/lib/elk.bundled.js'

interface Node {
  id: string
  nice_name: string
  type: string
}

interface Edge {
  source: string
  target: string
}

interface GraphData {
  name: string
  nice_name: string
  nodes: Node[]
  edges: Edge[]
}

const container = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!container.value) return

  const response = await fetch('http://localhost:8000/graphs/carbohydrates_catabolism')
  const data: GraphData = await response.json()

  const elk = new ELK()

  // Prepare ELK-compatible data structure
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      // 'elk.spacing.nodeNode': '120',  // Increased node spacing for clarity
      // 'elk.layered.spacing.edgeNode': '50',  // Edge-node spacing
      // 'elk.spacing.edgeEdge': '50',  // Increased spacing between edges
      // 'elk.edgeRouting': 'ORTHOGONAL'  // Make edges more readable
    },
    children: data.nodes.map(node => ({
      id: node.id,
      width: 140,  // Consistent width for improved alignment
      height: 80,  // Consistent height
      type: node.type,
      label: node.nice_name
    })),
    edges: data.edges.map(edge => ({
      id: `${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target]
    }))
  }


  // Compute layout with ELK for node positions only
  const elkLayout = await elk.layout(elkGraph)

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  const svg = d3.select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width/2 - elkLayout.width!/2},20)`)

  const nodePositions = new Map<string, { x: number; y: number }>()
  elkLayout.children?.forEach(node => {
    nodePositions.set(node.id, { x: node.x!, y: node.y! })
  })

  const link = svg.selectAll('.link')
    .data(data.edges)
    .enter().append('line')
    .attr('class', 'link')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 2)

  const node = svg.selectAll('.node')
    .data(elkLayout.children!)
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x},${d.y})`)

  node.append('rect')
    .filter(d => (d as any).type === 'process')
    .attr('width', 150)
    .attr('height', 60)
    .attr('x', -75)
    .attr('y', -30)
    .attr('fill', '#ffffff')
    .attr('stroke', '#666')
    .attr('stroke-width', 1.5)
    .attr('rx', 10)
    .attr('ry', 10)

  node.append('ellipse')
    .filter(d => (d as any).type === 'entity')
    .attr('rx', 60)
    .attr('ry', 30)
    .attr('fill', '#ffffff')
    .attr('stroke', '#666')
    .attr('stroke-width', 1.5)

  // Add foreignObject for wrapped text
  const textContainer = node.append('foreignObject')
    .attr('x', d => (d as any).type === 'process' ? -70 : -55)
    .attr('y', d => (d as any).type === 'process' ? -25 : -35)
    .attr('width', d => (d as any).type === 'process' ? 140 : 110)
    .attr('height', d => (d as any).type === 'process' ? 50 : 70)

  textContainer.append('xhtml:div')
    .style('width', '100%')
    .style('height', '100%')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('justify-content', 'center')
    .style('text-align', 'center')
    .style('font-size', '14px')
    .style('word-wrap', 'break-word')
    .text(d => {
      const foundNode = data.nodes.find(n => n.id === d.id)
      return foundNode ? foundNode.nice_name : ''
    })

  // Set edge positions using D3 based on node coordinates
  link
    .attr('x1', d => nodePositions.get(d.source)?.x || 0)
    .attr('y1', d => nodePositions.get(d.source)?.y || 0)
    .attr('x2', d => nodePositions.get(d.target)?.x || 0)
    .attr('y2', d => nodePositions.get(d.target)?.y || 0)
})
</script>

<template>
  <div ref="container" class="graph-container"></div>
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
  min-height: 800px;
  background-color: #f5f8fb;
}
</style>