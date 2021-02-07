const { expect } = require('chai');
const { expectCt } = require('helmet');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Reviews Endpoints', () => {
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
            beforeEach('seed users', () => {
                return helpers.seedUsers(db, testUsers);
            });

            it('returns a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/reviews')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, []);
            });
        });

        context('When there are reviews in the database', () => {
            beforeEach('Seed users and reviews', () => {
                return helpers.seedReviewsTable(db, testUsers, testReviews);
            });

            it('returns a 200 and the list of the reviews', () => {
                const expectedReviews = testReviews.filter(review => review.assigned_user == testUser.id);

                return supertest(app)
                    .get('/api/reviews')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedReviews);
            });
        });
    });

    describe('POST /api/reviews', () => {
        beforeEach('seed users', () => {
            return helpers.seedUsers(db, testUsers);
        });

        ['game_name', 'score', 'review', 'current_year', 'review_year'].forEach(field => {
            const newReview = {
                game_name: 'post game',
                score: 9,
                review: 'post review',
                current_year: true,
                review_year: 2021
            };

            it(`responds with a 400 missing ${field} if not supplied`, () => {
                delete newReview[field];

                return supertest(app)
                    .post('/api/reviews')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(newReview)
                    .expect(400, {
                        error: { message: `${field} missing in request body` }
                    });
            });
        });

        it('return a 201 and pulls the item in a GET request', () => {
            const newReview = {
                game_name: 'post game',
                score: 9,
                review: 'post review',
                current_year: true,
                review_year: 2021
            };

            return supertest(app)
                .post('/api/reviews')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newReview)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.game_name).to.eql(newReview.game_name);
                    expect(res.body.score).to.eql(newReview.score);
                    expect(res.body.review).to.eql(newReview.review);
                    expect(res.body.current_year).to.eql(newReview.current_year);
                    expect(res.body.review_year).to.eql(newReview.review_year);
                    expect(res.body.assigned_user).to.eql(testUser.id);
                })
                .expect(res => {
                    return db.from('reviews')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.game_name).to.eql(newReview.game_name);
                            expect(row.score).to.eql(newReview.score);
                            expect(row.review).to.eql(newReview.review);
                            expect(row.current_year).to.eql(newReview.current_year);
                            expect(row.review_year).to.eql(newReview.review_year);
                            expect(row.assigned_user).to.eql(testUser.id);
                        });
                });
        });

        it('Sanitizes an XSS attack', () => {
            const { meanReview, expectedReview } = helpers.makeMaliciousReview();

            return supertest(app)
                .post('/api/reviews')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(meanReview)
                .expect(201)
                .expect(res => {
                    expect(res.body.game_name).to.equal(expectedReview.game_name);
                    expect(res.body.review).to.equal(expectedReview.review);
                });
        });
    });

    describe('DELETE /api/reviews/:review_id', () => {
        beforeEach('Seed users and routines', () => {
            return helpers.seedReviewsTable(db, testUsers, testReviews);
        });

        it('Returns a 404 if the review id does not exist', () => {
            const fakeId = 1612;

            return supertest(app)
                .delete(`/api/reviews/${fakeId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(404, {
                    error: { message: `Review not found` }
                });
        });

        it('Returns a 204 and deletes the item', () => {
            const deleteId = 2;
            const expectedResults = testReviews.filter(review => {
                return (
                    review.assigned_user == testUser.id &&
                    review.id != deleteId
                );
            });

            return supertest(app)
                .delete(`/api/reviews/${deleteId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(204)
                .expect(res =>
                    supertest(app)
                        .get('/api/reviews')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(expectedResults)
                );
        });
    });
});