export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: Object.fromEntries(
        Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
      ),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate value',
      field: Object.keys(err.keyValue || {})[0],
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation error', details: err.issues });
  }

  res.status(status).json({ error: err.message || 'Internal server error' });
}
