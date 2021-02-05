const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Reviews Endpoints', () => {
    let db;

    const { testUsers, testReviews } = helpers.makeReviewsFixtures();
    const testUser = testUsers[0];

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });

        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe('GET /api/reviews', () => {
        context('When there are no items in the database', () => {
            beforeEach('seed users', () => helpers.seedUsers(db, testUsers));
        });

        it('returns a 200 and an empty list', () => {
            return supertest(app)
                .get('/api/reviews')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200, []);
        });
    });
});