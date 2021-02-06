const express = require('express');
const path = require('path');
const ReviewsService = require('./reviews-service');
const { requireAuth } = require('../middleware/api-auth');

const reviewsRouter = express.Router();
const jsonBodyParser = express.json();

reviewsRouter.route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        ReviewsService.getUserReviews(req.app.get('db'), req.user.id)
            .then(reviews => {
                return res.json(reviews.map(review =>
                    ReviewsService.sanitizeReview(review)));
            })
            .catch(next);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { game_name, score, review, current_year, review_year } = req.body;
        const newReview = { game_name, score, review, current_year, review_year };

        for (const field of ['game_name', 'score', 'review', 'current_year', 'review_year']) {
            if (!newReview[field]) {
                return res.status(400).send({
                    error: { message: `${field} missing in request body` }
                });
            }
        }
    });


module.exports = reviewsRouter;