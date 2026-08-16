-- Adds Telegram linking to profiles. Run this in the Supabase SQL editor
-- after schema.sql. The bot (bot/index.js) needs the service_role key to
-- read across all users' due doses — that key must never appear in the
-- Vite app's client code, only in the bot's own environment.

alter table profiles add column if not exists telegram_chat_id bigint unique;
alter table profiles add column if not exists telegram_link_code text unique;

-- RLS already covers profiles (see schema.sql's "own profile" policy), so a
-- user can only set/read their own link code and chat id through the anon key.
