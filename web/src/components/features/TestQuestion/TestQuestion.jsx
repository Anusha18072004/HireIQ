import React from 'react';
import PropTypes from 'prop-types';
import './TestQuestion.css';

export const TestQuestion = ({
  question,
  selectedOption,
  onOptionSelect,
  questionIndex,
  className = '',
  ...props
}) => {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className={`hireiq-test-question ${className}`} {...props}>
      <p className="hireiq-test-question__text">
        <span className="hireiq-test-question__num">Q{questionIndex + 1}.</span>{' '}
        {question.question}
      </p>

      <div className="hireiq-test-question__options">
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          const optionText = question[`option${opt}`];

          return (
            <label
              key={opt}
              className={`hireiq-test-option ${
                isSelected ? 'hireiq-test-option--selected' : ''
              }`}
            >
              <input
                type="radio"
                name={`q-${question.questionNumber}`}
                value={opt}
                checked={isSelected}
                onChange={() => onOptionSelect(question.questionNumber, opt)}
                className="hireiq-test-option__input"
              />
              <span className="hireiq-test-option__marker">{opt}.</span>
              <span className="hireiq-test-option__text">{optionText}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

TestQuestion.propTypes = {
  question: PropTypes.shape({
    questionNumber: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    optionA: PropTypes.string.isRequired,
    optionB: PropTypes.string.isRequired,
    optionC: PropTypes.string.isRequired,
    optionD: PropTypes.string.isRequired,
  }).isRequired,
  selectedOption: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired,
  questionIndex: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default TestQuestion;
