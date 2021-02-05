const express = require('express');
const path = require('path');
const ReviewsService = require('./reviews-service');
const { requireAuth } = require('../middleware/api-auth');

const reviewsRouter = express.Router();
const jsonBodyParser = express.json();

reviewsRouter.route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        return res.json([]);
    });


module.exports = reviewsRouter;