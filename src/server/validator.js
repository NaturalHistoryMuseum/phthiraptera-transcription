class ValidationError extends Error {
  constructor(message, errors, ...args) {
    super([message, ...errors ].join('\n\t'), ...args);
    Object.defineProperty(this, "name", {
      value: this.constructor.name
    });
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

const validator = () => {
  const errors = [];

  const validate = (test, message) => {
    if (typeof test === "function") {
      test = test();
    }

    if (typeof test !== "boolean") {
      throw new TypeError(`test must be a bool or function that returns a bool. Received ${typeof test}.`);
    }

    if (!test) {
      errors.push(message);
    }
  }

  validate.errors = () =>
    (errors.length > 0) && errors

  validate.throw = (message = 'Validation error(s) occured') => {
    const errors = validate.errors();
    if (errors) {
      const e = new ValidationError(message, errors);
      // Remove current stack frame as it's not useful for debugging.
      Error.captureStackTrace(e, validate.throw);
      throw e;
    }
  }

  return validate;
}

module.exports = validator;
