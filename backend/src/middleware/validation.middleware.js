import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

/**
 * validate(validationChains)
 * WHAT: Takes an array of express-validator chains (defined in validators/)
 *       and returns middleware that runs them, then checks the result.
 * WHY: Keeps validation rules declarative and reusable, and keeps
 *      controllers free of manual "if (!email) ..." checks. The frontend
 *      also validates, but the backend never trusts it — this is the
 *      real gate.
 * WHERE: Applied to routes right before the controller, e.g.
 *        router.post("/register", validate(registerValidator), register)
 */
export function validate(validationChains) {
  return async function runValidation(req, res, next) {
    await Promise.all(validationChains.map((chain) => chain.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    const errors = result.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    const error = new AppError("Validation failed", 422);
    error.errors = errors;
    next(error);
  };
}
