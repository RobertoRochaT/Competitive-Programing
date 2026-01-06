-- Add is_public column to pvp_sessions table
ALTER TABLE pvp_sessions
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Create index for filtering public sessions
CREATE INDEX IF NOT EXISTS idx_pvp_sessions_is_public ON pvp_sessions(is_public, status);

-- Update existing sessions to be private by default
UPDATE pvp_sessions SET is_public = FALSE WHERE is_public IS NULL;
