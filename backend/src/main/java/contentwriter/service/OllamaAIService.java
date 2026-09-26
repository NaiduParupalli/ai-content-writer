package contentwriter.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OllamaAIService implements AIService {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("http://localhost:11434")
            .build();

    private final String model = "llama3.2";

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

        return Mono.fromCallable(() -> {

            Map<?, ?> response = restClient.post()
                    .uri("/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "model", model,
                            "prompt", prompt,
                            "stream", false
                    ))
                    .retrieve()
                    .body(Map.class);

            if (response == null || response.get("response") == null) {
                throw new RuntimeException("Ollama returned an empty response");
            }

            return response.get("response").toString();
        });
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
                - Use headings where appropriate.
                - Do not mention that you are an AI.
                - Do not add unnecessary explanations about the prompt.
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
