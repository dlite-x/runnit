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
│   ├── EarthVisualization.tsx    # Main game component
│   ├── CO2LogModal.tsx           # CO2 emissions history viewer
│   ├── FlightControlPanel.tsx    # Ship management interface
│   ├── InvestmentModal.tsx       # Investment/market systems
│   ├── MarketModal.tsx           # Resource trading
│   ├── MissionsModal.tsx         # Mission system
│   ├── ResearchModal.tsx         # Research tree interface
│   ├── ShipLaunchModal.tsx       # Ship launch interface
│   └── ui/                       # shadcn/ui components
├── hooks/
│   ├── use-building-levels.tsx   # Building construction/upgrades
│   ├── use-credits.tsx           # Currency management
│   ├── use-earth-climate.tsx     # CO2 and temperature tracking
│   ├── use-investment.tsx        # Investment system
│   ├── use-planet-population.tsx # Population growth/decline
│   └── use-planet-resources.tsx  # Resource production/consumption
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
- Integrates custom hooks for game state management
- Handles celestial body orbital mechanics and rotation
- Manages ship launches and interplanetary travel via FlightControlPanel
- Opens modal dialogs for various game systems
- Displays resource stocks, production rates, and climate data
- Coordinates between different game systems (resources, population, climate)

**Key State (managed via hooks)**:
```typescript
// Building levels (use-building-levels.tsx)
- buildingLevels: { lab, farm, power, mine, refinery }

// Resources (use-planet-resources.tsx)
- resources: { food, fuel, metal, power }
- productionRates: { food, fuel, metal, power }

// Population (use-planet-population.tsx)
- population: number
- growthRatePerHour: number

// Climate (use-earth-climate.tsx, Earth only)
- co2ppm: number
- temperature: number (calculated from CO2)
- co2Events: CO2Event[]

// Credits (use-credits.tsx)
- credits: number (global currency)

// UI State
- selectedPlanet: 'Earth' | 'Mars' | 'Moon'
- isMarsColonized: boolean
- isMoonColonized: boolean
- Modal states (research, ships, market, etc.)
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
- Farm → Food production (affected by temperature on Earth)
- Refinery → Fuel production
- Mine → Metal production
- Power Plant → Power production
- Production rate = building_level per hour
- Per-second increment = building_level / 3600

**Resource Consumption** (Earth only):
- Population consumes food: population / 100 per hour
- Food shortage causes population decline

**Resource Types**:
1. **Credits** - Universal currency for all purchases (+3/sec base rate)
2. **Food** - Required for population growth, affected by climate on Earth
3. **Fuel** - Required for ship travel and operations
4. **Metal** - Required for building construction and ship building
5. **Power** - Powers all facilities and operations

### 7. Climate System (Earth Only)

**CO2 Emissions**:
- Each building constructed: +1 ppm CO2
- Events are logged with timestamp and description

**Temperature Effects**:
- Temperature = 0.0125 × CO2ppm - 5
- Farm efficiency = 1 - temperature × 0.20
- At 0°C: 100% efficiency (optimal)
- At 5°C: 0% efficiency (farming collapse)
- At -5°C: 200% efficiency (cold climate bonus)

**Feedback Loop**:
- More buildings → Higher CO2 → Higher temperature → Lower farm efficiency → Food shortage → Population decline

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

### Technical Improvements Made
1. **Hook-based state management**: Game state now managed via custom hooks
   - `use-building-levels.tsx` - Building construction
   - `use-planet-resources.tsx` - Resource production/consumption
   - `use-planet-population.tsx` - Population dynamics
   - `use-earth-climate.tsx` - Climate simulation
   - `use-credits.tsx` - Currency management

2. **Modal-based UI**: Major systems separated into modal components
   - ResearchModal - Research tree interface
   - FlightControlPanel - Ship management
   - CO2LogModal - Climate event history
   - MarketModal, InvestmentModal, MissionsModal

### Remaining Technical Debt
1. **No backend separation**: All game logic still runs in frontend
   - Economic calculations done in React hooks
   - No server-side validation
   - State persisted to localStorage only

2. **No centralized configuration**: Game constants scattered throughout code
   - Building costs hard-coded in components
   - Research tree hard-coded in ResearchModal
   - Travel times hard-coded in ship system

3. **Limited scalability**: Current architecture not suitable for:
   - Multiplayer features
   - Server-side validation
   - Cloud save synchronization
   - Advanced analytics

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
POST /api/building/construct - Start building construction (adds CO2)
POST /api/building/upgrade - Upgrade existing building (adds CO2)
POST /api/ship/launch - Launch ship to destination
POST /api/ship/build - Build new ship (adds CO2)
POST /api/research/start - Begin research project
GET /api/gamestate - Get current game state (all planets)
POST /api/colonize - Colonize new planet
GET /api/climate - Get Earth climate data (CO2, temperature, events)
POST /api/population/adjust - Manually adjust population
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

## Recent Improvements

1. **State Management Refactored**: Game state now managed via custom React hooks instead of monolithic component state
2. **Modular Components**: Major features extracted into modal components (Research, Ships, Market, etc.)
3. **Climate System Implemented**: Full CO2 tracking with temperature effects on food production
4. **Population Dynamics**: Food-based growth/decline with proper feedback loops
5. **localStorage Persistence**: All game state persists across sessions

---

**Last Updated**: Current session
**Status**: Functional single-player game with climate simulation
**Architecture**: Hook-based state management with localStorage persistence
**Primary Goal**: Continue modularization and prepare for backend integration