import { BadRequestError } from "../errors/customErrors.js";
import { body, validationResult } from "express-validator";

const withValidateValues = (values) => {
  return [
    values,
    (req, res, next) => {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        const errormessage = error.array().map((err) => err.msg);
        return next(new BadRequestError(errormessage));
      }
      next();
    },
  ];
};

export const validatePassword = withValidateValues([
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be five characters long"),
]);
