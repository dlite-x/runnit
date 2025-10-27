# Resource Management Rules

This document outlines the game state logic and interconnected systems for resource management, particularly for Earth.

## Earth System Overview

Earth has unique mechanics related to global warming that create interconnected feedback loops between population, food production, CO2 levels, and temperature.

## Core Variables

- **Population**: Number of people on Earth (starts at 100)
- **CO2 (ppm)**: Carbon dioxide concentration in parts per million (starts at 400 ppm)
- **Temperature (°C)**: Global temperature calculated from CO2 levels
- **Food Stock**: Available food reserves
- **Credits**: Universal currency

## Temperature Calculation

```
temperature = 0.0125 * CO2ppm - 5
```

**Examples:**
- At 400 ppm CO2: temperature = 0°C
- At 800 ppm CO2: temperature = 5°C
- At 200 ppm CO2: temperature = -2.5°C

## Food Production (Earth Only)

Farm buildings produce food, but production is affected by temperature:

```
Food production per farm level = (1 - temperature * 0.20) food/hr
```

**Examples:**
- At 0°C: 1.0 food/hr per farm level (100% efficiency)
- At 2.5°C: 0.5 food/hr per farm level (50% efficiency)
- At 5°C: 0.0 food/hr per farm level (farming collapses)
- At -5°C: 2.0 food/hr per farm level (cold is better for farming)

This creates a critical feedback loop: higher CO2 → higher temperature → reduced food production

## Food Consumption

Population consumes food continuously:

```
Food consumed per second = population / 100 / 3600
```

**Examples:**
- 100 population: 0.000278 food/sec (1 food/hr)
- 1000 population: 0.00278 food/sec (10 food/hr)

## Population Dynamics

Population growth or decline depends on food availability:

### If Food Stock > 0:
```
Population growth rate = population * (1/360,000) per second
```
This equals approximately 1% growth per hour.

### If Food Stock < 0:
```
Population decline rate = population * (1/360,000) per second
```
Same rate but negative - population decreases when starving.

**Examples:**
- 100 population with food: grows by ~1 person/hr
- 100 population without food: declines by ~1 person/hr

## Credits Generation

Credits are generated based on population:

```
Credits per second = population / 360,000
```

**Examples:**
- 100 population: 0.000278 credits/sec (1 credit/hr)
- 1000 population: 0.00278 credits/sec (10 credits/hr)
- 360,000 population: 1 credit/sec (3,600 credits/hr)

This creates an incentive to maintain and grow population, as larger populations generate more income.

## CO2 Emissions

Player actions affect CO2 levels:

### Building Construction
```
Each building constructed adds +1 ppm CO2
```

### Other Sources
(To be defined as game develops)

## Feedback Loops

### The Climate-Food Crisis Loop:
1. Building increases → CO2 increases
2. Higher CO2 → Higher temperature
3. Higher temperature → Lower farm efficiency
4. Lower farm efficiency → Food shortage
5. Food shortage → Population decline
6. Population decline → Fewer workers/consumers

### The Growth Challenge:
- Population needs food to grow
- Food production requires farms
- Farms lose efficiency as temperature rises
- Building more infrastructure increases CO2
- Players must balance growth with environmental impact

## Game Balance

The system is designed so that:
- Players must actively manage their environmental impact
- Unchecked growth leads to climate crisis and collapse
- Research and technology (to be implemented) will provide solutions
- Strategic building placement and timing matters
- There are meaningful trade-offs between short-term growth and long-term sustainability

## Future Systems (To Be Implemented)

- Research capabilities to improve efficiency
- CO2 reduction technologies
- Alternative food production methods
- Population happiness/productivity factors
- More complex economic systems
