/**
 * AppError — a normal Error with an attached HTTP status code.
 *
 * WHAT: A small subclass of the built-in Error class.
 * WHY: Controllers/services need a way to say "this failed, and here's
 *      the HTTP status that should go with it" without the error
 *      middleware having to guess. Throwing `new AppError("message", 404)`
 *      anywhere in the app is caught by the centralized error middleware
 *      (see middleware/error.middleware.js) and turned into a consistent
 *      JSON response.
 * WHERE: Used throughout services/controllers whenever something is a
 *        "known" failure (bad input, not found, unauthorized) rather than
 *        an unexpected bug.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from real bugs
    Error.captureStackTrace(this, this.constructor);
  }
}
