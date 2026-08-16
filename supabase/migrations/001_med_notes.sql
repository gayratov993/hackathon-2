-- Adds the optional "how to take it" note to meds.
-- Run this in the Supabase SQL editor on an existing project; schema.sql
-- already contains the column for a fresh install.
--
-- Capped at 200 characters and labelled in the UI as a dosing reminder, not a
-- place for a diagnosis or condition name.

alter table meds add column if not exists notes text;

alter table meds drop constraint if exists meds_notes_len;
alter table meds add constraint meds_notes_len
  check (notes is null or char_length(notes) <= 200);
