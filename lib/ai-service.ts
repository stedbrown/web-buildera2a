import axios from 'axios'
import { AIGenerationRequest, AIGenerationResponse, OpenRouterMessage, Page } from '@/types'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL_NAME = 'deepseek/deepseek-r1-distill-qwen-32b'

// You'll need to set this environment variable
const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''

class AIService {
  private async callOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: MODEL_NAME,
          messages,
          temperature: 0.7,
          max_tokens: 6000, // Increased for multi-page generation
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'WebBuilder A2A',
          },
        }
      )

      return response.data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenRouter API Error:', error)
      throw new Error('Errore nella comunicazione con il modello AI')
    }
  }

  private createSystemPrompt(type: string): string {
    const basePrompt = `Sei un esperto sviluppatore web che aiuta a creare siti web moderni e accessibili. 
Rispondi sempre in italiano e fornisci codice pulito, ben strutturato e commentato.`

    switch (type) {
      case 'webpage':
        return `${basePrompt}
        
Quando generi una pagina web completa:
1. Crea HTML semantico e accessibile
2. Usa CSS moderno con Flexbox/Grid
3. Includi JavaScript per interattività
4. Assicurati che sia responsive
5. Usa colori e tipografia moderne
6. Includi meta tag appropriati

Fornisci il codice in sezioni separate: HTML, CSS, e JavaScript.`

      case 'multi-page-site':
        return `${basePrompt}
        
Quando generi un sito web multi-pagina:
1. Crea una struttura coerente con navigazione comune
2. Usa CSS globale condiviso per layout e stili base
3. Crea pagine specifiche con contenuti unici
4. Assicurati della navigazione tra le pagine
5. Mantieni un design coerente
6. Usa slug URL appropriati per ogni pagina

Fornisci:
- HTML per ogni pagina richiesta
- CSS globale condiviso
- CSS specifico per ogni pagina (se necessario)
- JavaScript globale condiviso
- JavaScript specifico per ogni pagina (se necessario)

Formato di risposta:
\`\`\`global-css
[CSS globale]
\`\`\`

\`\`\`global-js
[JavaScript globale]
\`\`\`

Per ogni pagina:
\`\`\`page-[slug]-html
[HTML della pagina]
\`\`\`

\`\`\`page-[slug]-css
[CSS specifico della pagina]
\`\`\`

\`\`\`page-[slug]-js
[JavaScript specifico della pagina]
\`\`\``

      case 'new-page':
        return `${basePrompt}
        
Quando crei una nuova pagina per un sito esistente:
1. Mantieni la struttura di navigazione esistente
2. Usa gli stili globali già definiti
3. Crea contenuto specifico per la nuova pagina
4. Assicurati della coerenza con il design esistente
5. Aggiungi la nuova pagina alla navigazione

Fornisci HTML, CSS specifico e JavaScript specifico per la nuova pagina.`

      case 'component':
        return `${basePrompt}
        
Quando crei componenti web:
1. Focalizzati su riusabilità
2. Usa naming conventions chiare
3. Includi stati hover e focus
4. Assicurati dell'accessibilità
5. Documenta il codice

Fornisci HTML, CSS e JavaScript se necessario.`

      case 'style':
        return `${basePrompt}
        
Quando modifichi o crei stili CSS:
1. Usa CSS moderno (Flexbox, Grid, Custom Properties)
2. Implementa design responsive
3. Ottimizza per performance
4. Usa naming conventions BEM se appropriato
5. Includi stati interattivi

Fornisci solo il codice CSS.`

      case 'script':
        return `${basePrompt}
        
Quando scrivi JavaScript:
1. Usa ES6+ features
2. Scrivi codice modulare e riusabile
3. Gestisci errori appropriatamente
4. Ottimizza per performance
5. Includi commenti esplicativi

Fornisci solo il codice JavaScript.`

      case 'page-edit':
        return `${basePrompt}
        
Quando modifichi una pagina web esistente:
1. Analizza il codice HTML, CSS e JavaScript esistente
2. Applica le modifiche richieste in modo intelligente
3. Mantieni la coerenza del design esistente
4. Modifica solo i file necessari per il cambiamento richiesto
5. Assicurati che le modifiche siano responsive e accessibili
6. Preserva le funzionalità esistenti a meno che non sia richiesto il contrario

Fornisci i file modificati (HTML, CSS, JavaScript) solo se necessario per la modifica richiesta.
Se la modifica riguarda solo gli stili, fornisci solo il CSS.
Se la modifica riguarda solo la struttura, fornisci solo l'HTML.
Se la modifica richiede nuove funzionalità, fornisci HTML, CSS e JavaScript.`

      default:
        return basePrompt
    }
  }

  private parseResponse(content: string, type: string): AIGenerationResponse {
    const response: AIGenerationResponse = {}

    if (type === 'multi-page-site') {
      return this.parseMultiPageResponse(content)
    }

    // Extract HTML
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/i)
    if (htmlMatch) {
      response.html = htmlMatch[1].trim()
    }

    // Extract CSS
    const cssMatch = content.match(/```css\n([\s\S]*?)\n```/i)
    if (cssMatch) {
      response.css = cssMatch[1].trim()
    }

    // Extract JavaScript
    const jsMatch = content.match(/```(?:javascript|js)\n([\s\S]*?)\n```/i)
    if (jsMatch) {
      response.javascript = jsMatch[1].trim()
    }

    // If no code blocks found, try to extract based on type
    if (!response.html && !response.css && !response.javascript) {
      if (type === 'style') {
        response.css = content
      } else if (type === 'script') {
        response.javascript = content
      } else {
        response.html = content
      }
    }

    // Extract explanation (text outside code blocks)
    const explanation = content
      .replace(/```[\s\S]*?```/g, '')
      .trim()
    
    if (explanation) {
      response.explanation = explanation
    }

    return response
  }

  private parseMultiPageResponse(content: string): AIGenerationResponse {
    const response: AIGenerationResponse = {
      pages: []
    }

    // Extract global CSS
    const globalCssMatch = content.match(/```global-css\n([\s\S]*?)\n```/i)
    if (globalCssMatch) {
      response.globalCss = globalCssMatch[1].trim()
    }

    // Extract global JS
    const globalJsMatch = content.match(/```global-js\n([\s\S]*?)\n```/i)
    if (globalJsMatch) {
      response.globalJs = globalJsMatch[1].trim()
    }

    // Extract pages
    const pageHtmlRegex = /```page-([^-\n]+)-html\n([\s\S]*?)\n```/gi
    let match
    while ((match = pageHtmlRegex.exec(content)) !== null) {
      const slug = match[1].trim()
      const html = match[2].trim()
      
      // Find corresponding CSS and JS for this page
      const pageCssRegex = new RegExp(`\`\`\`page-${slug}-css\\n([\\s\\S]*?)\\n\`\`\``, 'i')
      const pageJsRegex = new RegExp(`\`\`\`page-${slug}-js\\n([\\s\\S]*?)\\n\`\`\``, 'i')
      
      const cssMatch = content.match(pageCssRegex)
      const jsMatch = content.match(pageJsRegex)

      const page: Partial<Page> = {
        slug,
        name: this.slugToName(slug),
        title: this.slugToTitle(slug),
        html,
        css: cssMatch ? cssMatch[1].trim() : '',
        javascript: jsMatch ? jsMatch[1].trim() : '',
        isHomePage: slug === 'index' || slug === 'home'
      }

      response.pages!.push(page as Page)
    }

    // Extract explanation
    const explanation = content
      .replace(/```[\s\S]*?```/g, '')
      .trim()
    
    if (explanation) {
      response.explanation = explanation
    }

    return response
  }

  private slugToName(slug: string): string {
    const nameMap: Record<string, string> = {
      'index': 'Home',
      'home': 'Home',
      'about': 'Chi Siamo',
      'about-us': 'Chi Siamo',
      'contact': 'Contatti',
      'contacts': 'Contatti',
      'services': 'Servizi',
      'products': 'Prodotti',
      'blog': 'Blog',
      'news': 'News',
      'portfolio': 'Portfolio',
      'gallery': 'Galleria',
      'team': 'Il Team',
      'pricing': 'Prezzi',
      'faq': 'FAQ'
    }

    if (nameMap[slug.toLowerCase()]) {
      return nameMap[slug.toLowerCase()]
    }

    // Convert slug to title case
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private slugToTitle(slug: string): string {
    const titleMap: Record<string, string> = {
      'index': 'Pagina Principale',
      'home': 'Pagina Principale',
      'about': 'Scopri Chi Siamo',
      'about-us': 'Scopri Chi Siamo',
      'contact': 'Contattaci',
      'contacts': 'I Nostri Contatti',
      'services': 'I Nostri Servizi',
      'products': 'I Nostri Prodotti',
      'blog': 'Il Nostro Blog',
      'news': 'Ultime News',
      'portfolio': 'Il Nostro Portfolio',
      'gallery': 'Galleria Immagini',
      'team': 'Conosci il Team',
      'pricing': 'I Nostri Prezzi',
      'faq': 'Domande Frequenti'
    }

    if (titleMap[slug.toLowerCase()]) {
      return titleMap[slug.toLowerCase()]
    }

    return this.slugToName(slug)
  }

  async generateCode(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const systemPrompt = this.createSystemPrompt(request.type)
    
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: this.buildUserPrompt(request) }
    ]

    // Add context if provided
    if (request.context) {
      const contextMessage = this.buildContextMessage(request.context)
      if (contextMessage) {
        messages.splice(1, 0, { role: 'user', content: contextMessage })
      }
    }

    const response = await this.callOpenRouter(messages)
    return this.parseResponse(response, request.type)
  }

  private buildUserPrompt(request: AIGenerationRequest): string {
    switch (request.type) {
      case 'webpage':
        return `Crea una pagina web completa basata su questa richiesta: "${request.prompt}"`
      
      case 'multi-page-site':
        return `Crea un sito web multi-pagina completo basato su questa richiesta: "${request.prompt}"`
      
      case 'new-page':
        return `Crea una nuova pagina per il sito esistente: "${request.prompt}"`
      
      case 'page-edit':
        return `Modifica la pagina web esistente applicando questa modifica: "${request.prompt}"`
      
      case 'component':
        return `Crea un componente web per: "${request.prompt}"`
      
      case 'style':
        return `Modifica o crea gli stili CSS per: "${request.prompt}"`
      
      case 'script':
        return `Scrivi il codice JavaScript per: "${request.prompt}"`
      
      default:
        return request.prompt
    }
  }

  private buildContextMessage(context: any): string {
    const parts = []
    
    if (context.existingHtml) {
      parts.push(`HTML esistente:\n\`\`\`html\n${context.existingHtml}\n\`\`\``)
    }
    
    if (context.existingCss) {
      parts.push(`CSS esistente:\n\`\`\`css\n${context.existingCss}\n\`\`\``)
    }
    
    if (context.existingJs) {
      parts.push(`JavaScript esistente:\n\`\`\`javascript\n${context.existingJs}\n\`\`\``)
    }

    if (parts.length > 0) {
      return `Ecco il codice esistente da considerare:\n\n${parts.join('\n\n')}`
    }

    return ''
  }

  // Method to get suggestions for improvements
  async getSuggestions(html: string, css: string, javascript: string): Promise<string[]> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `Sei un esperto di web development. Analizza il codice fornito e suggerisci miglioramenti specifici per:
        - Accessibilità
        - Performance
        - SEO
        - User Experience
        - Codice pulito
        
        Fornisci 3-5 suggerimenti concreti e actionable in italiano.`
      },
      {
        role: 'user',
        content: `Analizza questo codice e fornisci suggerimenti:

HTML:
\`\`\`html
${html}
\`\`\`

CSS:
\`\`\`css
${css}
\`\`\`

JavaScript:
\`\`\`javascript
${javascript}
\`\`\``
      }
    ]

    try {
      const response = await this.callOpenRouter(messages)
      // Parse suggestions from response
      const suggestions = response
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 0)

      return suggestions.slice(0, 5) // Limit to 5 suggestions
    } catch (error) {
      console.error('Error getting suggestions:', error)
      return []
    }
  }
}

export const aiService = new AIService() 