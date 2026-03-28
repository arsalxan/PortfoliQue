package com.portfolique.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadPortfolioScreenshot(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap("folder", "PortfolioQue/portfolios"));
        return uploadResult.get("url").toString();
    }

    public String uploadProfilePicture(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap("folder", "PortfolioQue/dps"));
        return uploadResult.get("url").toString();
    }

    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    // Helper to extract public ID from a standard cloudinary URL
    public String extractPublicId(String url) {
        if (url == null || !url.contains("upload/")) {
            return null;
        }
        int startIndex = url.indexOf("upload/") + 7;
        // Handle optional version number in URL (e.g. /upload/v123456789/folder/image.png)
        if (url.charAt(startIndex) == 'v' && Character.isDigit(url.charAt(startIndex + 1))) {
            startIndex = url.indexOf("/", startIndex) + 1;
        }
        int endIndex = url.lastIndexOf(".");
        if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
            return url.substring(startIndex, endIndex);
        }
        return null;
    }
}
