# Recurring Issues & Solutions

This document tracks recurring issues that have occurred in the project and their solutions, to prevent the need for full project restoration.

---

## Issue #1: 3D Visualization Panning Glitch (2025-10-27)

### Symptoms
- Panning (left/right, up/down) in the 3D visualization becomes "jumpy"
- View reverts back to the initial position while panning
- Unable to pan properly - controls feel unstable

### Root Cause
The resource management hooks (`usePlanetResources`, `useBuildingLevels`) update every second to increment resources. These frequent updates cause the entire `EarthVisualization` component to re-render, which disrupts the `OrbitControls` component's internal state.

### Solution
Remove the dynamic `target` prop from the `OrbitControls` component in `src/components/EarthVisualization.tsx`.

**What was changed:**
```tsx
// BEFORE (Problematic)
<OrbitControls
  key="main-orbit-controls"
  target={flyMode ? new Vector3(...shipPosition) : new Vector3(...cameraTarget)}
  enablePan={true}
  // ... other props
/>

// AFTER (Fixed)
<OrbitControls
  enablePan={true}
  enableZoom={true}
  enableRotate={true}
  // ... other props (no target prop)
  makeDefault
/>
```

**Why this works:**
- The `target` prop was creating a new `Vector3` instance on every render
- Without the dynamic target, OrbitControls maintains its own stable state
- The controls no longer reset during the one-second resource update cycles

### Prevention
If re-implementing fly mode or camera targeting in the future, use refs or memoization to avoid creating new Vector3 instances on every render.

---

## Issue #2: Frigate Ship Teleportation (2025-10-29)

### Symptoms
- Frigates "teleport" or jump to incorrect positions when space stations are deployed
- Ship positions become confused and swap unexpectedly
- Ships appear at wrong locations after station deployment

### Root Cause
Ships were being rendered using array index as the React key (`key={index}`). When a space station was deployed, it was removed from the `builtSpheres` array, causing all subsequent ships to shift their array indices. React's reconciliation then incorrectly matched ships to different components, causing position/state confusion.

**Location:** `src/components/EarthVisualization.tsx` around line 5300

### Solution
Change the ship rendering key from array index to ship name (unique identifier).

**What was changed:**
```tsx
// BEFORE (Problematic)
{builtSpheres.map((ship, index) => (
  <StaticShip 
    key={index}  // ❌ Index changes when array is modified
    ship={ship}
    // ... other props
  />
))}

// AFTER (Fixed)
{builtSpheres.map((ship, index) => (
  <StaticShip 
    key={ship.name}  // ✅ Name is stable and unique
    ship={ship}
    // ... other props
  />
))}
```

**Why this works:**
- Ship names are unique and stable identifiers
- React can correctly track component identity across renders
- Removing stations from the array no longer affects ship component identity
- Each ship maintains its correct state and position

### Prevention
Always use stable, unique identifiers as React keys when rendering lists. Never use array indices for lists that can be reordered, filtered, or have items removed.

---

## Issue #3: Frigate Combat Speed and Shooting Issues (2025-10-29)

### Symptoms
- Frigates moved too slowly when hunting pirates
- Shooting mechanics felt sluggish or unresponsive
- Combat engagement timing was off

### Root Cause
Multiple factors contributed to combat responsiveness issues:
1. **Speed**: Initial `baseSpeed` was too low (0.02) for frigates to catch moving pirates
2. **Fire Rate**: Shooting cooldown timing needed adjustment
3. **State Management**: Shot timing state (`lastShotTime`) wasn't properly synchronized with projectile firing

### Solution
Adjusted frigate combat parameters and improved state synchronization:

**Speed Adjustment:**
```tsx
// In src/components/EarthVisualization.tsx, StaticShip component
const baseSpeed = ship.type === 'frigate' ? 0.021 : 0.015;  // Frigates slightly faster
```

**Fire Rate Management:**
- Ensured `lastShotTime` updates immediately when projectile fires (not on hit)
- Maintained 2-second cooldown between shots
- Projectile fire handler in `handleProjectileFire` updates state synchronously

**Why this works:**
- Faster movement speed allows frigates to close distance and maintain engagement
- Immediate state updates prevent double-firing bugs
- Consistent cooldown timing makes combat predictable

### Key Combat Parameters
- **Frigate Hunting Speed**: 0.021 units
- **Fire Rate**: 2 seconds between shots
- **Hits to Destroy Pirate**: 5 hits
- **Projectile Travel Time**: ~1 second

### Prevention
When adjusting combat mechanics:
1. Test speed values against target movement patterns
2. Ensure state updates happen synchronously with visual effects
3. Keep fire rate consistent with projectile travel time
4. Balance speed/damage/rate-of-fire as a system, not individually

---

## Issue #4: Frigate Unable to Launch After Combat (2025-10-29)

### Symptoms
- After completing a combat mission and destroying all pirates, frigates couldn't be launched to new destinations
- Frigates appeared "stuck" at their combat location
- Launch option was not available even after recalling frigate

### Root Cause
When frigates returned home after combat, the `handleFrigateReturnedHome` function was clearing too much state, including the `isDeployed` flag. This prevented the launch logic from recognizing the frigate as a valid ship that could travel.

**Location:** `src/components/EarthVisualization.tsx`, `handleFrigateReturnedHome` function (around line 3602)

### Solution
Preserve the `isDeployed` and `deployedLocation` state when frigate returns home, only clearing combat-specific state.

**What was changed:**
```tsx
// BEFORE (Too aggressive)
const handleFrigateReturnedHome = (frigateId: string) => {
  setBuiltSpheres(prev => prev.map(s =>
    s.name === frigateId ? {
      ...s,
      isReturningHome: false,
      isPatrolling: false,
      targetPirateId: undefined,
      lastShotTime: undefined
      // Missing: isDeployed and other states were lost
    } : s
  ));
};

// AFTER (Selective clearing)
const handleFrigateReturnedHome = (frigateId: string) => {
  setBuiltSpheres(prev => prev.map(s =>
    s.name === frigateId ? {
      ...s,
      isReturningHome: false,
      isPatrolling: false,
      isAttacking: false,        // ✅ Clear combat state
      targetPirateId: undefined,
      lastShotTime: undefined
      // ✅ Keep isDeployed and deployedLocation intact
    } : s
  ));
};
```

Additionally, the launch handler was updated to explicitly clear deployment state when launching:
```tsx
// In launch handler
if (ship.isDeployed) {
  updatedShip.isDeployed = false;
  updatedShip.deployedLocation = undefined;
  updatedShip.isAttacking = false;
  updatedShip.isReturningHome = false;
  // ... clear all combat/deployment state
}
```

**Why this works:**
- Frigates maintain their deployed status after combat, allowing them to be recalled
- Launch handler explicitly clears deployment state, properly transitioning frigate to travel mode
- Combat state (attacking, returning home) is cleared separately from deployment state
- Creates clear state lifecycle: Deployed → Combat → Returned → Recalled → Launched

### Frigate State Lifecycle
1. **Built**: Created at Earth, ready to launch
2. **Launched**: Traveling to destination
3. **Arrived**: At destination, can be deployed
4. **Deployed**: Auto-hunting mode active
5. **Attacking**: Engaging pirate targets
6. **Returning Home**: Combat complete, moving to home position
7. **Returned**: At home position, ready to recall
8. **Recalled**: Deployment cleared, ready to launch again

### Prevention
When managing complex state machines (like ship/combat states):
1. Document the full state lifecycle
2. Clear only the relevant state for each transition
3. Preserve states needed for the next phase
4. Explicitly handle state transitions at each stage
5. Test the complete lifecycle: build → launch → deploy → combat → return → recall → relaunch

---

*Add new issues below as they occur*

