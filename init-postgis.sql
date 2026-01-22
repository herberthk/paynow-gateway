-- Auto-enable required extensions on container start
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Add this line
CREATE EXTENSION IF NOT EXISTS btree_gin; -- Also useful for compound indexes