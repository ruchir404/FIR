export interface BNSSuggestion {
  section: {
    section_number: string
    title: string
    description: string
    punishment?: string
  }
  confidence: number
  reasoning: string
  matchedKeywords: string[]
}

export class BNSSuggestionService {
  async suggestBNSSections(
    incidentType: string,
    description: string,
    location?: string
  ): Promise<BNSSuggestion[]> {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        incident_type: incidentType,
        description,
        location,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch BNS suggestions from backend")
    }

    const data = await response.json()

    if (!data.predictions || !Array.isArray(data.predictions)) {
      return []
    }

    return data.predictions.map((p: any) => ({
      section: {
        section_number: p.section_number,
        title: p.title,
        description: p.description,
        punishment: p.punishment,
      },
      confidence: Math.round((p.confidence ?? 0) * 100),
      reasoning: p.reasoning ?? "",
      matchedKeywords: p.matched_keywords ?? [],
    }))
  }
}

export const bnsSuggestionService = new BNSSuggestionService()
