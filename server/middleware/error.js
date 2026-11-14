export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  if (err.code === 11000) {
    status = 409;
    message = 'A user with this email already exists.';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  } else if (err.name === 'CastError') {
    status = 404;
    message = 'Record not found.';
  }
  if (process.env.NODE_ENV !== 'production' && status === 500) console.error(err);
  res.status(status).json({ message });
};
