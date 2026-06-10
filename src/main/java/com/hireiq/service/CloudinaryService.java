package com.hireiq.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * CloudinaryService — uploads files to Cloudinary and returns the public URL.
 *
 * For resumes:
 *  - Files are stored in the "hireiq/resumes" folder in your Cloudinary account
 *  - Each file gets a unique public_id based on candidate email + timestamp
 *  - Returns a permanent HTTPS URL we store in the database
 */
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload a resume PDF to Cloudinary.
     *
     * @param file      the PDF file from the multipart request
     * @param userEmail used to generate a unique filename
     * @return the public HTTPS URL of the uploaded file
     */
    @SuppressWarnings("unchecked")
    public String uploadResume(MultipartFile file, String userEmail) throws IOException {
        // Sanitise email for use as a filename (replace @ and . with _)
        String sanitisedEmail = userEmail.replace("@", "_").replace(".", "_");
        String publicId = "hireiq/resumes/" + sanitisedEmail + "_" + System.currentTimeMillis();

        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id",    publicId,
                        "resource_type","raw",       // "raw" = non-image files like PDF
                        "format",       "pdf",
                        "overwrite",    true
                )
        );

        // "secure_url" is the HTTPS URL Cloudinary gives back.
        // Add fl_attachment:false so Cloudinary serves the PDF with
        // Content-Disposition: inline — browsers can then render it directly
        // instead of forcing a download.
        String secureUrl = (String) uploadResult.get("secure_url");
        if (secureUrl != null && secureUrl.contains("/upload/")) {
            secureUrl = secureUrl.replace("/upload/", "/upload/fl_attachment:false/");
        }
        return secureUrl;
    }

    /**
     * Delete a file from Cloudinary (used when candidate re-uploads resume).
     *
     * @param publicId the public_id of the file to delete
     */
    @SuppressWarnings("unchecked")
    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId,
                ObjectUtils.asMap("resource_type", "raw"));
    }
}