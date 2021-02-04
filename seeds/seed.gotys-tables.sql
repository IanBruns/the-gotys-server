BEGIN;

TRUNCATE
    reviews,
    games,
    users
    RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, password)
VALUES
('test_man', '$2a$12$Zl/Enp7x915KObPF8ehDbe9kGd3FmE.P1NvNmz01HfgHmZiNXXQc2'),
('sonic', '$2a$12$vxvuspXDF5FhHnTtPc.cse7sWUmasmH8CJNdbk1JyHztzXtuFldnq');

INSERT INTO games (game_name, assigned_user)
VALUES
('game 1', 1),
('game 2', 1),
('game 3', 2),
('game 4', 2);

INSERT INTO reviews (score, review, current_year, assigned_game)
VALUES
(4, 'Review of game 1', true, 1),
(8, 'Review of game 2', false, 1),
(10, 'Review of game 3', false, 1),
(9, 'Review of game 4', true, 1);

COMMIT;