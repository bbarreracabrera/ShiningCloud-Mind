ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS cancel_token text;
