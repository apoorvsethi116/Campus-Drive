/**
 * asyncHandler — wraps an async Express route handler so any thrown
 * error (or rejected Promise) is automatically forwarded to next(),
 * which hands it to the centralized error middleware.
 *
 * WHAT: A higher-order function: takes a controller function, returns
 *       a new function with the same signature.
 * WHY: Without this, every single controller needs its own
 *      try { ... } catch (err) { next(err) } block. That's repetitive
 *      and easy to forget in one spot, silently swallowing errors.
 * WHERE: Wraps every controller function exported from controllers/.
 */
export function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
