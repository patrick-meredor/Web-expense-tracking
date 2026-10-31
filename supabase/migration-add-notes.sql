-- migration-add-notes.sql
-- Add notes column to transactions table for additional transaction explanation / details
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS notes TEXT;

