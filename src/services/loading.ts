import { SearchSuggestion } from '@/models/SearchSuggestion'
import { fetchSearchSuggestions } from '@/services/api'

export async function loadSearchSuggestions(): Promise<SearchSuggestion[]> {
  const storedSuggestions = localStorage.getItem('searchSuggestions')
  if (storedSuggestions) {
    return JSON.parse(storedSuggestions).map((item: any) => 
      new SearchSuggestion(item.nice_name, item.name, item.short_name)
    )
  } else {
    // Fetch suggestions from API if not in localStorage
    const suggestions = await fetchSearchSuggestions()
    
    // Store in localStorage for future use
    localStorage.setItem('searchSuggestions', JSON.stringify(suggestions))
    return suggestions
  }
}