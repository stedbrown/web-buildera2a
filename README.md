# WebBuilder A2A - Generatore di Siti Web con AI

Una web app moderna e intuitiva per creare siti web utilizzando l'intelligenza artificiale, basata sul protocollo A2A (Agent2Agent) di Google e integrata con il modello gratuito DeepSeek R1.

![WebBuilder A2A](https://img.shields.io/badge/WebBuilder-A2A-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)

## 🚀 Caratteristiche Principali

### 🤖 Integrazione AI Avanzata
- **Modello DeepSeek R1**: Gratuito e potente per la generazione di codice
- **Protocollo A2A**: Architettura Agent2Agent per comunicazione AI
- **Generazione intelligente**: HTML, CSS e JavaScript con un solo prompt
- **Modifica mirata**: Possibilità di modificare singoli aspetti del codice

### 🎨 Editor Moderno
- **Monaco Editor**: Editor di codice professionale con syntax highlighting
- **Multi-tab**: HTML, CSS e JavaScript in tab separati
- **Auto-save**: Salvataggio automatico delle modifiche
- **Debounced updates**: Aggiornamenti ottimizzati delle prestazioni

### 👀 Anteprima Live
- **Preview in tempo reale**: Visualizzazione istantanea delle modifiche
- **Multi-device**: Anteprima desktop, tablet e mobile
- **Iframe sicuro**: Sandbox per l'esecuzione sicura del codice
- **Apertura esterna**: Possibilità di aprire in nuova finestra

### 📁 Gestione Progetti
- **Store persistente**: Salvataggio locale con Zustand
- **Export completo**: Download progetti come file ZIP
- **Import/Export**: Condivisione progetti tra utenti
- **Metadata**: Tracking automatico di date e versioni

### 🎯 UX/UI Eccellente
- **Design moderno**: Interfaccia pulita con shadcn/ui
- **Responsive**: Funziona perfettamente su ogni dispositivo
- **Accessibilità**: Supporto completo per screen reader
- **Dark/Light mode**: Tema automatico del sistema

## 🛠️ Tecnologie Utilizzate

### Frontend
- **[Next.js 14](https://nextjs.org)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org)** - Type safety e sviluppo robusto
- **[Tailwind CSS](https://tailwindcss.com)** - Styling utility-first
- **[shadcn/ui](https://ui.shadcn.com)** - Componenti UI moderni e accessibili

### Editor & Anteprima
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Editor di codice VS Code
- **[React Hot Toast](https://react-hot-toast.com)** - Notifiche eleganti
- **Iframe Sandbox** - Esecuzione sicura del codice utente

### State Management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management leggero e performante
- **Persistent storage** - Salvataggio automatico nel browser

### AI & API
- **[OpenRouter](https://openrouter.ai)** - Gateway per modelli AI
- **[DeepSeek R1](https://deepseek.ai)** - Modello AI gratuito e potente
- **[Axios](https://axios-http.com)** - Client HTTP per API calls

### File Management
- **[JSZip](https://stuk.github.io/jszip/)** - Creazione file ZIP
- **[FileSaver.js](https://github.com/eligrey/FileSaver.js/)** - Download file dal browser

## 🔧 Installazione e Setup

### Prerequisiti
- Node.js (versione 18 o superiore)
- npm o yarn
- Account OpenRouter (per chiave API gratuita)

### 1. Clona il repository
```bash
git clone https://github.com/yourusername/webbuilder-a2a.git
cd webbuilder-a2a
```

### 2. Installa le dipendenze
```bash
npm install
# oppure
yarn install
```

### 3. Configura le variabili d'ambiente
Crea un file `.env.local` nella root del progetto:

```env
# OpenRouter API Key (gratuita)
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Opzionale: configurazioni aggiuntive
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Ottieni la chiave API OpenRouter
1. Vai su [OpenRouter.ai](https://openrouter.ai)
2. Crea un account gratuito
3. Naviga nella sezione "Keys"
4. Genera una nuova API key
5. Copia la chiave nel file `.env.local`

### 5. Avvia il server di sviluppo
```bash
npm run dev
# oppure
yarn dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📖 Come Usare WebBuilder A2A

### 🎯 Creazione Nuovo Progetto
1. **Clicca "Nuovo Progetto"** nella sidebar sinistra
2. **Assegna un nome** al tuo progetto
3. **Inizia a programmare** o usa l'AI per generare codice

### 🤖 Generazione con AI
1. **Apri "AI Tools"** nella sidebar
2. **Scegli il tipo di generazione**:
   - 🌐 **Genera Pagina Web**: Crea una pagina completa
   - 📄 **Modifica HTML**: Aggiorna la struttura
   - 🎨 **Modifica CSS**: Cambia gli stili
   - ⚡ **Modifica JavaScript**: Aggiungi funzionalità

3. **Descrivi cosa vuoi creare**. Esempi:
   ```
   "Un sito per un ristorante con menu, contatti e gallery"
   "Aggiungi un carousel di immagini responsive"
   "Rendi il design più moderno con gradienti e animazioni"
   ```

4. **Clicca "Genera"** e guarda l'AI lavorare!

### ✏️ Modifica Manuale
- **Editor Monaco**: Modifica HTML, CSS e JavaScript
- **Syntax highlighting**: Evidenziazione codice automatica
- **Auto-completion**: Suggerimenti intelligenti
- **Error detection**: Rilevamento errori in tempo reale

### 👀 Anteprima
- **Vista Split**: Editor + anteprima contemporaneamente
- **Multi-device**: Testa su desktop, tablet e mobile
- **Refresh automatico**: Aggiornamenti istantanei
- **Apertura esterna**: Test in finestra separata

### 💾 Salvataggio ed Export
- **Auto-save**: Salvataggio automatico locale
- **Export ZIP**: Download progetto completo
- **File singoli**: Esporta HTML, CSS, JS separatamente
- **Standalone HTML**: File unico con tutto incorporato

## 🏗️ Architettura del Progetto

```
webbuilder-a2a/
├── app/                          # Next.js 14 App Router
│   ├── globals.css              # Stili globali e variabili CSS
│   ├── layout.tsx               # Layout principale
│   └── page.tsx                 # Home page
├── components/
│   ├── ui/                      # Componenti shadcn/ui
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── textarea.tsx
│   │   ├── progress.tsx
│   │   └── badge.tsx
│   ├── ai-generation-dialog.tsx # Dialog per generazione AI
│   ├── code-editor.tsx          # Editor Monaco
│   ├── header.tsx               # Header applicazione
│   ├── main-content.tsx         # Area contenuto principale
│   ├── preview.tsx              # Anteprima live
│   ├── sidebar.tsx              # Sidebar progetti e AI
│   └── theme-provider.tsx       # Provider tema scuro/chiaro
├── hooks/
│   └── use-project-store.ts     # Store Zustand per progetti
├── lib/
│   ├── ai-service.ts            # Servizio integrazione AI
│   ├── file-utils.ts            # Utility gestione file
│   └── utils.ts                 # Utility generali
├── types/
│   └── index.ts                 # Definizioni TypeScript
└── public/                      # Asset statici
```

## 🤝 Protocollo A2A

WebBuilder A2A è costruito seguendo i principi del **protocollo Agent2Agent (A2A)** di Google:

### Caratteristiche A2A Implementate:
- **Agent Discovery**: Rilevamento automatico capacità AI
- **Task Management**: Gestione lifecycle delle richieste
- **Content Exchange**: Scambio strutturato di HTML/CSS/JS
- **Error Handling**: Gestione robusta degli errori
- **Streaming Updates**: Aggiornamenti in tempo reale

### Flusso A2A:
1. **Agent Card**: Definizione capacità del modello DeepSeek
2. **Task Creation**: Creazione task di generazione codice
3. **Message Exchange**: Comunicazione strutturata con AI
4. **Artifact Generation**: Produzione di HTML, CSS, JS
5. **Status Updates**: Monitoraggio progresso generazione

## 🔮 Funzionalità Future

### 🎯 In Sviluppo
- [ ] **Template Gallery**: Libreria template predefiniti
- [ ] **Collaborative Editing**: Modifica collaborativa real-time
- [ ] **Version Control**: Sistema di versioning integrato
- [ ] **Component Library**: Libreria componenti riutilizzabili
- [ ] **Advanced AI**: Integrazione modelli AI aggiuntivi

### 🚀 Roadmap
- [ ] **Plugin System**: Estensioni di terze parti
- [ ] **Cloud Storage**: Sincronizzazione cloud progetti
- [ ] **Team Workspaces**: Spazi di lavoro team
- [ ] **Performance Analytics**: Analisi performance siti
- [ ] **SEO Optimizer**: Ottimizzazione SEO automatica

## 🐛 Risoluzione Problemi

### Problemi Comuni

#### ❌ Errore API OpenRouter
```
Errore nella comunicazione con il modello AI
```
**Soluzione**: Verifica che la chiave API sia corretta in `.env.local`

#### ❌ Monaco Editor non carica
```
Caricamento editor...
```
**Soluzione**: Ricarica la pagina, potrebbero esserci problemi di rete

#### ❌ Anteprima non funziona
```
Anteprima vuota o errori console
```
**Soluzione**: Controlla la sintassi di HTML, CSS e JavaScript

### Debug Mode
Aggiungi questa riga in `.env.local` per più informazioni di debug:
```env
NEXT_PUBLIC_DEBUG=true
```

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🙏 Ringraziamenti

- **Google** per il protocollo A2A
- **DeepSeek** per il modello AI gratuito
- **Vercel** per Next.js e deployment
- **shadcn** per i componenti UI
- **Community open source** per le fantastiche librerie

## 🤝 Contribuire

I contributi sono benvenuti! Per contribuire:

1. Fai fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📞 Supporto

- **Issues**: [GitHub Issues](https://github.com/yourusername/webbuilder-a2a/issues)
- **Discussioni**: [GitHub Discussions](https://github.com/yourusername/webbuilder-a2a/discussions)
- **Email**: support@webbuilder-a2a.com

---

**Creato con ❤️ utilizzando il protocollo A2A di Google e il modello DeepSeek R1** 