/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} fullName
 * @property {string} email
 * @property {string} password
 * @property {'CANDIDATE' | 'RECRUITER'} role
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {string} email
 * @property {string} role
 * @property {string} fullName
 */

export {};
