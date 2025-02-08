import { SearchSuggestion } from '@/models/SearchSuggestion'
import { GraphData } from '@/models/GraphData'

export async function fetchSearchSuggestions(): Promise<SearchSuggestion[]> {
  const response = await fetch('http://localhost:8000/entities')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const entities = await response.json()
  
  return entities
    .filter((entity: any) => entity.is_well_described)
    .map((entity: any) => new SearchSuggestion(
      entity.nice_name,
      entity.name, 
      entity.short_name
    ))
}

export async function fetchComponentData(name: string): Promise<any> {
  const response = await fetch(`http://localhost:8000/entities/${name}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function fetchGraphData(graphName: string): Promise<GraphData> {
  const response = await fetch(`http://localhost:8000/graphs/${graphName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  // Convert backend rendering config to frontend format
  if (data.rendering_config) {
    data.rendering_config = {
      orientation: data.rendering_config.orientation.toLowerCase()
    }
  }
  return new GraphData(data)
}