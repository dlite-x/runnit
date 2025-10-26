# Codebase Summary - Space Colonization Game

## Project Overview
A 3D interactive space colonization and exploration game built with React and Three.js. Players manage Earth, colonize the Moon and Mars, build structures, launch ships, conduct research, and manage resources across multiple celestial bodies.

## Technology Stack
- **Frontend Framework**: React 18.3.1 with TypeScript
- **3D Graphics**: Three.js with @react-three/fiber (v8.18.0) and @react-three/drei (v9.122.0)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (connected external project)
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Routing**: React Router DOM v6
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/
│   ├── EarthVisualization.tsx    # Main game component (3200+ lines)
│   ├── ShipLaunchModal.tsx       # Ship launch interface
│   └── ui/                       # shadcn/ui components
├── pages/
│   ├── Index.tsx                 # Main entry page
│   └── NotFound.tsx              # 404 page
├── assets/                       # 3D textures and models
│   ├── earth-texture.jpg
│   ├── moon-texture-2k.jpg
│   ├── mars-texture-2k.jpg
│   ├── xwing.glb
│   └── cycler_ship_obj.zip
├── integrations/
│   └── supabase/
│       ├── client.ts             # Supabase client config
│       └── types.ts              # Database types
└── lib/
    └── utils.ts                  # Utility functions
```

## Core Game Components

### 1. EarthVisualization.tsx (Main Game Engine)
**Location**: `src/components/EarthVisualization.tsx`

**Responsibilities**:
- Renders 3D visualizations of Earth, Moon, and Mars using Three.js
- Manages all game state (buildings, resources, ships, research, events)
- Handles celestial body orbital mechanics and rotation
- Controls building construction and upgrades
- Manages ship launches and interplanetary travel
- Implements research tree progression
- Handles random events system
- Manages resource production and consumption

**Key State Variables**:
```typescript
// Celestial Bodies
- selectedPlanet: 'earth' | 'moon' | 'mars'
- isMoonColonized: boolean
- isMarsColonized: boolean

// Resources
- totalBudget: number (global currency)
- globalPopulation: number
- globalFood: number
- globalWater: number
- globalEnergy: number

// Buildings (per planet)
- earthBuildings: Building[]
- moonBuildings: Building[]
- marsBuildings: Building[]

// Ships & Travel
- ships: Ship[]
- activeShipTab: 'earth' | 'moon' | 'mars'

// Research
- completedResearch: string[]
- activeResearch: string | null
- researchProgress: number

// Events
- activeEvent: Event | null
- eventHistory: Event[]
```

### 2. Building System

**Building Structure**:
```typescript
interface Building {
  id: string;
  name: string;
  type: 'housing' | 'food' | 'water' | 'energy' | 'research' | 'landing';
  level: number;
  constructionProgress: number;
  isUnderConstruction: boolean;
  isUpgrading: boolean;
  position: [number, number, number];
}
```

**Building Types**:
- **Housing**: Provides population capacity
- **Food Production**: Generates food resources
- **Water Production**: Generates water resources
- **Energy Production**: Generates energy resources
- **Research Lab**: Enables research activities
- **Landing Pad**: Required for ship operations

**Construction Mechanics**:
- Buildings require budget and resources
- Construction takes time (simulated via progress)
- Buildings can be upgraded to higher levels
- Each upgrade increases production/capacity
- Landing pads required before colonizing new planets

### 3. Ship System

**Ship Structure**:
```typescript
interface Ship {
  id: string;
  name: string;
  type: string;
  location: 'earth' | 'moon' | 'mars' | 'traveling' | 'preparing';
  destination?: string;
  travelProgress?: number;
  launchedAt?: number;
  capacity: {
    population: number;
    food: number;
    water: number;
    energy: number;
  };
  cargo: {
    population: number;
    food: number;
    water: number;
    energy: number;
  };
}
```

**Ship Types Available**:
1. **Cycler Ship** - Basic transport vessel
2. **X-Wing** - Advanced spacecraft
3. **Dragon Capsule** - Cargo transport
4. **Orion Capsule** - Crew transport

**Travel Mechanics**:
- Ships travel between Earth, Moon, and Mars
- Travel time varies by distance (Moon: ~3 days, Mars: ~7 months in simulation)
- Ships can carry population and resources
- Ships remain under origin planet's control until destination is colonized
- Once destination is colonized, ships transfer to destination's control

### 4. Research System

**Research Tree**:
```typescript
const researchTree = {
  'basic-rocketry': { name: 'Basic Rocketry', cost: 1000, time: 5 },
  'advanced-propulsion': { name: 'Advanced Propulsion', cost: 2000, time: 10 },
  'life-support': { name: 'Life Support Systems', cost: 1500, time: 8 },
  'hydroponics': { name: 'Hydroponics', cost: 1200, time: 6 },
  'nuclear-power': { name: 'Nuclear Power', cost: 3000, time: 12 },
  // ... more research items
}
```

**Research Mechanics**:
- Research costs budget and takes time
- Only one research project active at a time
- Research unlocks new capabilities and buildings
- Research labs increase research speed
- Completed research persists across game sessions

### 5. Event System

**Event Types**:
- Solar flares (affects energy production)
- Meteor impacts (damages buildings)
- Equipment malfunctions (requires repairs)
- Scientific discoveries (bonuses)
- Resource discoveries (instant resources)

**Event Structure**:
```typescript
interface Event {
  id: string;
  type: string;
  title: string;
  description: string;
  effects: {
    resources?: { type: string; amount: number }[];
    buildingDamage?: boolean;
  };
  timestamp: number;
}
```

### 6. Resource Management

**Resource Production**:
- Each building type produces specific resources
- Production rate = base_rate × building_level × number_of_buildings
- Resources consumed by population over time
- Balance between production and consumption critical

**Resource Types**:
1. **Budget** - Global currency for all purchases
2. **Population** - Citizens across all colonies
3. **Food** - Required for population survival
4. **Water** - Required for population survival
5. **Energy** - Powers all facilities

## Game Flow

### Initial State
1. Player starts on Earth with:
   - Initial budget: $100,000
   - Small population
   - Basic resources
   - No buildings constructed

### Progression Path
1. **Build Infrastructure on Earth**
   - Construct housing, food, water, energy production
   - Build research labs
   - Establish economic foundation

2. **Research & Development**
   - Unlock rocketry technology
   - Research life support systems
   - Advance propulsion technology

3. **Lunar Colonization**
   - Build landing pad on Moon
   - Launch ships with colonists and supplies
   - Establish Moon base
   - Develop Moon infrastructure

4. **Mars Expansion**
   - Unlock Mars-specific technologies
   - Build advanced ships
   - Establish Mars colony
   - Create self-sustaining Mars base

## 3D Visualization Details

### Celestial Bodies
- **Earth**: Rotating sphere with realistic texture, clouds, atmosphere
- **Moon**: Orbits Earth, realistic surface texture
- **Mars**: Orbits Sun separately, red planet appearance

### Camera Controls
- Orbit controls for 3D navigation
- Click planets to focus/select
- Zoom and pan capabilities
- Auto-rotation option

### Visual Elements
- Orbital paths visualization
- Building markers on planet surfaces
- Ship travel trajectories
- UI panels overlay 3D scene

## UI Components

### Main Interface Sections
1. **Top Status Bar**
   - Global resources display
   - Budget, population, food, water, energy
   - Current date/time (simulated)

2. **Planet Selector**
   - Tabs for Earth, Moon, Mars
   - Shows colonization status

3. **Building Panel**
   - Lists all buildings on selected planet
   - Construction queue
   - Upgrade options
   - Build new structures button

4. **Ship Control Panel**
   - Ship roster per planet
   - Launch new ships
   - Ship status and cargo
   - Travel progress

5. **Research Panel**
   - Available research projects
   - Active research progress
   - Completed research tree
   - Research benefits display

6. **Events Panel**
   - Current active events
   - Event history
   - Event impact notifications

## Key Game Mechanics

### Time Simulation
- Game time advances automatically
- 1 real second ≈ simulated time period
- Buildings construct over time
- Ships travel over time
- Research completes over time
- Resources produced/consumed continuously

### Economy
- Budget-based purchasing system
- Resource production/consumption balance
- Building costs increase with level
- Research requires budget investment

### Colonization Requirements
1. **Moon Colonization**:
   - Build landing pad on Moon
   - Launch ship with population/resources
   - Ship must arrive at Moon
   - Toggle "Colonize Moon" button

2. **Mars Colonization**:
   - Similar to Moon requirements
   - Requires advanced research
   - Longer travel times

### Ship Control Logic
- Ships owned by origin planet until destination colonizes
- Upon colonization, arriving ships transfer to new colony
- Ships can return to origin planet
- Empty ships can be scrapped

## Current Issues & Limitations

### Known Issues
1. **Ship ownership transition**: Recently fixed - ships now correctly remain under Earth control until Moon/Mars is colonized

### Technical Debt
1. **EarthVisualization.tsx is monolithic**: 3200+ lines in single file
   - All game logic in one component
   - All state management in one place
   - Difficult to maintain and extend

2. **No backend separation**: All game logic runs in frontend
   - Economic calculations done in React component
   - No server-side validation
   - No persistent game state (except research in localStorage)

3. **No centralized configuration**: Game constants scattered throughout code
   - Building costs hard-coded
   - Research times hard-coded
   - Travel times hard-coded

4. **Limited scalability**: Current architecture not suitable for:
   - Complex economic simulations
   - Advanced AI/automation
   - Multiplayer features
   - Server-side game logic

## Recommended Architecture for Backend Integration

### Proposed Split
**Frontend (Lovable)** - Handles:
- 3D visualization and rendering
- User interface and interactions
- Displaying game state
- Sending player actions to backend

**Backend (Emergent)** - Handles:
- Game logic and calculations
- Economic simulation
- Resource production/consumption
- Building construction timing
- Ship travel calculations
- Research progression
- Event generation
- State persistence

### Integration Approach
1. **Create centralized config file** (`gameConfig.json`):
   - Building costs, production rates
   - Research tree definitions
   - Ship specifications
   - Travel times and calculations

2. **API Communication**:
   - Frontend calls backend API for all actions
   - Backend returns updated game state
   - Frontend renders the state

3. **Supabase as Bridge** (optional):
   - Store game state in Supabase database
   - Backend writes state changes
   - Frontend reads and displays state
   - Real-time subscriptions for updates

### Example API Endpoints Needed
```
POST /api/building/construct - Start building construction
POST /api/building/upgrade - Upgrade existing building
POST /api/ship/launch - Launch ship to destination
POST /api/research/start - Begin research project
GET /api/gamestate - Get current game state
POST /api/colonize - Colonize new planet
```

## Next Steps for Backend Integration

1. **Extract game constants** to configuration file
2. **Define API contract** between frontend and backend
3. **Create game state schema** for database
4. **Implement API client** in frontend
5. **Migrate game logic** to backend gradually
6. **Add real-time updates** via WebSockets or Supabase subscriptions
7. **Implement state persistence** and save/load functionality

## Dependencies to Note

### Critical Version Requirements
- `@react-three/fiber`: Must use v8.18.0 (React 18 compatible)
- `@react-three/drei`: Must use v9.122.0 (not v10+)
- `three`: v0.180.0 or compatible

### Supabase Configuration
- External Supabase project connected
- Project ID: `hsarqhniuyqikzwxdjet`
- Currently minimal backend usage
- Database schema not yet defined for game state

## File Size Warning
`EarthVisualization.tsx` is the largest file at 3200+ lines and contains:
- All game state (50+ useState hooks)
- All game logic functions
- All UI rendering
- All 3D scene setup
- This should be refactored into smaller, focused modules

---

**Last Updated**: Current session
**Status**: Functional prototype, ready for backend integration
**Primary Goal**: Separate frontend (UI/3D) from backend (game logic/calculations)