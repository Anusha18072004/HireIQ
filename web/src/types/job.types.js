/**
 * @typedef {Object} JobRequest
 * @property {string} title
 * @property {string} description
 * @property {string} requiredSkills
 * @property {string} [location]
 * @property {string} [experienceRequired]
 * @property {string} [salaryRange]
 */

/**
 * @typedef {Object} JobResponse
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} requiredSkills
 * @property {string} location
 * @property {string} experienceRequired
 * @property {string} salaryRange
 * @property {string} recruiterName
 * @property {'ACTIVE' | 'CLOSED'} status
 * @property {string} createdAt
 */

export {};
