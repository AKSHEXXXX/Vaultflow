package com.demoapplication.saas.document.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {

    private static final Logger logger = LoggerFactory.getLogger(S3Service.class);

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name:saas-documents}")
    private String bucketName;

    @Value("${aws.s3.presigned-url-expiration:3600}")
    private int presignedUrlExpiration;

    public S3Service(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    /**
     * Upload a file to S3
     * @param file the file to upload
     * @param tenantId tenant ID for folder isolation
     * @param documentId document ID for unique naming
     * @return the S3 key where the file was stored
     */
    public String uploadFile(MultipartFile file, UUID tenantId, UUID documentId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // S3 key format: tenants/{tenantId}/documents/{documentId}{extension}
        String s3Key = String.format("tenants/%s/documents/%s%s", tenantId, documentId, extension);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
        logger.info("Uploaded file to S3: {}", s3Key);

        return s3Key;
    }

    /**
     * Generate a presigned URL for downloading a file
     * @param s3Key the S3 key of the file
     * @return presigned URL valid for configured duration
     */
    public String generatePresignedDownloadUrl(String s3Key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(presignedUrlExpiration))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        String url = presignedRequest.url().toString();
        logger.debug("Generated presigned URL for: {}", s3Key);

        return url;
    }

    /**
     * Delete a file from S3
     * @param s3Key the S3 key of the file to delete
     */
    public void deleteFile(String s3Key) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
        logger.info("Deleted file from S3: {}", s3Key);
    }

    /**
     * Get the bucket name
     */
    public String getBucketName() {
        return bucketName;
    }
}
