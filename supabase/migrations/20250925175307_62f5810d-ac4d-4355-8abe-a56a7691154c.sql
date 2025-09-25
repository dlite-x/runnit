-- Enable RLS on reference tables that we missed
ALTER TABLE public.planets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ship_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;