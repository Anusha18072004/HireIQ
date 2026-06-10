import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from '../../ui/Button/Button';
import './FileUpload.css';

/**
 * FileUpload — drag-and-drop + click file picker.
 *
 * Behaviour:
 *   - User selects or drops a file → it is validated and staged locally (no upload yet)
 *   - An "Upload" confirm button appears — user clicks it to trigger the actual upload
 *   - This prevents accidental uploads when the user just wanted to see the filename
 *
 * Props:
 *   onFileSelect(file)  called when the user confirms the upload (clicks the Upload button)
 *   loading             shows a spinner + disables buttons while uploading
 *   accept              file extension filter, default ".pdf"
 *   maxSizeMb           default 10 MB
 *   buttonText          label of the initial pick-file button
 *   buttonVariant       Variant for the pick button (accent / outline / etc.)
 */
export const FileUpload = ({
  onFileSelect,
  loading = false,
  accept = '.pdf',
  maxSizeMb = 10,
  className = '',
  buttonText = 'Select PDF',
  buttonVariant = 'outline',
  ...props
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [stagedFile, setStagedFile] = useState(null);   // file waiting for confirmation
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // ── drag handlers ──────────────────────────────────────────────
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  // ── validate and stage (do NOT call onFileSelect yet) ──────────
  const stageFile = (file) => {
    setError('');
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = accept.split(',').map((e) => e.trim().toLowerCase());
    if (accept && !allowed.includes(ext)) {
      setError(`Invalid file type. Only ${accept} files are allowed.`);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Maximum allowed size is ${maxSizeMb} MB.`);
      return;
    }

    setStagedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) stageFile(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) stageFile(e.target.files[0]);
  };

  // ── confirm upload ─────────────────────────────────────────────
  const handleUploadConfirm = () => {
    if (stagedFile && onFileSelect) {
      onFileSelect(stagedFile);
    }
  };

  // ── clear staged file ──────────────────────────────────────────
  const handleClear = () => {
    setStagedFile(null);
    setError('');
    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`hireiq-file-upload ${className}`} {...props}>
      <div
        className={`hireiq-file-upload__dropzone ${dragActive ? 'hireiq-file-upload__dropzone--active' : ''
          }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hireiq-file-upload__input"
          accept={accept}
          onChange={handleInputChange}
          disabled={loading}
        />

        <div className="hireiq-file-upload__icon">📄</div>

        {stagedFile ? (
          <div className="hireiq-file-upload__meta">
            <span className="hireiq-file-upload__filename">{stagedFile.name}</span>
            <span className="hireiq-file-upload__filesize">
              ({(stagedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
        ) : (
          <div className="hireiq-file-upload__instructions">
            <p className="hireiq-file-upload__text-bold">Drag &amp; drop your resume PDF here</p>
            <p className="hireiq-file-upload__text-muted">or click to browse from files</p>
          </div>
        )}

        {/* ── Buttons ─────────────────────────────────────────── */}
        <div className="hireiq-file-upload__btn-row">
          {/* Always show the pick button (shows "Change File" after staging) */}
          <Button
            variant={stagedFile ? 'outline' : buttonVariant}
            size="sm"
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
            className="hireiq-file-upload__button"
          >
            {stagedFile ? 'Change File' : buttonText}
          </Button>

          {/* Confirm Upload button — only shown once a file is staged */}
          {stagedFile && !loading && (
            <Button
              variant="accent"
              size="sm"
              onClick={handleUploadConfirm}
              className="hireiq-file-upload__button"
            >
              ⬆ Upload Resume
            </Button>
          )}

          {/* Uploading spinner state */}
          {loading && (
            <Button variant="accent" size="sm" disabled className="hireiq-file-upload__button">
              ⏳ Uploading…
            </Button>
          )}

          {/* Clear staged file */}
          {stagedFile && !loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="hireiq-file-upload__button"
            >
              ✕ Clear
            </Button>
          )}
        </div>

        {error && <div className="hireiq-file-upload__error">{error}</div>}
      </div>
    </div>
  );
};

FileUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  accept: PropTypes.string,
  maxSizeMb: PropTypes.number,
  className: PropTypes.string,
  buttonText: PropTypes.string,
  buttonVariant: PropTypes.string,
};

export default FileUpload;
