-- Core player and game state tables
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credits BIGINT NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Planets/celestial bodies
CREATE TABLE public.planets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  planet_type TEXT NOT NULL DEFAULT 'terrestrial',
  base_temperature INTEGER NOT NULL DEFAULT 20,
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  position_z REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Player colonies on planets
CREATE TABLE public.colonies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  planet_id UUID NOT NULL REFERENCES public.planets(id) ON DELETE CASCADE,
  population INTEGER NOT NULL DEFAULT 0,
  food_stockpile INTEGER NOT NULL DEFAULT 100,
  fuel_stockpile INTEGER NOT NULL DEFAULT 50,
  metal_stockpile INTEGER NOT NULL DEFAULT 50,
  colonized_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, planet_id)
);

-- Building types reference
CREATE TABLE public.building_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_cost INTEGER NOT NULL DEFAULT 100,
  produces_resource TEXT, -- 'food', 'fuel', 'metal', 'power', 'research'
  base_production INTEGER NOT NULL DEFAULT 1,
  power_consumption INTEGER NOT NULL DEFAULT 0
);

-- Buildings on colonies
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colony_id UUID NOT NULL REFERENCES public.colonies(id) ON DELETE CASCADE,
  building_type_id UUID NOT NULL REFERENCES public.building_types(id),
  level INTEGER NOT NULL DEFAULT 1,
  built_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research technologies
CREATE TABLE public.research_technologies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  research_cost INTEGER NOT NULL,
  prerequisite_tech_id UUID REFERENCES public.research_technologies(id)
);

-- Player research progress
CREATE TABLE public.research_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES public.research_technologies(id),
  allocation_percentage INTEGER NOT NULL DEFAULT 0 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  progress_points INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(player_id, technology_id)
);

-- Ship types reference
CREATE TABLE public.ship_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  build_cost INTEGER NOT NULL DEFAULT 200,
  fuel_capacity INTEGER NOT NULL DEFAULT 100,
  cargo_capacity INTEGER NOT NULL DEFAULT 0,
  passenger_capacity INTEGER NOT NULL DEFAULT 0,
  ship_class TEXT NOT NULL DEFAULT 'cargo' -- 'cargo', 'colony', 'station'
);

-- Player ships
CREATE TABLE public.ships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  ship_type_id UUID NOT NULL REFERENCES public.ship_types(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'building', -- 'building', 'ready', 'in_transit', 'orbiting', 'deployed'
  location_planet_id UUID REFERENCES public.planets(id),
  destination_planet_id UUID REFERENCES public.planets(id),
  fuel_current INTEGER NOT NULL DEFAULT 0,
  cargo_food INTEGER NOT NULL DEFAULT 0,
  cargo_metal INTEGER NOT NULL DEFAULT 0,
  cargo_fuel INTEGER NOT NULL DEFAULT 0,
  passengers INTEGER NOT NULL DEFAULT 0,
  built_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  arrival_time TIMESTAMP WITH TIME ZONE
);

-- Missions
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  objective_type TEXT NOT NULL, -- 'colonize', 'population', 'research', 'building'
  target_planet_id UUID REFERENCES public.planets(id),
  target_value INTEGER, -- population target, building count, etc.
  reward_credits INTEGER NOT NULL DEFAULT 0,
  time_limit_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Player mission progress
CREATE TABLE public.player_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(player_id, mission_id)
);

-- Enable RLS on all tables
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players
CREATE POLICY "Users can view their own player data" ON public.players FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own player data" ON public.players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own player data" ON public.players FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for colonies
CREATE POLICY "Users can manage their own colonies" ON public.colonies FOR ALL USING (
  player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
);

-- RLS Policies for buildings
CREATE POLICY "Users can manage buildings in their colonies" ON public.buildings FOR ALL USING (
  colony_id IN (
    SELECT c.id FROM public.colonies c 
    JOIN public.players p ON c.player_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for research
CREATE POLICY "Users can manage their own research" ON public.research_progress FOR ALL USING (
  player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
);

-- RLS Policies for ships
CREATE POLICY "Users can manage their own ships" ON public.ships FOR ALL USING (
  player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
);

-- RLS Policies for missions
CREATE POLICY "Users can manage their own mission progress" ON public.player_missions FOR ALL USING (
  player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
);

-- Reference tables are readable by all authenticated users
CREATE POLICY "Everyone can read planets" ON public.planets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can read building types" ON public.building_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can read research technologies" ON public.research_technologies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can read ship types" ON public.ship_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can read missions" ON public.missions FOR SELECT TO authenticated USING (true);

-- Insert default planets
INSERT INTO public.planets (name, planet_type, base_temperature, position_x, position_y, position_z) VALUES
('Earth', 'terrestrial', 15, 0, 0, 0),
('Moon', 'moon', -20, 1, 0, 0),
('Mars', 'terrestrial', -65, 5, 0, 0);

-- Insert default building types
INSERT INTO public.building_types (name, base_cost, produces_resource, base_production, power_consumption) VALUES
('Farm', 100, 'food', 2, 1),
('Mine', 150, 'metal', 1, 2),
('Fuel Refinery', 200, 'fuel', 1, 2),
('Power Plant', 120, 'power', 3, 0),
('Research Lab', 300, 'research', 1, 1);

-- Insert default ship types
INSERT INTO public.ship_types (name, build_cost, fuel_capacity, cargo_capacity, passenger_capacity, ship_class) VALUES
('Cargo Ship', 500, 200, 100, 0, 'cargo'),
('Colony Ship', 800, 300, 6, 50, 'colony'),
('Space Station', 1200, 0, 50, 20, 'station');

-- Insert default research technologies
INSERT INTO public.research_technologies (name, description, research_cost) VALUES
('Advanced Agriculture', 'Improves food production efficiency', 50),
('Mining Technology', 'Enhances metal extraction capabilities', 75),
('Fuel Systems', 'Increases fuel production and storage', 60),
('Power Generation', 'Improves energy production systems', 80);

-- Insert sample missions
INSERT INTO public.missions (name, description, objective_type, target_planet_id, target_value, reward_credits, time_limit_hours) VALUES
('Lunar Colony', 'Establish a colony on the Moon with 50 people', 'population', (SELECT id FROM public.planets WHERE name = 'Moon'), 50, 5000, 168),
('Mars Settlement', 'Build a colony on Mars with 100 people', 'population', (SELECT id FROM public.planets WHERE name = 'Mars'), 100, 15000, 336);

-- Update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update trigger for players
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();