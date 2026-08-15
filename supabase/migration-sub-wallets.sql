-- migration-sub-wallets.sql
-- 1. Add parent_id column referencing the wallet table itself
ALTER TABLE wallet 
ADD COLUMN IF NOT EXISTS parent_id INT REFERENCES wallet(id) ON DELETE CASCADE;

-- 2. Create index on parent_id to speed up lookups
CREATE INDEX IF NOT EXISTS wallet_parent_id_idx ON wallet(parent_id);
