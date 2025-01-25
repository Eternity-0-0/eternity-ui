import { SearchSuggestion } from '@/models/SearchSuggestion'

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