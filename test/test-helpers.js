const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'Test-user-1',
            password: 'password',
        },
        {
            id: 2,
            user_name: 'Test-user-2',
            password: 'password',
        },
    ];
}

function makeReviewsArray() {
    return [
        {
            id: 1,
            game_name: 'Game 1',
            score: 9,
            review: 'Review of Game 1',
            current_year: false,
            review_year: 2021,
            assigned_user: 1
        },
        {
            id: 2,
            game_name: 'Game 2',
            score: 2,
            review: 'Review of Game 2',
            current_year: true,
            review_year: 2021,
            assigned_user: 1
        },
        {
            id: 3,
            game_name: 'Game 3',
            score: 10,
            review: 'Review of Game 3',
            current_year: false,
            review_year: 2021,
            assigned_user: 2
        },
        {
            id: 4,
            game_name: 'Game 4',
            score: 5,
            review: 'Review of Game 4',
            current_year: true,
            review_year: 2021,
            assigned_user: 2
        },
    ]
}

function makeReviewsFixtures() {
    const testUsers = makeUsersArray();
    const testReviews = makeReviewsArray();

    return { testUsers, testReviews }
}

function cleanTables(db) {
    return db.transaction(async trx =>
        await trx.raw(
            `TRUNCATE
                reviews,
                users
            `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE reviews_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('reviews_id_seq', 0)`),
                    trx.raw(`SELECT setval('users_id_seq', 0)`),
                ])
            )
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.user_name,
        algorithm: 'HS256'
    });
    return `Bearer ${token}`;
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 10)
    }))

    return db.into('users').insert(preppedUsers)
        .then(() =>
            db.raw(
                `SELECT setval('users_id_seq', ?)`,
                [users[users.length - 1].id],
            ));
}

function seedReviewsTable(db, users, reviews) {
    return db.transaction(async trx => {
        await seedUsers(trx, users);
        await trx.into('reviews').insert(reviews);
        await trx.raw(
            `SELECT setval('reviews_id_seq', ?)`,
            [reviews[reviews.length - 1].id],
        );
    })
}

module.exports = {
    makeUsersArray,
    makeReviewsFixtures,
    cleanTables,
    makeAuthHeader,
    seedUsers,
    seedReviewsTable,
};