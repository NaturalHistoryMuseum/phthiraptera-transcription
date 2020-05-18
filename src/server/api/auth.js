const jwt = require('jsonwebtoken');
const util = require('util');

class Auth {
  /**
   * Utility for signing and verifying JSON web tokens
   * @param {String} key A private key used to sign and verify tokens
   */
  constructor(key) {
    this._key = key;
  }

  /**
   * Create a signed token containing a given payload
   * @param {Object} payload The payload to stringify and sign
   * @param {Object} options JWT library options object
   * @returns {string}
   */
  sign(payload, options = {}) {
    return util.promisify(jwt.sign).bind(jwt)(payload, this._key, options);
  }

  /**
   * Verify a token and return its payload, or throw an error if invalid
   * @param {string} token The token to parse and verify
   * @param {object} options JWT library options object
   * @returns {object} The payload
   */
  verify(token, options = {}) {
    return util.promisify(jwt.verify).bind(jwt)(token, this._key, options);
  }

  /**
   * Verify whether an error is a JWT error or not
   * @param {Error} e The error to verify
   * @returns {boolean} True if the error is a JWT error
   */
  static isJwtError(e) {
    return e.name === 'JsonWebTokenError';
  }
}

module.exports = Auth;
