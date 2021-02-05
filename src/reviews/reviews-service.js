const xss = require('xss');

const ReviewsService = {
    getUserReviews(db, user_id) {
        return db
            .select('*')
            .where({ assigned_user: user_id })
            .from('reviews');
    },
    sanitizeReview(review) {
        return {
            id: review.id,
            game_name: xss(review.game_name),
            score: review.score,
            review: xss(review.review),
            current_year: review.current_year,
            review_year: review.review_year,
            assigned_user: review.assigned_user
        };
    },
};

module.exports = ReviewsService;