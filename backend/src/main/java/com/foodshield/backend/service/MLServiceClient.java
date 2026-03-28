package com.foodshield.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Service
public class MLServiceClient {

    private final String ML_SERVICE_URL = "http://ml-service:5000/predict";
    private final RestTemplate restTemplate = new RestTemplate();

    public MLResponse analyzeImage(String listPath) {
        try {
            // listPath is "uploads/filename.jpg"
            // We send this path to the ML service which shares the volume

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("filepath", listPath);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<MLResponse> response = restTemplate.postForEntity(
                    ML_SERVICE_URL,
                    request,
                    MLResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("ML Service Error: " + e.getMessage());
            // Fallback default
        }
        return new MLResponse(false, 0.0, true, "ML Service Failed");
    }

    // Inner DTO for Response
    public static class MLResponse {
        public boolean is_ai_generated;
        public double confidence;
        public boolean is_food;
        public String message;

        public MLResponse() {
        }

        public MLResponse(boolean is_ai_generated, double confidence, boolean is_food, String message) {
            this.is_ai_generated = is_ai_generated;
            this.confidence = confidence;
            this.is_food = is_food;
            this.message = message;
        }
    }
}
