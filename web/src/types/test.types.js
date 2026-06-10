/**
 * @typedef {Object} TestQuestion
 * @property {number} questionNumber
 * @property {string} question
 * @property {string} optionA
 * @property {string} optionB
 * @property {string} optionC
 * @property {string} optionD
 */

/**
 * @typedef {Object} StartTestResponse
 * @property {number} attemptId
 * @property {number} attemptNumber
 * @property {TestQuestion[]} questions
 */

/**
 * @typedef {Object} SubmitTestRequest
 * @property {Object.<string, string>} answers - mapping of question number (as string key) to choice ("A" | "B" | "C" | "D")
 */

/**
 * @typedef {Object} TestStatusResponse
 * @property {boolean} canAttempt
 * @property {string} [message] - reason if cannot attempt
 * @property {number} [lastScore]
 * @property {string} [nextAllowedAt]
 * @property {string} [jobTitle]
 * @property {string} [weakTopics]
 * @property {string} [strengths]
 * @property {string} [improvementSuggestions]
 */

export {};
