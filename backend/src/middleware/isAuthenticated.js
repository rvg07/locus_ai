function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.status(401).json({ message: 'Not authorized user.' });
    }
}

module.exports = isAuthenticated;