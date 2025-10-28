import React, { useState } from 'react';
import { Home, Package, ArrowUp, ArrowDown, Flag, Fuel, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Ship {
  name: string;
  type: 'colony' | 'cargo';
  location: string;
  destination?: string;
  departureTime?: number;
  totalTravelTime?: number;
  fuel?: number;
  cargo?: { metal: number; fuel: number; food: number };
}

interface FlightControlPanelProps {
  ships: Ship[];
  onUpdateShip: (shipName: string, updates: Partial<Ship>) => void;
  onLaunchShip: (shipName: string) => void;
  onColonizePlanet: (shipName: string, planet: string) => void;
  availableResources: { fuel: number; metal: number; food: number };
  onSpendResource: (resourceType: 'fuel' | 'metal' | 'food', amount: number) => boolean;
}

// Fuel requirements from Earth (origin perspective)
const FUEL_REQUIREMENTS: Record<string, Record<string, number>> = {
  earth: { moon: 7, mars: 12, eml1: 5 },
  moon: { earth: 7, mars: 6, eml1: 2 },
  mars: { earth: 12, moon: 6, eml1: 2 },
  eml1: { earth: 5, moon: 2, mars: 2 }
};

const calculateTravelTimeSeconds = (origin: string, destination: string): number => {
  const times: Record<string, Record<string, number>> = {
    earth: { moon: 20, mars: 60, eml1: 12 },
    moon: { earth: 20, mars: 50, eml1: 8 },
    mars: { earth: 60, moon: 50, eml1: 40 },
    eml1: { earth: 12, moon: 8, mars: 40 },
  };
  return times[origin]?.[destination] || 30;
};

const FlightControlPanel: React.FC<FlightControlPanelProps> = ({
  ships,
  onUpdateShip,
  onLaunchShip,
  onColonizePlanet,
  availableResources,
  onSpendResource,
}) => {
  const [cargoDialogOpen, setCargoDialogOpen] = useState(false);
  const [selectedShipForCargo, setSelectedShipForCargo] = useState<Ship | null>(null);
  const [cargoInputs, setCargoInputs] = useState({ food: 0, fuel: 0, metal: 0 });

  const handleDestinationChange = (shipName: string, destination: string) => {
    onUpdateShip(shipName, { destination });
  };

  const handleTopUpFuel = (ship: Ship) => {
    if (!ship.destination) return;
    
    const origin = ship.location === 'traveling' ? 'earth' : ship.location;
    const requiredFuel = FUEL_REQUIREMENTS[origin]?.[ship.destination] || 0;
    const currentFuel = ship.fuel || 0;
    const fuelNeeded = Math.max(0, requiredFuel - currentFuel);
    const fuelToAdd = Math.min(fuelNeeded, availableResources.fuel);
    
    if (fuelToAdd > 0 && onSpendResource('fuel', fuelToAdd)) {
      onUpdateShip(ship.name, { fuel: currentFuel + fuelToAdd });
    }
  };

  const handleOpenCargoDialog = (ship: Ship) => {
    setSelectedShipForCargo(ship);
    setCargoInputs({ food: 0, fuel: 0, metal: 0 });
    setCargoDialogOpen(true);
  };

  const handleLoadCargo = () => {
    if (!selectedShipForCargo) return;

    const maxCapacity = selectedShipForCargo.type === 'colony' ? 12 : 15;
    const currentCargo = selectedShipForCargo.cargo || { metal: 0, fuel: 0, food: 0 };
    const currentTotal = currentCargo.metal + currentCargo.fuel + currentCargo.food;
    const requestedTotal = cargoInputs.metal + cargoInputs.fuel + cargoInputs.food;

    if (currentTotal + requestedTotal > maxCapacity) {
      alert(`Cargo capacity exceeded! Max: ${maxCapacity}, Current: ${currentTotal}, Requested: ${requestedTotal}`);
      return;
    }

    // Check and spend resources
    if (cargoInputs.food > availableResources.food || 
        cargoInputs.fuel > availableResources.fuel || 
        cargoInputs.metal > availableResources.metal) {
      alert('Insufficient resources!');
      return;
    }

    if (onSpendResource('food', cargoInputs.food) &&
        onSpendResource('fuel', cargoInputs.fuel) &&
        onSpendResource('metal', cargoInputs.metal)) {
      onUpdateShip(selectedShipForCargo.name, {
        cargo: {
          metal: currentCargo.metal + cargoInputs.metal,
          fuel: currentCargo.fuel + cargoInputs.fuel,
          food: currentCargo.food + cargoInputs.food,
        }
      });
      setCargoDialogOpen(false);
    }
  };

  const handleOffloadCargo = (ship: Ship) => {
    if (!ship.cargo) return;
    
    // Add cargo resources to planet
    const stored = localStorage.getItem('planet_resources');
    const allPlanets = stored ? JSON.parse(stored) : {};
    const planetKey = ship.location.charAt(0).toUpperCase() + ship.location.slice(1);
    const currentResources = allPlanets[planetKey] || { food: 0, fuel: 0, metal: 0, power: 0 };
    
    allPlanets[planetKey] = {
      ...currentResources,
      food: currentResources.food + (ship.cargo.food || 0),
      fuel: currentResources.fuel + (ship.cargo.fuel || 0),
      metal: currentResources.metal + (ship.cargo.metal || 0),
    };
    
    localStorage.setItem('planet_resources', JSON.stringify(allPlanets));
    console.log(`Added cargo to ${planetKey}:`, ship.cargo);
    
    // Reset ship's cargo
    onUpdateShip(ship.name, {
      cargo: { metal: 0, fuel: 0, food: 0 }
    });
  };

  const getETA = (ship: Ship): string => {
    if (ship.location !== 'traveling' || !ship.departureTime || !ship.totalTravelTime) {
      return ship.location === 'traveling' ? 'Calculating...' : '-';
    }

    const elapsed = (Date.now() - ship.departureTime) / 1000;
    const remaining = Math.max(0, ship.totalTravelTime - elapsed);
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getStatus = (ship: Ship): string => {
    if (ship.location === 'traveling') return 'In Transit';
    if (ship.location === 'preparing') return 'Preparing';
    return 'Docked';
  };

  const canLaunch = (ship: Ship): boolean => {
    if (!ship.destination) return false;
    const origin = ship.location === 'traveling' ? 'earth' : ship.location;
    const requiredFuel = FUEL_REQUIREMENTS[origin]?.[ship.destination] || 0;
    const currentFuel = ship.fuel || 0;
    return currentFuel >= requiredFuel && ship.location !== 'traveling';
  };

  return (
    <>
      <div className="w-full bg-background/95 backdrop-blur-sm border rounded-lg p-2">
        <h2 className="text-lg font-bold text-foreground mb-2 px-2">Flight Control (Dev)</h2>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 px-1"></TableHead>
                <TableHead className="px-2">Name</TableHead>
                <TableHead className="px-2">Dest</TableHead>
                <TableHead className="px-2">Fuel</TableHead>
                <TableHead className="px-2">Cargo</TableHead>
                <TableHead className="px-2">Status</TableHead>
                <TableHead className="px-2">ETA</TableHead>
                <TableHead className="text-right px-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ships.map((ship) => {
                const origin = ship.location === 'traveling' ? 'earth' : ship.location;
                const requiredFuel = ship.destination ? (FUEL_REQUIREMENTS[origin]?.[ship.destination] || 0) : 0;
                const currentFuel = ship.fuel || 0;
                const cargo = ship.cargo || { metal: 0, fuel: 0, food: 0 };
                const isArrived = ship.location !== 'traveling' && ship.location !== 'earth' && ship.location !== 'preparing';

                return (
                  <TableRow key={ship.name}>
                    <TableCell className="px-1">
                      {ship.type === 'colony' ? (
                        <Home className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Package className="w-4 h-4 text-orange-400" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-sm px-2">{ship.name}</TableCell>
                    <TableCell className="px-2">
                      {ship.location === 'traveling' ? (
                        <span className="text-xs text-muted-foreground">{ship.destination}</span>
                      ) : (
                        <Select
                          value={ship.destination || ''}
                          onValueChange={(value) => handleDestinationChange(ship.name, value)}
                        >
                          <SelectTrigger className="w-20 h-7 text-xs">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="moon">Moon</SelectItem>
                            <SelectItem value="mars">Mars</SelectItem>
                            <SelectItem value="eml1">EML1</SelectItem>
                            {ship.location !== 'earth' && <SelectItem value="earth">Earth</SelectItem>}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="px-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">
                          {currentFuel}/{requiredFuel || '-'}
                        </span>
                        {ship.destination && ship.location !== 'traveling' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => handleTopUpFuel(ship)}
                            disabled={currentFuel >= requiredFuel || availableResources.fuel === 0}
                          >
                            <Fuel className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">
                          {cargo.food}/{cargo.fuel}/{cargo.metal}
                        </span>
                        {ship.location !== 'traveling' && (
                          <div className="flex gap-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => handleOpenCargoDialog(ship)}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => handleOffloadCargo(ship)}
                              disabled={cargo.food === 0 && cargo.fuel === 0 && cargo.metal === 0}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-2">
                      <span className="text-xs">{getStatus(ship)}</span>
                    </TableCell>
                    <TableCell className="px-2">
                      <span className="text-xs">{getETA(ship)}</span>
                    </TableCell>
                    <TableCell className="text-right px-2">
                      {ship.type === 'colony' && isArrived ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => onColonizePlanet(ship.name, ship.location)}
                        >
                          <Flag className="w-3.5 h-3.5 text-green-400" />
                        </Button>
                      ) : ship.location !== 'traveling' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => onLaunchShip(ship.name)}
                          disabled={!canLaunch(ship)}
                        >
                          <ArrowRight className={`w-4 h-4 ${canLaunch(ship) ? 'text-green-400' : 'text-muted-foreground'}`} />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Cargo Loading Dialog */}
      <Dialog open={cargoDialogOpen} onOpenChange={setCargoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Cargo - {selectedShipForCargo?.name}</DialogTitle>
            <DialogDescription>
              Max capacity: {selectedShipForCargo?.type === 'colony' ? 12 : 15} units total
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="food">Food</Label>
              <Input
                id="food"
                type="number"
                min="0"
                max={availableResources.food}
                value={cargoInputs.food}
                onChange={(e) => setCargoInputs({ ...cargoInputs, food: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">Available: {availableResources.food}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fuel">Fuel</Label>
              <Input
                id="fuel"
                type="number"
                min="0"
                max={availableResources.fuel}
                value={cargoInputs.fuel}
                onChange={(e) => setCargoInputs({ ...cargoInputs, fuel: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">Available: {availableResources.fuel}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metal">Metal</Label>
              <Input
                id="metal"
                type="number"
                min="0"
                max={availableResources.metal}
                value={cargoInputs.metal}
                onChange={(e) => setCargoInputs({ ...cargoInputs, metal: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">Available: {availableResources.metal}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCargoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoadCargo}>
              Load Cargo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlightControlPanel;
