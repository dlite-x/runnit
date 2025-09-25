import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin Supabase client for scheduled operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Game tick starting...');

    // Get all active players (have colonies)
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select(`
        *,
        colonies:colonies(
          *,
          planet:planets(*),
          buildings:buildings(
            *,
            building_type:building_types(*)
          )
        )
      `);

    if (playersError) {
      throw new Error('Failed to fetch players');
    }

    console.log(`Processing ${players?.length || 0} players`);

    for (const player of players || []) {
      if (!player.colonies?.length) continue;

      let totalCreditGeneration = 0;

      // Process each colony
      for (const colony of player.colonies) {
        // Calculate resource production based on buildings
        let foodProduction = 0;
        let fuelProduction = 0;
        let metalProduction = 0;
        let powerProduction = 0;
        let powerConsumption = 0;
        let researchProduction = 0;

        // Sum up production from all buildings
        for (const building of colony.buildings || []) {
          const buildingType = building.building_type;
          const level = building.level || 1;
          const production = buildingType.base_production * level;

          switch (buildingType.produces_resource) {
            case 'food':
              foodProduction += production;
              break;
            case 'fuel':
              fuelProduction += production;
              break;
            case 'metal':
              metalProduction += production;
              break;
            case 'power':
              powerProduction += production;
              break;
            case 'research':
              researchProduction += production;
              break;
          }

          powerConsumption += buildingType.power_consumption * level;
        }

        // Apply power limitations
        const netPower = powerProduction - powerConsumption;
        const powerMultiplier = Math.max(0.1, Math.min(1, netPower >= 0 ? 1 : (powerProduction / powerConsumption)));

        // Apply power multiplier to resource production
        foodProduction *= powerMultiplier;
        fuelProduction *= powerMultiplier;
        metalProduction *= powerMultiplier;

        // Calculate population-based credit generation
        const populationFactor = colony.population / 100;
        const planetMultiplier = colony.planet.name === 'Earth' ? 1.2 : 1.0;
        const colonyCredits = (populationFactor * 10) * planetMultiplier;
        totalCreditGeneration += colonyCredits;

        // Handle population changes based on food
        const foodConsumption = colony.population * 0.1; // 0.1 food per person per tick
        let newPopulation = colony.population;
        let newFoodStockpile = Math.max(0, colony.food_stockpile + foodProduction - foodConsumption);

        if (colony.food_stockpile + foodProduction >= foodConsumption) {
          // Well fed - chance for population growth
          if (newFoodStockpile > colony.population * 2 && Math.random() < 0.02) {
            newPopulation += 1;
          }
        } else {
          // Starving - population decline
          if (Math.random() < 0.05) {
            newPopulation = Math.max(1, newPopulation - 1);
          }
          newFoodStockpile = 0;
        }

        // Update colony resources and population
        const { error: updateError } = await supabase
          .from('colonies')
          .update({
            population: newPopulation,
            food_stockpile: newFoodStockpile,
            fuel_stockpile: colony.fuel_stockpile + fuelProduction,
            metal_stockpile: colony.metal_stockpile + metalProduction,
          })
          .eq('id', colony.id);

        if (updateError) {
          console.error(`Failed to update colony ${colony.id}:`, updateError);
        }

        console.log(`Colony ${colony.planet.name}: Pop ${newPopulation}, Food +${foodProduction.toFixed(1)}, Fuel +${fuelProduction.toFixed(1)}, Metal +${metalProduction.toFixed(1)}, Credits +${colonyCredits.toFixed(1)}`);
      }

      // Update player credits
      const { error: creditError } = await supabase
        .from('players')
        .update({ credits: player.credits + totalCreditGeneration })
        .eq('id', player.id);

      if (creditError) {
        console.error(`Failed to update credits for player ${player.id}:`, creditError);
      } else {
        console.log(`Player ${player.id}: +${totalCreditGeneration.toFixed(1)} credits`);
      }
    }

    console.log('Game tick completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_players: players?.length || 0,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in game-tick function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});