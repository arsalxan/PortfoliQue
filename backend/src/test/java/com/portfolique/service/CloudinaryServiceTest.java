package com.portfolique.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    private CloudinaryService cloudinaryService;

    @BeforeEach
    void setUp() {
        cloudinaryService = new CloudinaryService(cloudinary);
    }

    @Test
    void testExtractPublicId() {
        String url = "http://res.cloudinary.com/demo/image/upload/v12345678/samples/animals/reindeer.jpg";
        String publicId = cloudinaryService.extractPublicId(url);
        assertThat(publicId).isEqualTo("samples/animals/reindeer");
        
        String urlNoV = "http://res.cloudinary.com/demo/image/upload/samples/animals/reindeer.jpg";
        String publicIdNoV = cloudinaryService.extractPublicId(urlNoV);
        assertThat(publicIdNoV).isEqualTo("samples/animals/reindeer");

        assertThat(cloudinaryService.extractPublicId(null)).isNull();
        assertThat(cloudinaryService.extractPublicId("htttp://notcloudinary.com/foo.png")).isNull();
    }

    @Test
    void testUploadPortfolioScreenshot() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "test".getBytes());
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), any())).thenReturn(Map.of("url", "http://cloudinary.com/test.png"));

        String result = cloudinaryService.uploadPortfolioScreenshot(file);

        assertThat(result).isEqualTo("http://cloudinary.com/test.png");
        verify(uploader).upload(any(byte[].class), any());
    }
}
