package contentwriter.service;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class OllamaAIService implements AIService {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();

    private final String model = "gemini-3.8-flash";

    private static final int MAX_RETRIES = 3;

    @Override
    public Mono<String> generate(
            String topic,
            String contentType,
            String tone,
            int wordCount,
            String audience,
            String instructions) {

        String prompt = buildPrompt(
                topic,
                contentType,
                tone,
                wordCount,
                audience,
                instructions
        );

        return Mono.fromCallable(() -> generateWithRetry(prompt));
    }

    private String generateWithRetry(String prompt) {

        String apiKey = System.getenv("GEMINI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException(
                    "GEMINI_API_KEY is not configured"
            );
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of(
                                                "text", prompt
                                        )
                                )
                        )
                )
        );

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {

            try {

                Map<?, ?> response = restClient.post()
                        .uri(uriBuilder -> uriBuilder
                                .path("/models/" + model + ":generateContent")
                                .queryParam("key", apiKey)
                                .build())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .retrieve()
                        .body(Map.class);

                return extractText(response);

            } catch (RestClientResponseException ex) {

                HttpStatusCode status = ex.getStatusCode();

                System.out.println(
                        "Gemini request failed. Attempt "
                                + attempt
                                + "/"
                                + MAX_RETRIES
                                + ". Status: "
                                + status
                );

                // Retry temporary server/rate-limit errors
                if (status.value() == 429
                        || status.value() == 500
                        || status.value() == 502
                        || status.value() == 503
                        || status.value() == 504) {

                    if (attempt < MAX_RETRIES) {

                        try {
                            Thread.sleep(attempt * 2000L);
                        } catch (InterruptedException interruptedException) {
                            Thread.currentThread().interrupt();

                            throw new RuntimeException(
                                    "Gemini request was interrupted",
                                    interruptedException
                            );
                        }

                        continue;
                    }

                    throw new RuntimeException(
                            "Gemini AI service is temporarily unavailable. "
                                    + "Please try again later."
                    );
                }

                throw new RuntimeException(
                        "Gemini API error: "
                                + ex.getResponseBodyAsString(),
                        ex
                );
            }
        }

        throw new RuntimeException(
                "Gemini AI service is temporarily unavailable."
        );
    }

    private String extractText(Map<?, ?> response) {

        if (response == null) {
            throw new RuntimeException(
                    "Gemini returned an empty response"
            );
        }

        Object candidatesObject = response.get("candidates");

        if (!(candidatesObject instanceof List<?> candidates)
                || candidates.isEmpty()) {

            throw new RuntimeException(
                    "Gemini returned no candidates: " + response
            );
        }

        Object candidateObject = candidates.get(0);

        if (!(candidateObject instanceof Map<?, ?> candidate)) {
            throw new RuntimeException(
                    "Invalid Gemini response"
            );
        }

        Object contentObject = candidate.get("content");

        if (!(contentObject instanceof Map<?, ?> content)) {
            throw new RuntimeException(
                    "Gemini response does not contain content"
            );
        }

        Object partsObject = content.get("parts");

        if (!(partsObject instanceof List<?> parts)
                || parts.isEmpty()) {

            throw new RuntimeException(
                    "Gemini response does not contain parts"
            );
        }

        Object partObject = parts.get(0);

        if (!(partObject instanceof Map<?, ?> part)) {
            throw new RuntimeException(
                    "Invalid Gemini response part"
            );
        }

        Object textObject = part.get("text");

        if (textObject == null
                || textObject.toString().isBlank()) {

            throw new RuntimeException(
                    "Gemini returned empty content"
            );
        }

        return textObject.toString();
    }

    private String buildPrompt(
            String topic,
            String contentType,
            String tone,
            int wordCount,
            String audience,
            String instructions) {

        return """
                You are a professional content writer.

                Create content using the following requirements:

                Topic:
                %s

                Content Type:
                %s

                Tone:
                %s

                Target Word Count:
                approximately %d words

                Target Audience:
                %s

                Additional Instructions:
                %s

                Requirements:
                - Write clear and useful content.
                - Use simple English.
                - Use professional Markdown formatting.
                - Use headings where appropriate.
                - Use bullet points where appropriate.
                - Do not mention that you are an AI.
                - Do not explain the prompt.
                - Return only the final content.
                """.formatted(
                topic,
                contentType,
                tone,
                wordCount,
                audience != null ? audience : "General audience",
                instructions != null ? instructions : "None"
        );
    }
}
