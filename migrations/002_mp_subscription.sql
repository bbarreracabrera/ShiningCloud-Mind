ALTER TABLE saas_subscriptions
  ADD COLUMN IF NOT EXISTS mp_subscription_id text,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE saas_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "psicólogo ve su suscripción" ON saas_subscriptions
  FOR ALL USING (auth.uid() = user_id);
