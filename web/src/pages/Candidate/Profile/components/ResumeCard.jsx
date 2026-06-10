import React, { useState } from 'react';
import Card from '../../../../components/ui/Card/Card';
import Button from '../../../../components/ui/Button/Button';
import Badge from '../../../../components/ui/Badge/Badge';
import FileUpload from '../../../../components/forms/FileUpload/FileUpload';

/**
 * Ensure a Cloudinary raw-resource URL is served inline.
 * Without this flag Cloudinary sends Content-Disposition: attachment
 * which forces a download instead of rendering in the browser.
 */
const toInlineUrl = (url) => {
  if (!url) return url;
  if (url.includes('fl_attachment')) return url; // already patched
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/fl_attachment:false/');
  }
  return url;
};

/**
 * Google Docs Viewer wraps any public PDF URL and renders it in-browser,
 * bypassing every Content-Disposition / CORS issue.
 */
const toGoogleViewerUrl = (url) =>
  `https://docs.google.com/viewer?url=${encodeURIComponent(toInlineUrl(url))}&embedded=true`;

export const ResumeCard = ({ profile, onUpload, uploading }) => {
  const [showUploader, setShowUploader] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const handleFileSelect = async (file) => {
    try {
      await onUpload(file);
      setShowUploader(false);
      setShowViewer(false);
    } catch (err) {
      // Handled by parent
    }
  };

  const hasResume = !!profile?.resumeUrl;
  const isAiParsed = !!profile?.resumeRawText;

  const getFilename = () => {
    if (!profile?.resumeUrl) return 'resume.pdf';
    try {
      const decoded = decodeURIComponent(profile.resumeUrl);
      // find the last path segment that contains a dot (e.g. "...resume.pdf")
      const parts = decoded.split('/');
      const nameSegment = [...parts].reverse().find((p) => p.includes('.'));
      return nameSegment || 'resume.pdf';
    } catch {
      return 'resume.pdf';
    }
  };

  return (
    <Card title="📄 Resume" className="hireiq-profile-page__section-card">
      <div className="hireiq-resume-card">

        {/* ── Uploaded state ─────────────────────────────────── */}
        {hasResume && (
          <div className="hireiq-resume-card__status">
            <div className="hireiq-resume-card__info">
              <span className="hireiq-resume-card__icon">📄</span>
              <div className="hireiq-resume-card__details">
                <span className="hireiq-resume-card__name">{getFilename()}</span>
                <div className="hireiq-resume-card__badges">
                  <Badge variant="success">Uploaded</Badge>
                  {isAiParsed && (
                    <Badge variant="primary">⚡ AI Parsed &amp; Synced</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="hireiq-resume-card__actions">
              {/* Toggle the inline viewer */}
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setShowViewer((v) => !v);
                  setShowUploader(false);
                }}
              >
                {showViewer ? '✖ Close PDF' : '📄 View PDF'}
              </Button>

              {/* Direct download — always works */}
              <a
                href={toInlineUrl(profile.resumeUrl)}
                download
                rel="noopener noreferrer"
                className="hireiq-resume-card__link-btn"
              >
                <Button variant="outline" size="sm">⬇ Download</Button>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUploader((v) => !v);
                  setShowViewer(false);
                }}
              >
                {showUploader ? 'Cancel' : '🔄 Replace Resume'}
              </Button>
            </div>
          </div>
        )}

        {/* ── No resume yet ──────────────────────────────────── */}
        {!hasResume && (
          <div className="hireiq-resume-card__empty">
            <p className="hireiq-resume-card__empty-text">
              No resume uploaded yet. Upload your PDF to apply for jobs and let AI sync your
              profile automatically.
            </p>
          </div>
        )}

        {/* ── Inline PDF viewer via Google Docs Viewer ──────── */}
        {showViewer && hasResume && (
          <div className="hireiq-resume-card__viewer-wrap">
            <iframe
              src={toGoogleViewerUrl(profile.resumeUrl)}
              title="Resume PDF"
              className="hireiq-resume-card__viewer"
              allow="autoplay"
            />
            <p className="hireiq-resume-card__viewer-hint">
              If the preview is blank, click{' '}
              <a
                href={toInlineUrl(profile.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                here to open directly
              </a>
              .
            </p>
          </div>
        )}

        {/* ── File uploader ──────────────────────────────────── */}
        {(showUploader || !hasResume) && (
          <div
            className={`hireiq-resume-card__uploader-wrap ${!hasResume ? 'hireiq-resume-card__uploader-wrap--no-border' : ''
              }`}
          >
            <FileUpload
              onFileSelect={handleFileSelect}
              loading={uploading}
              accept=".pdf"
              buttonText="Upload Resume"
              buttonVariant="accent"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResumeCard;
