BEGIN;

TRUNCATE
    reviews,
    users
    RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, password)
VALUES
('test_man', '$2a$12$Zl/Enp7x915KObPF8ehDbe9kGd3FmE.P1NvNmz01HfgHmZiNXXQc2'),
('sonic', '$2a$12$vxvuspXDF5FhHnTtPc.cse7sWUmasmH8CJNdbk1JyHztzXtuFldnq');

INSERT INTO reviews (game_name, score, review, current_year, review_year, assigned_user)
VALUES
('game 1', 4, 'Review of game 1', true, 2021, 1),
('game 2', 8, 'Review of game 2', false, 2021, 1),
('game 3', 5, 'Review of game 3', false, 2020, 1),
('game 4', 10, 'Review of game 4', false, 2021, 2),
('game 5', 9, 'Review of game 5', true, 2021, 2);

COMMIT;