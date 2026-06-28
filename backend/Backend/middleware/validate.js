const validator = require("validator");
const mongoose = require("mongoose");

const isEmpty = (v) => v === undefined || v === null || v === "";

module.exports =
  (rules = []) =>
  (req, res, next) => {
    const errors = [];

    for (const rule of rules) {
      if (Array.isArray(rule.anyOf) && rule.anyOf.length) {
        const where = rule.in || "body";
        const values =
          where === "params"
            ? req.params
            : where === "query"
              ? req.query
              : req.body;
        const hasAny = rule.anyOf.some((f) => !isEmpty(values?.[f]));
        if (!hasAny) {
          errors.push(rule.message || `${rule.anyOf.join(" or ")} is required`);
        }
        continue;
      }

      const where = rule.in || "body";
      const field = rule.field;
      const value =
        where === "params"
          ? req.params?.[field]
          : where === "query"
            ? req.query?.[field]
            : req.body?.[field];

      if (rule.required && isEmpty(value)) {
        errors.push(`${field} is required`);
        continue;
      }

      if (!isEmpty(value) && rule.type === "email") {
        if (!validator.isEmail(String(value))) errors.push(`${field} must be a valid email`);
      }

      if (!isEmpty(value) && rule.type === "string") {
        if (typeof value !== "string") errors.push(`${field} must be a string`);
      }

      if (!isEmpty(value) && rule.type === "number") {
        if (Number.isNaN(Number(value))) errors.push(`${field} must be a number`);
      }

      if (!isEmpty(value) && rule.type === "objectId") {
        if (!mongoose.isValidObjectId(String(value))) {
          errors.push(`${field} must be a valid id`);
        }
      }

      if (!isEmpty(value) && typeof rule.minLength === "number") {
        if (String(value).length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} chars`);
        }
      }

      if (!isEmpty(value) && typeof rule.min === "number" && !Number.isNaN(Number(value))) {
        if (Number(value) < rule.min) {
          errors.push(`${field} must be at least ${rule.min}`);
        }
      }

      if (!isEmpty(value) && typeof rule.max === "number" && !Number.isNaN(Number(value))) {
        if (Number(value) > rule.max) {
          errors.push(`${field} must be at most ${rule.max}`);
        }
      }
    }

    if (errors.length) {
      return res.status(422).json({
        success: false,
        errors,
      });
    }

    next();
  };
