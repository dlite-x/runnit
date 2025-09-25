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
    const { colony_id, building_type_id } = await req.json();
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log(`Purchase building request from user ${user.id} for colony ${colony_id}, building type ${building_type_id}`);

    // Get building type details and cost
    const { data: buildingType, error: buildingTypeError } = await supabase
      .from('building_types')
      .select('*')
      .eq('id', building_type_id)
      .single();

    if (buildingTypeError || !buildingType) {
      throw new Error('Building type not found');
    }

    // Get player's current credits
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (playerError || !player) {
      throw new Error('Player not found');
    }

    // Check if player owns the colony
    const { data: colony, error: colonyError } = await supabase
      .from('colonies')
      .select('*')
      .eq('id', colony_id)
      .eq('player_id', player.id)
      .single();

    if (colonyError || !colony) {
      throw new Error('Colony not found or not owned by player');
    }

    // Check existing buildings of this type in the colony
    const { data: existingBuildings, error: existingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('colony_id', colony_id)
      .eq('building_type_id', building_type_id);

    if (existingError) {
      throw new Error('Error checking existing buildings');
    }

    // Calculate cost based on existing buildings (each additional building costs more)
    const buildingCount = existingBuildings?.length || 0;
    const baseCost = buildingType.base_cost;
    const actualCost = baseCost * Math.pow(1.5, buildingCount); // 50% increase per building

    console.log(`Building cost: ${actualCost} (base: ${baseCost}, count: ${buildingCount})`);

    // Check if player has enough credits
    if (player.credits < actualCost) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits',
          required: actualCost,
          current: player.credits
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Begin transaction: deduct credits and add building
    const { error: updateError } = await supabase
      .from('players')
      .update({ credits: player.credits - actualCost })
      .eq('id', player.id);

    if (updateError) {
      throw new Error('Failed to deduct credits');
    }

    // Add the building
    const { data: newBuilding, error: buildingError } = await supabase
      .from('buildings')
      .insert({
        colony_id: colony_id,
        building_type_id: building_type_id,
        level: 1
      })
      .select()
      .single();

    if (buildingError) {
      // Rollback credits if building creation fails
      await supabase
        .from('players')
        .update({ credits: player.credits })
        .eq('id', player.id);
      throw new Error('Failed to create building');
    }

    console.log(`Successfully purchased building: ${buildingType.name} for ${actualCost} credits`);

    return new Response(
      JSON.stringify({
        success: true,
        building: newBuilding,
        cost_paid: actualCost,
        remaining_credits: player.credits - actualCost,
        message: `${buildingType.name} built successfully!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in purchase-building function:', error);
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