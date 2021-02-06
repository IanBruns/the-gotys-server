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
        return res.status(200).json('hi, mom');
    });


module.exports = reviewsRouter;