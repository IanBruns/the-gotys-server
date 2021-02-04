BEGIN;

TRUNCATE
    reviews,
    games,
    users
    RESTART IDENTITY CASCADE;