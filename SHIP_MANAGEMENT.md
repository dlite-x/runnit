# Ship Management Guide

## Overview
Ships are the key to expanding your interplanetary civilization. They enable colonization of new planets, transportation of resources between worlds, and protection of trade routes from pirate threats.

## Ship Types

### Colony Ship
- **Purpose**: Colonize uninhabited planets (Mars, Moon)
- **Cost**: 200 credits
- **Capacity**: Carries up to 50 colonists to establish new settlements
- **Cargo**: Can transport food, fuel, and metal resources
- **One-time use**: Consumed upon successful colonization

### Cargo Ship
- **Purpose**: Transport resources between planets
- **Cost**: 200 credits
- **Cargo Capacity**: Can load/unload food, fuel, metal, and power
- **Reusable**: Can make multiple trips

### Space Station
- **Purpose**: Establish permanent orbital infrastructure at planets
- **Cost**: 500 credits
- **Capacity**: Can carry people for transport
- **Cargo**: Cannot carry cargo resources
- **Deployment**: One station per location (Earth, Moon, Mars only - not EML1)
- **One-time use**: Consumed upon deployment, becomes permanent orbiting structure
- **Trade Benefits**: 
  - 2 stations deployed: +1 credits/hour from space trade
  - 3+ stations deployed: +2 credits/hour from space trade

### Frigate (Combat Ship)
- **Purpose**: Defend trade routes and destroy pirate vessels
- **Cost**: 300 credits
- **Upkeep**: -1 credits/hour while in your fleet
- **Combat**: Auto-hunts pirates in deployment location
- **Deployment**: Can be deployed at Earth, Moon, or Mars to patrol that area
- **Reusable**: Returns home after combat, can be launched to new destinations
- **Combat Stats**:
  - **Hunting Speed**: 0.021 units (faster patrol)
  - **Fire Rate**: 2 seconds between shots
  - **Damage**: 5 hits to destroy a pirate

## Building Ships

- **Location**: Ships can **only be built on Earth**
- **Requirements**: 
  - Sufficient credits (200 for Colony/Cargo, 300 for Frigate, 500 for Station)
  - Ships are built and appear in orbit around Earth
- Ships start with 0 fuel and must be refueled before launch

## Flight Control Panel

Access the Flight Control Panel via the "Solar System Flight Control" button to manage all your ships.

### Ship Information Display
Each ship shows:
- **Name**: Ship identifier (e.g., Colony Ship 1, Station 1, Frigate 1)
- **Type**: Colony, Cargo, Station, or Frigate
- **Location**: Current planet
- **Destination**: Target planet (click to change)
- **Fuel**: Current fuel / Required fuel for destination
- **Cargo**: Resources loaded (cargo ships only - stations cannot carry cargo)
- **People**: Number of people on board (colony ships and stations)
- **ETA**: Estimated time of arrival (when in transit)
- **Status**: Docked, Ready, In Transit, Deployed, or Needs Fuel

### Setting Destinations
1. Click on the destination cell for your ship
2. Select from available planets:
   - **All ships**: Earth, Mars, Moon
   - **Colony ships only**: EML1 (Lagrange Point)
   - **Stations**: Cannot select EML1 as destination
3. Fuel requirements update automatically based on distance

### Refueling Ships
- Click the fuel icon (⛽) to top up fuel
- Fuel is drawn from your current planet's fuel reserves
- Fuel is added incrementally based on available resources
- Cost: 1 fuel resource per unit

### Managing Cargo (Cargo Ships Only)
1. Click "Load/Unload" button (disabled for stations and frigates)
2. Modal opens showing current cargo and planet resources
3. Adjust sliders to load or unload:
   - **Food**
   - **Fuel**
   - **Metal**
4. Click "Confirm" to apply changes
5. Resources are immediately transferred to/from ship

**Note**: Space stations and frigates cannot carry cargo resources. This button is disabled for these ship types.

### Deploying Frigates (Combat Operations)
1. Launch frigate to desired planet (Moon, Mars, or Earth)
2. Wait for frigate to arrive at destination
3. Click "Deploy" in the actions menu
4. Frigate automatically patrols and hunts pirates in that location
5. After all pirates destroyed, frigate returns to stationary position
6. Click "Recall" to undeploy and make frigate available for launch again
7. **Important**: Frigates must be recalled before they can travel to new destinations

### Launching Ships
1. Ensure ship has sufficient fuel for the journey
2. Ship status must show "Ready to Launch"
3. Click "Launch" button
4. Ship enters transit and travels to destination
5. Monitor ETA for arrival time

### Deploying Stations (Stations Only)
1. Launch station to desired destination (Moon, Mars, or Earth)
2. Wait for station to arrive at destination
3. Click "Deploy" button when arrived
4. Station becomes a permanent orbiting structure at that location
5. **Restrictions**:
   - Only one station can be deployed per location
   - Cannot deploy at EML1
   - Station is consumed upon deployment

## Pirates and Combat

### Pirate Spawning
- **Pirates appear 30 seconds after stations are deployed**
- **Earth-Moon Route**: 2 pirates spawn when both Earth and Moon have stations
- **Moon-Mars Route**: 2 pirates spawn when both Moon and Mars have stations
- Pirates patrol trade routes between stations

### Pirate Economics
- **Each alive pirate causes -1 credits/hour penalty**
- This penalty stacks with multiple pirates
- Destroying pirates removes their credit penalty
- Pirates respawn if their route's stations remain deployed

### Combat Strategy
1. **Deploy Frigates**: Build frigates on Earth (300 credits each)
2. **Position Strategically**: Launch frigates to planets near pirate routes
3. **Deploy for Auto-Hunt**: Use "Deploy" action to activate auto-hunting
4. **Monitor Combat**: Frigates automatically engage nearby pirates
5. **Recall When Done**: After pirates destroyed, recall frigates for redeployment

### Combat Mechanics
- Frigates automatically target nearest pirate in their deployment area
- Fire rate: One shot every 2 seconds
- Pirates require 5 hits to destroy
- Frigates return to stationary position after combat
- Must recall frigates before launching to new destinations

## Travel Guide

Click the rocket icon (🚀) in the top-right corner to open the Travel Guide.

### Understanding the Matrix
- **Rows**: Origin planet (where you're traveling from)
- **Columns**: Destination planet (where you're going to)
- **Each Cell Shows**:
  - ⛽ Fuel cost for the journey
  - ⏱️ Travel time duration

### Fuel Requirements
- Earth ↔ Moon: 7 fuel
- Earth ↔ Mars: 12 fuel
- Moon ↔ Mars: 6 fuel
- Earth ↔ EML1: 5 fuel

## Best Practices

### Colonization Strategy
1. Build a Colony Ship on Earth
2. Set destination to Mars, Moon, or EML1
3. Load colonists (up to 50 people)
4. Top up fuel to 100% of requirement
5. Launch when ready
6. Ship automatically colonizes upon arrival

### Station Deployment Strategy
1. Build Space Stations on Earth (costs 500 credits each)
2. Set destination to Moon or Mars (not EML1)
3. Load people if transporting colonists
4. Refuel for the journey
5. Launch and wait for arrival
6. Deploy at destination to create permanent orbital infrastructure
7. Remember: Only one station per location allowed
8. **Pirate Warning**: Pirates spawn 30 seconds after deploying station pairs

### Fleet Defense Strategy
1. **Before Deploying Stations**: Build at least one frigate first
2. **Station Deployment**: Deploy stations to establish trade routes
3. **Immediate Defense**: Launch and deploy frigates to protect routes
4. **Combat Positioning**: Deploy frigates at planets along pirate routes
5. **Economic Balance**: Each frigate costs 1 credit/hour upkeep but saves 1 credit/hour by destroying pirates
6. **Recall and Redeploy**: After clearing pirates, recall frigates to send them to new threats

### Resource Transport
1. Build Cargo Ships for regular supply runs
2. Load resources at origin planet
3. Ensure sufficient fuel for round trip
4. Launch and wait for arrival
5. Unload cargo at destination
6. Refuel and return or continue to next destination

### Fleet Management
- Build multiple cargo ships for efficient resource distribution
- Deploy stations strategically to maximize trade income (+2 with 3 stations)
- Maintain frigate fleet for pirate defense (balance upkeep cost with pirate penalties)
- Keep ships fueled and ready for emergencies
- Monitor ETAs to coordinate arrivals
- Use the Travel Guide to plan efficient routes
- Remember station deployment limits (one per location)
- **Deploy frigates immediately after stations to minimize pirate penalty time**

## Economic Considerations

### Income Sources
- **Population**: Earth population generates credits
- **Space Trade**: +1 with 2 stations, +2 with 3+ stations

### Expenses
- **Frigate Upkeep**: -1 credits/hour per frigate in fleet
- **Pirate Penalty**: -1 credits/hour per alive pirate

### Cost-Benefit Analysis
- Frigates cost upkeep but eliminate pirate penalties
- With active trade routes (pirates present), frigates break even economically
- Stations increase trade income (+1 or +2) which can offset fleet costs
- Strategic deployment of frigates is essential for profitable trade routes

## Tips
- **Plan ahead**: Check fuel requirements before building ships
- **Resource balance**: Ensure you have enough fuel production to support fleet operations
- **Strategic positioning**: Keep cargo ships at key locations for quick response
- **Station placement**: Deploy stations at high-traffic planets for maximum utility
- **Colonize early**: Establishing Mars/Moon bases enables local resource production and reduces transport needs
- **Budget wisely**: Stations cost more (500 credits) but provide permanent infrastructure
- **Combat readiness**: Build frigates BEFORE deploying station pairs to prevent pirate credit drain
- **Frigate lifecycle**: Deploy → Hunt → Return → Recall → Launch to new location
- **Defense timing**: Deploy frigates within 30 seconds of stations to catch pirates immediately upon spawn
