import { env } from "../config/env.js";

/**
 * Centralized error middleware.
 * WHAT: The single place every error in the app eventually flows to
 *       (via next(err), or asyncHandler's automatic .catch(next)).
 * WHY: Without this, error formatting logic would be duplicated across
 *      every controller, and it's easy to accidentally leak internal
 *      details (stack traces, raw Mongo errors) to the client.
 * WHERE: Registered LAST in server.js, after all routes.
 *
 * This must be declared with exactly 4 parameters (err, req, res, next)
 * — that's how Express recognizes it as an error handler rather than
 * regular middleware.
 */
export function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong on the server";
  let errors = err.errors || undefined;

  // Mongoose validation errors (e.g. schema min/max/enum failures that
  // slip past express-validator, or come from services calling .create()
  // directly with invalid data).
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 422;
    message = "Validation failed";
    errors = Object.values(err.errors).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message,
    }));
  }

  // MongoDB duplicate key error (e.g. duplicate email, or duplicate
  // student+drive application).
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {}).join(", ") || "field";
    message = `A record with this ${field} already exists`;
  }

  // Malformed ObjectId passed in a route param (e.g. GET /drives/not-an-id).
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Unexpected (uncategorized) errors are the dangerous case: their raw
  // `.message` might contain internal details (connection strings, file
  // paths, driver internals). Only errors we recognized and categorized
  // above (AppError, validation, duplicate key, cast) are safe to show
  // as-is, because we wrote those messages ourselves. Anything still at
  // the default statusCode 500 gets a generic, safe message instead.
  if (statusCode === 500) {
    console.error("[error]", err); // always logged server-side, regardless of environment
    message = "Something went wrong on the server. Please try again later.";
  }

  const response = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
  };

  if (!env.isProduction && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * notFoundMiddleware — catches requests to routes that don't exist at all.
 * WHERE: Registered after all real routes, before errorMiddleware.
 */
export function notFoundMiddleware(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
