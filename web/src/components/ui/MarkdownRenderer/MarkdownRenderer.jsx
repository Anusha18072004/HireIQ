import React from 'react';
import PropTypes from 'prop-types';
import './MarkdownRenderer.css';

export const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  let processedContent = content;

  // 1. Clean up trailing double asterisks from lines
  processedContent = processedContent.replace(/\s*\*\*\s*$/gm, '');

  // 2. Split steps, tips, questions, changes, points, topics, or numbers that are run together in a paragraph into separate lines
  processedContent = processedContent.replace(/(?<![-*]\s*)(Step\s+\d+[:\-]?\s*)/gi, '\n- $1');
  processedContent = processedContent.replace(/(?<![-*]\s*)(Tip\s+\d+[:\-]?\s*)/gi, '\n- $1');
  processedContent = processedContent.replace(/(?<![-*]\s*)(Suggestion\s+\d+[:\-]?\s*)/gi, '\n- $1');
  processedContent = processedContent.replace(/(?<![-*]\s*)(Q\s*\d+[:\-]?\s*)/gi, '\n- $1');
  processedContent = processedContent.replace(/(?<![-*]\s*)(Question\s+\d+[:\-]?\s*)/gi, '\n- $1');
  processedContent = processedContent.replace(/(?<![-*]\s*)(Change\s+\d+[:\-]?\s*)/gi, '\n- $1');
  processedContent = processedContent.replace(/(?<![-*]\s*)(Point\s+\d+[:\-]?\s*)/gi, '\n- $1');
  processedContent = processedContent.replace(/(?<![-*]\s*)(Topic\s+\d+[:\-]?\s*)/gi, '\n- $1');
  processedContent = processedContent.replace(/(?<![-*]\s*)(\d+\.\s+[A-Z])/g, '\n- $1');

  const rawLines = processedContent.split('\n');

  // Regex to match label highlights like Step 1, Tip 2, Q3, Suggestion 4, or simple numbers
  const highlightLabelRegex = /^(Step|Tip|Q|Question|Suggestion|Point|Change|Topic|\d+)\s*\d*[:\-\.]?/i;

  // 3. Process each line to format with bold title highlights
  const lines = rawLines.map((line) => {
    let trimmed = line.trim();
    if (!trimmed) return '';

    const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-');

    if (isBullet) {
      const bullet = trimmed.charAt(0);
      let contentText = trimmed.slice(1).trim();

      if (highlightLabelRegex.test(contentText)) {
        contentText = contentText.replace(/\*\*/g, '');

        const dashIdx = contentText.indexOf(' - ');
        const emDashIdx = contentText.indexOf(' — ');
        const separatorIdx = dashIdx !== -1 ? dashIdx : emDashIdx;

        if (separatorIdx !== -1) {
          const title = contentText.slice(0, separatorIdx).trim();
          const desc = contentText.slice(separatorIdx).trim();
          return `${bullet} **${title}** ${desc}`;
        } else {
          return `${bullet} **${contentText}**`;
        }
      }
    } else if (highlightLabelRegex.test(trimmed)) {
      trimmed = trimmed.replace(/\*\*/g, '');
      const dashIdx = trimmed.indexOf(' - ');
      const emDashIdx = trimmed.indexOf(' — ');
      const separatorIdx = dashIdx !== -1 ? dashIdx : emDashIdx;

      if (separatorIdx !== -1) {
        const title = trimmed.slice(0, separatorIdx).trim();
        const desc = trimmed.slice(separatorIdx).trim();
        return `**${title}** ${desc}`;
      } else {
        return `**${trimmed}**`;
      }
    }
    return line;
  });

  // Helper to parse double asterisks and render bold elements
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split('**');
    if (parts.length === 1) return text;
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        const isHighlightLabel = highlightLabelRegex.test(part.trim());
        return (
          <strong
            key={idx}
            className={`hireiq-markdown__bold ${
              isHighlightLabel ? 'hireiq-markdown__bold--step' : ''
            }`}
          >
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`hireiq-markdown ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="hireiq-markdown__spacing" />;

        if (trimmed.startsWith('###')) {
          return (
            <h4 key={idx} className="hireiq-markdown__h4">
              {renderFormattedText(trimmed.replace(/^###\s*/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('##')) {
          return (
            <h3 key={idx} className="hireiq-markdown__h3">
              {renderFormattedText(trimmed.replace(/^##\s*/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('#')) {
          return (
            <h2 key={idx} className="hireiq-markdown__h2">
              {renderFormattedText(trimmed.replace(/^#\s*/, ''))}
            </h2>
          );
        }

        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
          if (trimmed.startsWith('- [ ]') || trimmed.startsWith('* [ ]')) {
            return (
              <div key={idx} className="hireiq-markdown__checkbox-row">
                <span className="hireiq-markdown__checkbox">☐</span>
                <span>{renderFormattedText(trimmed.replace(/^[-*]\s*\[\s*\]\s*/, ''))}</span>
              </div>
            );
          }
          if (
            trimmed.startsWith('- [x]') ||
            trimmed.startsWith('* [x]') ||
            trimmed.startsWith('- [X]') ||
            trimmed.startsWith('* [X]')
          ) {
            return (
              <div key={idx} className="hireiq-markdown__checkbox-row hireiq-markdown__checkbox-row--checked">
                <span className="hireiq-markdown__checkbox-checked">☑</span>
                <span>{renderFormattedText(trimmed.replace(/^[-*]\s*\[\s*[xX]\s*\]\s*/, ''))}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="hireiq-markdown__bullet-row">
              <span className="hireiq-markdown__bullet">•</span>
              <span>{renderFormattedText(trimmed.replace(/^[-*]\s*/, ''))}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="hireiq-markdown__paragraph">
            {renderFormattedText(line)}
          </p>
        );
      })}
    </div>
  );
};

MarkdownRenderer.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
};

export default MarkdownRenderer;
