import React, { useState } from 'react';
import Card from '../../../../components/ui/Card/Card';
import Button from '../../../../components/ui/Button/Button';
import CertModal from './CertModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { addCertification, updateCertification, deleteCertification } from '../../../../api/profile.api';

export const CertificationsCard = ({ certifications = [], onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const handleOpenAdd = () => {
    setSelectedCert(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cert) => {
    setSelectedCert(cert);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (selectedCert) {
      await updateCertification(selectedCert.id, data);
    } else {
      await addCertification(data);
    }
    onRefresh();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteCertification(deleteId);
      setDeleteId(null);
      onRefresh();
    }
  };

  return (
    <Card
      title="📜 Certifications"
      action={
        <Button variant="accent" size="sm" onClick={handleOpenAdd}>
          + Add Certification
        </Button>
      }
      className="hireiq-profile-page__section-card"
    >
      {certifications.length === 0 ? (
        <div className="hireiq-profile-page__empty-state">
          <span className="hireiq-profile-page__empty-icon">📜</span>
          <p className="hireiq-profile-page__empty-text">No certifications added yet.</p>
        </div>
      ) : (
        <div className="hireiq-cert-list">
          {certifications.map((cert) => (
            <div key={cert.id} className="hireiq-cert-card">
              <div className="hireiq-cert-card__content">
                <div className="hireiq-cert-card__title-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 className="hireiq-cert-card__title">{cert.certificationName}</h4>
                    {cert.isAiExtracted && <span className="ai-badge">AI Extracted</span>}
                  </div>
                  <div className="hireiq-cert-card__actions" style={{ display: 'flex', gap: '0.4rem' }}>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenEdit(cert)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleDelete(cert.id)}
                      style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <p className="hireiq-cert-card__org">🏢 {cert.issuingOrganization}</p>

                <p className="hireiq-cert-card__duration">
                  📅 Issued: {cert.issueMonth} {cert.issueYear} · {cert.doesNotExpire ? 'No Expiration Date' : `Expires: ${cert.expiryMonth} ${cert.expiryYear}`}
                </p>

                {cert.credentialId && (
                  <p className="hireiq-cert-card__cred-id">
                    🆔 Credential ID: <span className="hireiq-cert-card__cred-val">{cert.credentialId}</span>
                  </p>
                )}

                {cert.credentialUrl && (
                  <div className="hireiq-cert-card__links">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hireiq-cert-card__link"
                    >
                      🔗 View Credential
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CertModal
          certification={selectedCert}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this certification?"
      />
    </Card>
  );
};

export default CertificationsCard;
