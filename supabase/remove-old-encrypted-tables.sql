-- Optional clean-up after switching Lilac from passphrase encryption to plain sync.
-- Run this only after your data shows up again on your devices with the new version.
-- The old tables hold the earlier encrypted copies, which the new version no longer reads.
drop table if exists public.lilac_days;
drop table if exists public.lilac_vault;
