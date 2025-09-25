-- Create demo user account with proper email verification (temporary insert)
-- Note: This demo user should be created through the auth system normally
-- For now, we'll create a player entry that will be linked when the demo user signs in

-- We'll create some demo data that will be accessible to the demo user
INSERT INTO public.players (user_id, credits) 
SELECT 'c86690d9-34d0-4599-8603-8e712cf997b1'::uuid, 5000
WHERE NOT EXISTS (
  SELECT 1 FROM public.players WHERE user_id = 'c86690d9-34d0-4599-8603-8e712cf997b1'::uuid
);

-- Add some demo colonies for the existing user
INSERT INTO public.colonies (player_id, planet_id, population, food_stockpile, fuel_stockpile, metal_stockpile)
SELECT 
  p.id,
  pl.id,
  CASE 
    WHEN pl.name = 'Earth' THEN 250
    WHEN pl.name = 'Moon' THEN 75
    ELSE 0
  END,
  CASE 
    WHEN pl.name = 'Earth' THEN 500
    WHEN pl.name = 'Moon' THEN 200
    ELSE 100
  END,
  CASE 
    WHEN pl.name = 'Earth' THEN 300
    WHEN pl.name = 'Moon' THEN 150
    ELSE 50
  END,
  CASE 
    WHEN pl.name = 'Earth' THEN 400
    WHEN pl.name = 'Moon' THEN 180
    ELSE 50
  END
FROM public.players p
CROSS JOIN public.planets pl
WHERE p.user_id = 'c86690d9-34d0-4599-8603-8e712cf997b1'::uuid
  AND pl.name IN ('Earth', 'Moon')
  AND NOT EXISTS (
    SELECT 1 FROM public.colonies c 
    WHERE c.player_id = p.id AND c.planet_id = pl.id
  );

-- Add demo missions for the user
INSERT INTO public.player_missions (player_id, mission_id, status)
SELECT p.id, m.id, 'active'
FROM public.players p
CROSS JOIN public.missions m
WHERE p.user_id = 'c86690d9-34d0-4599-8603-8e712cf997b1'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM public.player_missions pm 
    WHERE pm.player_id = p.id AND pm.mission_id = m.id
  );