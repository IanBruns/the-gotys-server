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
        {
            id: 3,
            user_name: 'Test-user-3',
            password: 'password',
        },
    ];
}

function makeReviewsFixtures() {
    const testUsers = makeUsersArray();

    return { testUsers }
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

module.exports = {
    makeUsersArray,
    makeReviewsFixtures,
    cleanTables,
    makeAuthHeader,
    seedUsers,
};