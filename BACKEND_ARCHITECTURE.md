# Backend Architecture Documentation

## Overview

This document explains the backend implementation for the Space Colonization Game's resource management, building systems, and persistent storage using React hooks and localStorage.

## Architecture Design

The backend uses a **hook-based architecture** with five core custom hooks that manage different aspects of the game state:

1. `use-building-levels.tsx` - Building construction and upgrades
2. `use-planet-resources.tsx` - Resource production and consumption
3. `use-credits.tsx` - Currency management
4. `use-planet-population.tsx` - Population growth and management
5. `use-earth-climate.tsx` - CO2 emissions and temperature tracking

All game state is persisted to the browser's localStorage, allowing players to resume their progress across sessions.

## Core Hooks

### 1. Building Levels Hook (`use-building-levels.tsx`)

**Purpose**: Manages building construction and upgrade levels for each planet.

**Key Features**:
- Stores building levels per planet in localStorage under key `planet_buildings`
- Supports five building types: Lab, Farm, Power, Mine, Refinery
- Earth starts with default building levels (Lab: 2, Farm: 5, Power: 4, Mine: 3, Refinery: 1)
- Other planets start with all buildings at level 0

**Data Structure**:
```typescript
interface BuildingLevels {
  lab: number;
  farm: number;
  power: number;
  mine: number;
  refinery: number;
}

interface PlanetBuildings {
  [planet: string]: BuildingLevels;
}
```

**Usage**:
```typescript
const { buildingLevels, upgradeBuilding } = useBuildingLevels('Earth');

// Upgrade a building
upgradeBuilding('farm'); // Increases farm level by 1
```

**Storage Format**:
```json
{
  "Earth": { "lab": 2, "farm": 5, "power": 4, "mine": 3, "refinery": 1 },
  "Mars": { "lab": 0, "farm": 0, "power": 0, "mine": 0, "refinery": 0 }
}
```

---

### 2. Planet Resources Hook (`use-planet-resources.tsx`)

**Purpose**: Manages resource stockpiles and automatic production based on building levels.

**Key Features**:
- Stores resource stocks per planet in localStorage under key `planet_resources`
- Four resource types: Food, Fuel, Metal, Power
- **Production rate = Building level per hour** (e.g., Farm level 5 = +5 food/hour)
- Resources accumulate in real-time at 1-second intervals
- Earth starts with default resources (Food: 100, Fuel: 80, Metal: 60, Power: 100)
- Other planets start with all resources at 0

**Data Structure**:
```typescript
interface ResourceStock {
  food: number;
  fuel: number;
  metal: number;
  power: number;
}

interface PlanetResources {
  [planet: string]: ResourceStock;
}
```

**Production Formula**:
```
Per-second increment = Building Level / 3600
```

This formula converts the "per hour" production rate to a "per second" increment:
- Farm level 5 → +5 food/hour → +0.00139 food/second
- Accumulated internally as floating-point for accuracy
- Displayed in UI using `Math.floor()` to show whole numbers

**Resource-to-Building Mapping**:
- **Farm** → Food production
- **Refinery** → Fuel production
- **Mine** → Metal production
- **Power** → Power production
- **Lab** → Research production (handled separately, not implemented in this hook)

**Usage**:
```typescript
const { resources, productionRates, spendResource } = usePlanetResources('Earth', buildingLevels);

// Check current resources
console.log(resources.food); // e.g., 125.4567 (internal)
console.log(Math.floor(resources.food)); // 125 (displayed)

// Spend resources
const success = spendResource('metal', 50);
if (success) {
  console.log('Metal spent successfully');
}
```

**Storage Format**:
```json
{
  "Earth": { "food": 125.4567, "fuel": 95.2341, "metal": 78.9012, "power": 110.5678 },
  "Mars": { "food": 0, "fuel": 0, "metal": 0, "power": 0 }
}
```

---

### 3. Credits Hook (`use-credits.tsx`)

**Purpose**: Manages the player's universal currency (credits).

**Key Features**:
- Stores credits in localStorage under key `user_credits`
- Auto-increments at +3 credits/second
- Starting balance: 5000 credits
- Provides methods to manually set or spend credits

**Data Structure**:
```typescript
// Stored as a simple number in localStorage
```

**Usage**:
```typescript
const { credits, setCredits, spendCredits } = useCredits();

// Spend credits
const success = spendCredits(500);
if (success) {
  console.log('Credits spent successfully');
}

// Manually set credits
setCredits(10000);
```

**Storage Format**:
```json
"15234"
```

---

### 4. Planet Population Hook (`use-planet-population.tsx`)

**Purpose**: Manages population growth and decline based on food availability.

**Key Features**:
- Stores population per planet in localStorage under key `planet_population`
- Population grows when food stock > 0, declines when food stock <= 0
- Growth/decline rate: 1% per hour (population × 1/360,000 per second)
- Earth starts with 100 population, other planets start at 0

**Data Structure**:
```typescript
interface PlanetPopulation {
  [planet: string]: number;
}
```

**Population Dynamics**:
```
Growth rate (with food) = population × (1/360,000) per second
Decline rate (no food) = population × (1/360,000) per second
```

**Usage**:
```typescript
const { population, growthRatePerHour, adjustPopulation } = usePlanetPopulation('Earth', true, foodStock);

// Manually adjust population
adjustPopulation(50); // Add 50 people
adjustPopulation(-20); // Remove 20 people
```

**Storage Format**:
```json
{
  "Earth": 100,
  "Mars": 0,
  "Moon": 0
}
```

---

### 5. Earth Climate Hook (`use-earth-climate.tsx`)

**Purpose**: Tracks CO2 emissions and calculates global temperature based on player actions.

**Key Features**:
- Stores CO2 levels in localStorage under key `earth_co2_ppm`
- Stores CO2 events log in localStorage under key `earth_co2_events`
- Starting CO2: 400 ppm
- Temperature calculation: `0.0125 × CO2ppm - 5`
- Each building construction adds +1 ppm CO2

**Data Structure**:
```typescript
interface CO2Event {
  timestamp: number;
  action: 'building' | 'ship_construct' | 'ship_launch';
  description: string;
  co2Added: number;
  totalCO2: number;
}
```

**Temperature Examples**:
- At 400 ppm: 0°C
- At 800 ppm: 5°C (farming efficiency drops to 0%)
- At 200 ppm: -2.5°C

**Usage**:
```typescript
const { co2ppm, temperature, co2Events, addCO2Event } = useEarthClimate();

// Log a CO2 event
addCO2Event('building', 'Farm constructed on Earth');

// Check current conditions
console.log(`CO2: ${co2ppm} ppm, Temp: ${temperature.toFixed(1)}°C`);
```

**Storage Format**:
```json
// CO2 level
"415"

// CO2 events
[
  {
    "timestamp": 1730000000000,
    "action": "building",
    "description": "Farm constructed on Earth",
    "co2Added": 1,
    "totalCO2": 401
  }
]
```

---

## Integration with Main Component

The hooks are integrated into `EarthVisualization.tsx` as follows:

```typescript
// 1. Get building levels for the active planet
const { buildingLevels, upgradeBuilding } = useBuildingLevels(activePlanet);

// 2. Get climate data for Earth
const { co2ppm, temperature, co2Events, addCO2Event } = useEarthClimate();

// 3. Get resources based on building levels and temperature
const { resources, productionRates, spendResource } = usePlanetResources(
  activePlanet, 
  buildingLevels, 
  temperature, // Affects farm production on Earth
  population    // Affects food consumption
);

// 4. Get population with growth/decline based on food
const { population, growthRatePerHour, adjustPopulation } = usePlanetPopulation(
  activePlanet,
  isColonized,
  resources.food
);

// 5. Get credits
const { credits, spendCredits } = useCredits();
```

The component then uses these hooks to:
- Display current resource stocks and production rates
- Handle building upgrades (which increase production and CO2)
- Process resource spending for ship construction or other actions
- Manage the credit economy
- Track population growth/decline
- Monitor climate impact on food production
- Log CO2 emissions from player actions

---

## UI Display Format

**Resources**:
- Stock: Displayed as `Math.floor(resources.food)` (whole numbers only)
- Production: Displayed as `+{productionRates.food}/h` (e.g., "+5/h")

**Why Floor Instead of Round?**
- Using `Math.floor()` prevents rounding up resources the player doesn't actually have
- Conservative approach ensures players can't spend fractional resources
- Internal accuracy is preserved for smooth accumulation

---

## Persistence Strategy

All game state persists to **localStorage** immediately upon change:

1. **Building Upgrades**: Saved instantly when `upgradeBuilding()` is called
2. **Resource Changes**: Saved every second as resources accumulate
3. **Credit Changes**: Saved every second as credits increment
4. **Population Changes**: Saved every second as population grows/declines
5. **Climate Data**: Saved immediately when CO2 events occur
6. **CO2 Events Log**: Saved immediately to event history

**Advantages**:
- No server required for basic gameplay
- Instant save with zero latency
- Works offline
- Simple implementation

**Limitations**:
- Limited to ~5-10MB storage
- Not synchronized across devices
- Vulnerable to browser data clearing
- No multiplayer support without backend integration

---

## Future Backend Integration

For multiplayer or cloud-save functionality, the current localStorage implementation can be replaced with Supabase:

1. Create tables: `building_levels`, `planet_resources`, `user_credits`, `planet_population`, `climate_data`, `co2_events`
2. Replace localStorage calls with Supabase queries
3. Add Row Level Security (RLS) policies for user-specific data
4. Implement real-time subscriptions for live updates
5. Add server-side validation for game rules (e.g., CO2 emissions, population limits)

The hook interfaces can remain unchanged, making the transition seamless.

---

## Production Rate Design Decisions

**Why "Per Hour" Instead of "Per Second"?**
- More intuitive for players (easier to understand "+5/h" than "+0.00139/s")
- Matches common game design conventions
- Allows for slower progression without fractional UI values

**Why 1-Second Update Intervals?**
- Smooth visual updates without performance overhead
- Balances accuracy with browser performance
- Prevents localStorage write spam

**Why Store Floats Internally?**
- Prevents loss of fractional resources over time
- Example: Farm level 1 = +1 food/hour = +0.000278 food/second
- Without floats, it would take 3600 seconds to gain 1 food
- With floats, resources accumulate smoothly and accurately

---

## Example: Resource Accumulation Math

Farm level 5 on Earth:

```
Production rate: 5 food/hour
Per-second increment: 5 / 3600 = 0.001389 food/second
After 1 hour (3600 updates): 0.001389 × 3600 = 5.0004 food
```

The small rounding error (0.0004) is negligible and doesn't compound over time due to localStorage persistence.

---

## Testing the System

To verify the backend is working correctly:

1. Open browser DevTools → Application → Local Storage
2. Check for keys: `planet_buildings`, `planet_resources`, `user_credits`
3. Watch resources increment in real-time
4. Upgrade a building and verify production rate increases
5. Refresh the page and verify state persists

---

## Conclusion

This hook-based backend architecture provides:
- ✅ Persistent game state across all systems
- ✅ Real-time resource production and consumption
- ✅ Per-planet building management
- ✅ Population dynamics with food-based growth/decline
- ✅ Climate simulation with CO2 tracking and temperature effects
- ✅ Integrated feedback loops (climate ↔ food production ↔ population)
- ✅ Scalable foundation for future features
- ✅ Clean separation of concerns

The system is production-ready for single-player gameplay and can be extended to support multiplayer with minimal refactoring.
