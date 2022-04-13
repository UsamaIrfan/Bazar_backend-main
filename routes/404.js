const NotFound = (req, res, next) => {
    const error = new Error('API Not Found');
	error.status = 404;
	next(error);
}

module.exports = NotFound;