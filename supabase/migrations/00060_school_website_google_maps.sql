-- Let every school store a Google Maps share link on the public website,
-- and set Groupe Scolaire Laricharde's campus map.

UPDATE public.schools
SET
  website_content = COALESCE(website_content, '{}'::jsonb) || jsonb_build_object(
    'map_url', 'https://maps.app.goo.gl/4SPhCrq8ZszwHscg7?g_st=ic'
  ),
  address = COALESCE(
    NULLIF(btrim(address), ''),
    'Groupe Scolaire La Richarde, 0243, Kinshasa'
  ),
  updated_at = now()
WHERE name ILIKE '%laricharde%'
   OR slug ILIKE '%laricharde%';
