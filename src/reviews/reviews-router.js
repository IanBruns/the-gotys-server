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

        newReview.assigned_user = req.user.id;

        ReviewsService.addReview(req.app.get('db'), newReview)
            .then(review => {
                return res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${review.id}`))
                    .json(ReviewsService.sanitizeReview(review));
            })
            .catch(next);
    });

reviewsRouter.route('/:review_id')
    .all(requireAuth)
    .all(checkValidReview)
    .delete((req, res, next) => {
        ReviewsService.deleteReview(req.app.get('db'), res.review.id)
            .then(numRowsAffected => {
                return res.status(204).end();
            })
    })

async function checkValidReview(req, res, next) {
    try {
        const review = await ReviewsService.getById(
            req.app.get('db'),
            req.user.id,
            parseInt(req.params.review_id)
        )

        if (!review) {
            return res.status(404).json({
                error: { message: `Review not found` }
            })
        }

        res.review = review;
        next();
    } catch (error) {
        next(error);
    }
}
module.exports = reviewsRouter;