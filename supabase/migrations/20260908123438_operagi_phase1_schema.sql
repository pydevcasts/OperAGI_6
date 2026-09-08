/*
# OperAGI Phase 1 — Core Schema

## Purpose
Creates the complete database schema for OperAGI Phase 1: an AI-powered influencer assistant
that helps users generate content (captions, hashtags, SEO) for Instagram, Twitter/X, and YouTube,
schedule posts, and view analytics — all from a single dashboard.

## New Tables
1. social_accounts — connected social media accounts per user
2. posts — content ideas/drafts for each platform
3. generated_contents — AI-generated content (caption, hashtags, SEO)
4. subscription_plans — pricing tiers (Starter, Pro, Agency)
5. payments — payment records per user

## Security
- All tables have RLS enabled with owner-scoped policies using auth.uid().
- subscription_plans: public read, no client write.
- payments: owner-scoped read/insert only.
*/

-- 1. social_accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('instagram', 'twitter', 'youtube')),
  provider_account_id text,
  provider_username text,
  provider_avatar_url text,
  access_token text,
  is_active boolean NOT NULL DEFAULT true,
  connected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_social_accounts" ON social_accounts;
CREATE POLICY "select_own_social_accounts" ON social_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_social_accounts" ON social_accounts;
CREATE POLICY "insert_own_social_accounts" ON social_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_social_accounts" ON social_accounts;
CREATE POLICY "update_own_social_accounts" ON social_accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_social_accounts" ON social_accounts;
CREATE POLICY "delete_own_social_accounts" ON social_accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 2. posts
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  social_account_id uuid REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform text CHECK (platform IN ('instagram', 'twitter', 'youtube')),
  content text NOT NULL,
  visual_idea text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating_content', 'content_generated', 'ready_to_publish', 'published', 'failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_posts" ON posts;
CREATE POLICY "select_own_posts" ON posts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_posts" ON posts;
CREATE POLICY "insert_own_posts" ON posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_posts" ON posts;
CREATE POLICY "update_own_posts" ON posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_posts" ON posts;
CREATE POLICY "delete_own_posts" ON posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- 3. generated_contents
CREATE TABLE IF NOT EXISTS generated_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
  content_type text NOT NULL DEFAULT 'text_and_hashtags',
  generated_text text NOT NULL,
  suggested_hashtags text,
  suggested_publish_time timestamptz,
  seo_title text,
  seo_description text,
  seo_tags text,
  thread_tweets jsonb,
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE generated_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_generated_contents" ON generated_contents;
CREATE POLICY "select_own_generated_contents" ON generated_contents FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = generated_contents.post_id AND posts.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_generated_contents" ON generated_contents;
CREATE POLICY "insert_own_generated_contents" ON generated_contents FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM posts WHERE posts.id = generated_contents.post_id AND posts.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_generated_contents" ON generated_contents;
CREATE POLICY "update_own_generated_contents" ON generated_contents FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = generated_contents.post_id AND posts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM posts WHERE posts.id = generated_contents.post_id AND posts.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_generated_contents" ON generated_contents;
CREATE POLICY "delete_own_generated_contents" ON generated_contents FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = generated_contents.post_id AND posts.user_id = auth.uid()));

-- 4. subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration_days int NOT NULL DEFAULT 30,
  max_platforms int NOT NULL DEFAULT 2,
  max_posts int NOT NULL DEFAULT 30,
  features jsonb NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_subscription_plans" ON subscription_plans;
CREATE POLICY "read_subscription_plans" ON subscription_plans FOR SELECT
  TO anon, authenticated USING (true);

-- 5. payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id),
  amount numeric(10,2) NOT NULL,
  paid_at timestamptz DEFAULT now(),
  transaction_id text UNIQUE
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed subscription plans
INSERT INTO subscription_plans (name, price, duration_days, max_platforms, max_posts, features) VALUES
  ('Starter', 19.00, 30, 2, 30, '["2 platforms","30 posts/month","Caption generation","Hashtag suggestions"]'::jsonb),
  ('Pro', 49.00, 30, 3, 150, '["3 platforms","150 posts/month","Scheduling","Analytics","Thread generation"]'::jsonb),
  ('Agency', 99.00, 30, 5, 999999, '["5 accounts","Unlimited posts","API access","White-label reports"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  max_platforms = EXCLUDED.max_platforms,
  max_posts = EXCLUDED.max_posts,
  features = EXCLUDED.features;
