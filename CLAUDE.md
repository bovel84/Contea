# CLAUDE.md - AI Assistant Guide for Contea

## Project Overview

**Contea** ("Il Conte a Corte" - The Count at Court) is a sophisticated medieval strategy simulation game written entirely in Italian. It's a single-page web application (SPA) that combines resource management, dynasty simulation, diplomacy, warfare, and AI-powered narrative generation through the Groq API.

### Key Statistics
- **Project Type**: Browser-based game (HTML/CSS/JavaScript)
- **Architecture**: Monolithic single-file application
- **Primary Language**: JavaScript (ES6+), Italian for all content
- **Size**: ~589KB (16,380 lines in index.html)
- **Dependencies**: Zero external dependencies (vanilla JavaScript)
- **AI Integration**: Groq API (llama3-70b-8192 model)
- **Storage**: Browser localStorage for game saves and settings

---

## Repository Structure

```
/home/user/Contea/
├── README.md           # Minimal project description (2 lines)
├── index.html          # MAIN APPLICATION FILE (16,380 lines)
│   ├── Embedded CSS (~350 lines)
│   └── Embedded JavaScript (~11,700+ lines in 3 script blocks)
├── script .js          # Legacy/additional JavaScript (200 lines, appears unused)
├── style .css          # Legacy/additional CSS (148 lines, appears overridden)
└── .git/               # Version control
```

### Critical Understanding
**99% of the codebase is in `index.html`**. This file contains:
1. HTML structure with multiple screens and modals
2. Complete CSS styling embedded in `<style>` tags
3. All JavaScript game logic embedded in `<script>` tags

---

## Architecture & Design

### Application Type
- **Pattern**: Single-Page Application (SPA)
- **State Management**: Global JavaScript objects (no framework)
- **Persistence**: localStorage API
- **Rendering**: Direct DOM manipulation (no virtual DOM)
- **Navigation**: Screen-based system with `activateScreen()`

### Core Screens & Navigation

```javascript
// Main screens (navigation states)
#screen-start     → Title/menu screen with game overview
#screen-editor    → Character and kingdom creation
#screen-login     → API key configuration
#screen-game      → Main game interface with tabs
```

### Game Tabs (Within #screen-game)

```javascript
#tab-dominio      → Kingdom management (resources, buildings, population)
#tab-market       → Trading system and economy
#tab-dynasty      → Family, heirs, succession, marriages
#tab-diplomacy    → Relations with neighboring counties
#tab-chat         → Public court chat with factions
#tab-private      → Private negotiations with faction leaders
#tab-warehouse    → Resource storage and inventory
#tab-map          → Regional map with neighboring territories
```

### Modal Dialogs

```javascript
#modal-save-list      → Save/load game management
#modal-budget         → Seasonal budget report
#modal-chronicle      → AI-generated story narration
#modal-buildings      → Construction management
#modal-law-creator    → Custom law creation
#modal-marriage       → Marriage candidate selection
#modal-gameover       → Death/succession screen
#modal-generic        → Generic content modal
```

---

## Key Game Mechanics & State Objects

### 1. Dynasty System

```javascript
let dynasty = {
    ruler: {
        name: string,
        age: number,
        maxAge: number,
        health: number (0-100),
        traits: string[]
    },
    spouse: {
        name: string,
        age: number,
        origin: string,
        bonus: string
    },
    heirs: [{
        name: string,
        age: number,
        gender: "M" | "F",
        traits: string[]
    }]
};
```

**Key Functions**:
- `processLifeEvents()` - Aging, illness, accidents
- `checkBirth()` - Heir generation
- `checkDeath()` - Death checks for all family members
- `handleSuccession()` - Transfers power to heir
- `openMarriageMarket()` - Marriage candidates
- `marrySuitorIndex()` - Execute marriage

### 2. County State (Economy & Resources)

```javascript
let county = {
    name: string,
    ruler: string,
    population: number,
    gold: number,
    happiness: number (0-100),
    stability: number (0-100),
    health: number (0-100),
    security: number (0-100),

    resources: {
        // 24 resource types
        wood, stone, iron, copper, gold,
        grain, livestock, wool, herbs, clay,
        flour, iron_ingots, fabric, leather,
        bread, tools, clothes, weapons, armor,
        furniture, pottery, luxuries, arcane, textiles
    },

    buildings: {
        // Economic structures
        farms, mines, workshops, markets, ...
        // Military structures
        barracks, walls, towers, ...
        // Cultural structures
        churches, schools, libraries, ...
    }
};
```

### 3. Population System (8 Social Classes)

```javascript
let populationGroups = {
    nobility: { count, needs: {...}, happiness },
    clergy: { count, needs: {...}, happiness },
    militia: { count, needs: {...}, happiness },
    peasants: { count, needs: {...}, happiness },
    burghers: { count, needs: {...}, happiness },
    merchants: { count, needs: {...}, happiness },
    mystics: { count, needs: {...}, happiness },
    outcasts: { count, needs: {...}, happiness }
};
```

**Key Constants**:
```javascript
const POP_NEEDS = {
    nobility: { food:4, clothes:3, tools:1, furniture:2, luxuries:1 },
    clergy: { food:3, clothes:2, luxuries:1 },
    // ... detailed needs for each class
};
```

### 4. Land Ownership & Factions

```javascript
let landOwnership = {
    nobles: number,    // Percentage of land owned
    clergy: number,
    commons: number,
    crown: number      // Player's direct control
};
```

**Four Major Factions**:
- **Duca (Nobles)** - Personality: "Arrogante"
- **Cardinale (Clergy)** - Personality: "Solenne"
- **Rivoluzionario (Commons)** - Personality: "Arrabbiato"
- **Capo Spia (Spies)** - Personality: "Segreto"

### 5. War System

```javascript
let warState = {
    active: boolean,
    enemy: string,
    currentPhase: "preparation" | "battle" | "siege" | "concluded",
    alliesPower: number,
    enemyPower: number,
    siegeProgress: number,
    tactics: "aggressive" | "defensive" | "guerrilla",
    siegeType: "ram" | "tunnel" | "starve" | null
};
```

**Key War Functions**:
- `declareWarAdvanced()` - Initiate war
- `startWarCampaign()` - Begin military campaign
- `selectTactic()` - Choose combat approach
- `startBattle()` - Execute battle
- `siegeAction()` - Siege mechanics
- `concludeBattle()` - Resolve combat

### 6. Diplomatic Relations

```javascript
let activeDiplomacy = {
    neighbors: [
        {
            name: string,
            relation: number (-100 to 100),
            alliance: boolean,
            tradeAgreement: boolean,
            militaryPact: boolean
        }
    ]
};
```

### 7. Tax System

```javascript
let taxPolicy = {
    food: 0.10,      // 10% tax on food
    luxury: 0.15,
    industrial: 0.08,
    trade: 0.12,
    tithes: 0.05,    // Church tithes
    military: 0.10
};
```

### 8. Custom Laws

```javascript
let customLaws = [
    {
        name: string,
        description: string,
        effects: {
            gold: number,
            happiness: number,
            stability: number,
            // ... other stats
        },
        active: boolean
    }
];
```

### 9. Seasonal Cycle

```javascript
const SEASON_CYCLE = [
    "primavera",  // Spring
    "estate",      // Summer
    "autunno",     // Autumn
    "inverno"      // Winter
];

let worldTime = {
    year: number,
    seasonIndex: number  // 0-3, indexes into SEASON_CYCLE
};
```

**Season Progression**:
- Each turn advances one season
- Full year = 4 turns
- Events and effects tied to seasons
- Budget calculated seasonally

---

## AI Integration (Groq API)

### API Configuration

```javascript
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama3-70b-8192";

// Stored in localStorage as 'conte_api_key'
let userApiKey = localStorage.getItem('conte_api_key') || '';
```

### Nine Specialized AI Prompts

1. **`callGroq()`** - General NPC chat and faction interactions
2. **`callGroqForBattle()`** - Battle narration and outcomes
3. **`callGroqForAdvisor()`** - Strategic advice and recommendations
4. **`callGroqForChronicle()`** - Seasonal story generation
5. **`callGroqForConsequences()`** - Action consequence analysis
6. **`callGroqForDiplomacy()`** - Diplomatic dialogue
7. **`callGroqForLawEffect()`** - Custom law impact assessment
8. **`callGroqForSuccession()`** - Succession narrative
9. **`callGroqForMarriage()`** - Marriage proposal dialogue

### Personality System

```javascript
const ADVISOR_PERSONALITIES = {
    saggio: "consigliare con saggezza",      // Wise
    pessimista: "avvertire dei rischi",      // Pessimistic
    ottimista: "incoraggiare l'azione",      // Optimistic
    pragmatico: "focalizzare sui numeri"     // Pragmatic
};

const COURT_MOODS = {
    prudente: "calma",                        // Prudent
    teso: "ansia",                           // Tense
    festoso: "gioia",                        // Festive
    austero: "rigore"                        // Austere
};
```

---

## Development Workflow

### Git Workflow

**Current Branch**: `claude/claude-md-mid7ostq9aw2pfgh-01F4gXrf5cZa9VMXHtGGJ8ut`

**Branching Strategy**:
- Feature branches use `claude/` prefix
- Branch names include session IDs
- All development happens on feature branches

**Commit Conventions**:
```bash
# Recent commit patterns
"Update [component] [action]"
"Refactor [system] and [action]"
"Add [feature] in [file]"
"Implement [feature] and update [component]"
```

**Git Operations**:
```bash
# Always use exponential backoff for network operations
git push -u origin <branch-name>  # Retry: 2s, 4s, 8s, 16s
git fetch origin <branch-name>    # Same retry pattern
git pull origin <branch-name>

# CRITICAL: Never push to main/master without permission
# CRITICAL: Never use --force without explicit user request
```

### No Build System

**Important**: This project has NO build process:
- No npm/yarn
- No webpack/vite/rollup
- No TypeScript compilation
- No minification
- No dependency management

**Deployment**: Simply open `index.html` in a browser or serve via HTTP server.

### No Testing Framework

**Testing Approach**:
- Manual gameplay testing only
- No automated tests
- No test files
- No testing libraries

**When Making Changes**:
1. Verify syntax is valid JavaScript
2. Test in browser manually
3. Check browser console for errors
4. Verify game saves/loads correctly

---

## Code Conventions & Patterns

### Language: Italian

**All code uses Italian naming**:
```javascript
// Variables
let contea = { ... };      // county
let dinastia = { ... };    // dynasty
let popolazione = { ... }; // population

// Functions
function aggiornaPopolazione() { ... }  // updatePopulation
function calcolaEntrate() { ... }       // calculateRevenue
function costruisci() { ... }           // build

// UI Text
"Clicca per iniziare"  // Click to start
"Salva partita"        // Save game
"Carica partita"       // Load game
```

### Variable Naming

**Global State** (camelCase):
```javascript
let dynasty = { ... };
let county = { ... };
let warState = { ... };
let populationGroups = { ... };
```

**Constants** (UPPER_SNAKE_CASE):
```javascript
const SEASON_CYCLE = [...];
const RESOURCE_KEYS = [...];
const TOTAL_LAND = 100;
const UNREST_WARNING = 5;
```

**Functions** (camelCase):
```javascript
function updateUI() { ... }
async function callGroq() { ... }
function fmtMoney(value) { ... }
```

### Code Organization

**Section Headers** (for navigation):
```javascript
// --- DATI DINASTIA ---
// --- ECONOMIA & INDUSTRIA ---
// --- MILITARE & SICUREZZA ---
// --- ELABORAZIONE TURNO ---
```

**Use these headers to locate code sections in the large file.**

### State Management Pattern

**Centralized Global State**:
```javascript
// State is modified directly
county.gold += 100;
dynasty.ruler.health -= 10;
warState.active = true;

// Then UI is updated
updateUI();
```

**No state library** - all state mutations are direct assignments.

### DOM Manipulation Pattern

**Direct DOM access**:
```javascript
// Get elements
const element = document.getElementById('tab-dominio');
const input = document.querySelector('#input-name');

// Update content
element.innerHTML = `<p>${content}</p>`;
element.textContent = text;

// Show/hide
element.style.display = 'block';
element.classList.add('active');

// Event listeners
element.addEventListener('click', handleClick);
```

### localStorage Pattern

**Save/Load Game**:
```javascript
// Save
function saveGame(slot = 'autosave') {
    const gameData = {
        county,
        dynasty,
        warState,
        populationGroups,
        landOwnership,
        worldTime,
        // ... all game state
    };
    localStorage.setItem(slot, JSON.stringify(gameData));
}

// Load
function loadGame(slot) {
    const data = localStorage.getItem(slot);
    if (!data) return;

    const gameData = JSON.parse(data);
    county = gameData.county;
    dynasty = gameData.dynasty;
    // ... restore all state

    updateUI();
}
```

**Save Slots**:
- `autosave` - Automatic save each turn
- `quick` - Quick save slot
- `manuale` - Manual save
- Custom slots: User-defined names

### API Call Pattern

**Standard Groq API Call**:
```javascript
async function callGroq(prompt, context) {
    const apiKey = localStorage.getItem('conte_api_key');
    if (!apiKey) {
        alert('Inserisci la tua API key prima!');
        return null;
    }

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
```

### UI Update Pattern

**Centralized UI Update**:
```javascript
function updateUI() {
    // Update HUD
    document.getElementById('hud-gold').textContent = fmtMoney(county.gold);
    document.getElementById('hud-happiness').textContent = county.happiness;

    // Update faction bars
    updateFactionBars();

    // Update resource display
    updateResourceDisplay();

    // Update population stats
    updatePopulationStats();
}
```

**Always call `updateUI()` after state changes.**

---

## Common Tasks & Patterns

### Adding a New Resource

1. Add to `RESOURCE_KEYS` array
2. Add label to `resourceLabels` object
3. Add to `county.resources` default values
4. Add production/consumption logic
5. Update UI display functions

### Adding a New Building

1. Add to building library section (`// --- ECONOMIA & INDUSTRIA ---`)
2. Define structure:
```javascript
{
    id: "unique_id",
    name: "Building Name",
    desc: "Description",
    category: "economic" | "military" | "cultural",
    tier: 1-4,
    cost: { wood: X, stone: Y, gold: Z },
    maintenance: { gold: X },
    effects: { /* stat changes */ },
    productionEffects: { /* resource generation */ }
}
```
3. Add to `applyEconomicEffects()` if it produces resources
4. Update building modal UI

### Adding a New Event

1. Locate `processLifeEvents()` or create new event function
2. Add event trigger logic:
```javascript
if (condition) {
    // Apply effects
    county.gold -= cost;
    dynasty.ruler.health -= damage;

    // Log event
    addMessage(`Event description: ${details}`);

    // Update UI
    updateUI();
}
```

### Modifying Combat System

**War System Files/Sections**:
- War state object: line ~4991
- `declareWarAdvanced()`: Initiate war
- `startBattle()`: Battle mechanics
- `siegeAction()`: Siege options
- `callGroqForBattle()`: AI narration

### Adding New Faction

1. Update faction lists in faction personalities section
2. Add faction relationship tracking
3. Add chat handlers for faction leader
4. Update land ownership distribution
5. Add faction-specific events

### Modifying Tax System

**Tax Functions**:
- `calculateTaxes()`: Revenue calculation
- `adjustTaxRate()`: UI controls for tax adjustment
- Tax categories in `TAX_CATEGORIES` constant
- Apply tax effects in `applyEconomicEffects()`

---

## File Reference Guide

### Location: index.html

**CSS Section** (lines ~10-360):
- CSS variables (line 11-21)
- Base styles (line 23-46)
- Screen layouts (line 48-55)
- Input/button styles (line 57-90)
- Panel/modal styles (line 92-98)
- Responsive design (search: `@media`)

**JavaScript Section** (lines ~4000-16000+):

**Key Line Ranges** (approximate):
```
4480-4650:   Core utilities and dynasty initialization
4650-4750:   Tax and law systems
4750-4900:   Resource and economy systems
4900-5100:   County state, war state, diplomacy state
5100-5400:   Population system
5400-5600:   Dynasty management (marriage, succession)
5600-6500:   UI update functions
6500-7500:   Save/load system
7500-8200:   Building library
8200-9500:   Economic effects and production
9500-10500:  Market and trading
10500-11000: Turn processing
11000-12000: AI integration (Groq API calls)
12000-14000: Chat system and faction interactions
14000-16000: War, diplomacy, events
```

**To Find Specific Functions**:
```bash
# Use grep to locate functions
grep -n "^function functionName" index.html
grep -n "^async function functionName" index.html

# Use section headers
grep -n "// ---.*---" index.html
```

---

## Testing Guidelines

### Manual Testing Checklist

**After Code Changes**:
1. ✅ Open `index.html` in browser
2. ✅ Check browser console for JavaScript errors
3. ✅ Test affected features manually
4. ✅ Verify save/load works
5. ✅ Check UI rendering on desktop and mobile
6. ✅ Test API calls (if modified)
7. ✅ Verify localStorage persistence

### Common Issues & Debugging

**Issue: Changes not appearing**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

**Issue: API calls failing**
- Verify API key is set
- Check Groq API status
- Inspect network tab in DevTools
- Check CORS policy

**Issue: Save/load broken**
- Clear localStorage: `localStorage.clear()`
- Check JSON parsing errors
- Verify state object structure

**Issue: UI not updating**
- Ensure `updateUI()` is called
- Check element IDs match
- Verify state is actually changed

### Browser DevTools

**Essential DevTools Tabs**:
1. **Console**: JavaScript errors and logs
2. **Network**: API call inspection
3. **Application > Storage > Local Storage**: Saved games
4. **Elements**: Inspect DOM and CSS
5. **Sources**: Set breakpoints in JavaScript

---

## AI Assistant Guidelines

### Before Making Changes

**Always**:
1. ✅ Read the relevant section of `index.html` first
2. ✅ Understand existing code patterns
3. ✅ Check for similar implementations in the codebase
4. ✅ Identify which state objects are affected
5. ✅ Plan UI updates needed

**Never**:
1. ❌ Propose changes without reading the code
2. ❌ Assume framework patterns (React, Vue, etc.)
3. ❌ Add external dependencies without discussion
4. ❌ Create new files unnecessarily
5. ❌ Change API without user permission

### Making Changes

**Best Practices**:
```javascript
// ✅ Good: Direct, simple changes
county.gold += 100;
updateUI();

// ❌ Bad: Over-engineered abstraction
const stateManager = {
    updateResource(resource, delta) {
        this.state[resource] += delta;
        this.notifyObservers();
    }
};
```

**Keep it simple**: This is vanilla JavaScript, not a framework.

### Code Style Consistency

**Match Existing Style**:
- Use Italian variable names
- Use `let` for mutable, `const` for constants
- Use `camelCase` for functions and variables
- Use `UPPER_SNAKE_CASE` for constants
- Use `// ---` section headers
- Add comments explaining complex logic

### Security Considerations

**Known Limitations**:
1. API keys stored in localStorage (client-side)
2. No input sanitization before AI prompts
3. Direct `innerHTML` usage (XSS risk with user input)
4. No CORS protection

**When Adding Features**:
- Avoid `eval()` or `Function()` constructors
- Sanitize user input before using in `innerHTML`
- Don't store sensitive data in localStorage
- Validate user input on client-side

### Performance Considerations

**File Size**:
- Single HTML file is 589KB (quite large)
- Every edit increases load time
- Consider file size when adding features

**Optimization Tips**:
- Batch DOM updates when possible
- Use event delegation for repeated elements
- Cache DOM queries in variables
- Minimize API calls (they're expensive)

---

## Troubleshooting

### Common Development Issues

**Problem: "Cannot read property of undefined"**
```javascript
// Cause: State object not initialized
// Solution: Ensure state is created before access
if (!county) county = createDefaultCounty();
```

**Problem: "localStorage quota exceeded"**
```javascript
// Cause: Too much data in saves
// Solution: Clear old saves, compress data
localStorage.removeItem('old_save');
```

**Problem: "Unexpected token in JSON"**
```javascript
// Cause: Invalid JSON in localStorage
// Solution: Add try-catch around JSON.parse
try {
    const data = JSON.parse(localStorage.getItem('slot'));
} catch (e) {
    console.error('Invalid save data', e);
    return null;
}
```

**Problem: UI not responding to clicks**
```javascript
// Cause: Element not found or event not attached
// Solution: Check element ID and event listener
const button = document.getElementById('btn-id');
if (button) {
    button.addEventListener('click', handler);
}
```

### Git Issues

**Problem: Push fails with 403**
```bash
# Ensure branch starts with 'claude/' and has correct session ID
git checkout -b claude/feature-name-<session-id>
```

**Problem: Merge conflicts**
```bash
# This project rarely has conflicts (single developer)
# If conflicts occur, carefully review index.html sections
git status  # See conflicted files
# Manually resolve conflicts in index.html
git add index.html
git commit -m "Resolve merge conflicts"
```

---

## Deployment

### Local Development

```bash
# Option 1: Direct file open
# Open index.html directly in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: HTTP server (recommended for API calls)
python3 -m http.server 8000
# Then visit http://localhost:8000

# Option 3: Node.js http-server
npx http-server
```

### Production Deployment

**Simple Static Hosting**:
- Upload `index.html` to any static host
- GitHub Pages
- Netlify
- Vercel
- AWS S3

**No Build Required**:
- Just upload the file
- No environment variables
- No server-side processing

**User Requirements**:
- Modern browser (ES6+ support)
- Groq API key
- Internet connection (for API calls)

---

## API Reference

### Groq API Integration

**Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
**Model**: `llama3-70b-8192`
**Authentication**: Bearer token in header

**Request Format**:
```javascript
{
    "model": "llama3-70b-8192",
    "messages": [
        { "role": "system", "content": "System prompt..." },
        { "role": "user", "content": "User message..." }
    ],
    "temperature": 0.7,
    "max_tokens": 500
}
```

**Response Format**:
```javascript
{
    "choices": [
        {
            "message": {
                "content": "AI response text..."
            }
        }
    ]
}
```

### localStorage API Usage

**Keys Used**:
```javascript
'conte_api_key'        // Groq API key
'conte_personality'    // Advisor personality settings
'autosave'             // Automatic save slot
'quick'                // Quick save slot
'manuale'              // Manual save slot
// + custom save slot names
```

---

## Future Improvements (Notes)

### Potential Enhancements

**Code Organization**:
- [ ] Split into multiple files (HTML, CSS, JS)
- [ ] Implement module system
- [ ] Add TypeScript for type safety
- [ ] Create build process

**Testing**:
- [ ] Add unit tests for game logic
- [ ] Add integration tests for save/load
- [ ] Add E2E tests for gameplay

**Performance**:
- [ ] Implement lazy loading
- [ ] Add service worker for offline play
- [ ] Optimize large state objects
- [ ] Minify code for production

**Security**:
- [ ] Server-side API key management
- [ ] Input sanitization
- [ ] XSS protection
- [ ] Rate limiting for API calls

**Features**:
- [ ] Multiplayer support
- [ ] Cloud saves
- [ ] Achievements system
- [ ] Modding support

---

## Quick Reference Commands

### Git Operations
```bash
# Check status
git status

# Create feature branch
git checkout -b claude/feature-name-<session-id>

# Commit changes
git add index.html
git commit -m "Descriptive message"

# Push with retry on failure
git push -u origin <branch-name>

# Fetch updates
git fetch origin <branch-name>
git pull origin <branch-name>
```

### Testing in Browser
```bash
# Start local server
python3 -m http.server 8000

# Open browser
# Navigate to http://localhost:8000

# Open browser console
# Press F12 or Ctrl+Shift+I
```

### Finding Code
```bash
# Search for function
grep -n "function functionName" index.html

# Search for section
grep -n "// --- SECTION NAME ---" index.html

# Search for variable
grep -n "let variableName" index.html

# Search for string
grep -n "search term" index.html
```

---

## Contact & Support

**Issue Tracking**: Check git commit messages for development history
**Original Language**: Italian (all UI text, variables, comments)
**Browser Support**: Modern browsers with ES6+ support

---

## Summary for AI Assistants

### Key Takeaways

1. **Single File Architecture**: 99% of code is in `index.html`
2. **No Dependencies**: Pure vanilla JavaScript, no frameworks
3. **Italian Codebase**: All naming and UI text in Italian
4. **Global State**: Direct state mutation, no state management library
5. **localStorage Persistence**: All saves stored client-side
6. **Groq API Integration**: AI-powered narrative generation
7. **No Build Process**: Edit and refresh, no compilation
8. **Manual Testing Only**: No automated test suite
9. **Git Workflow**: Feature branches with `claude/` prefix
10. **Medieval Simulation**: Complex game with dynasty, economy, war, diplomacy

### Critical Rules

1. ✅ **Always read code before proposing changes**
2. ✅ **Match existing code style and patterns**
3. ✅ **Test changes manually in browser**
4. ✅ **Call `updateUI()` after state changes**
5. ✅ **Use Italian naming conventions**
6. ❌ **Never add external dependencies without discussion**
7. ❌ **Never create new files unnecessarily**
8. ❌ **Never assume framework patterns**
9. ❌ **Never push to main/master without permission**
10. ❌ **Never modify API configuration without discussion**

---

**Last Updated**: 2025-11-24
**Document Version**: 1.0
**Target Audience**: AI Assistants (Claude Code, etc.)
