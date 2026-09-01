/**
 * Small helpers to keep every success response shaped the same way:
 * { success: true, message, data }
 *
 * Error responses are shaped by the error middleware instead
 * (see middleware/error.middleware.js), since they need slightly
 * different fields (errors[] for validation failures, etc).
 */
export function sendSuccess(res, { statusCode = 200, message = "Success", data = null } = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}
