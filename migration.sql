-- Drop benchmark_results table entirely
DROP TABLE IF EXISTS benchmark_results CASCADE;

-- Remove ArcFace descriptor column from known_faces table
ALTER TABLE known_faces DROP COLUMN IF EXISTS arcface_descriptor;

-- Remove comparison-related columns from attendance table
ALTER TABLE attendance DROP COLUMN IF EXISTS similarity;
ALTER TABLE attendance DROP COLUMN IF EXISTS latency_ms;
ALTER TABLE attendance DROP COLUMN IF EXISTS model;