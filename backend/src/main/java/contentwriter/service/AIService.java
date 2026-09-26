package contentwriter.service;

import reactor.core.publisher.Mono;

/**
 * Interface defining AI service contract.
 * <p>
 * Abstracts the AI provider so implementation can change without affecting rest of system.
 * Supports Ollama initially, easily swappable for OpenAI, Anthropic, etc.
 */
public interface AIService {

    /**
     * Generate content based on request parameters.
     * 
     * @param topic Main subject/topic
     * @param contentType Type: BLOG, ARTICLE, SOCIAL_MEDIA, etc.
     * @param tone Tone: FRIENDLY, PROFESSIONAL, etc.
     * @param wordCount Approximately how many words (300-10000)
     * @param audience Target audience (optional)
     * @param instructions Custom instructions (optional)
     * @return Generated content text
     */
    Mono<String> generate(
            String topic,
            String contentType, 
            String tone,
            int wordCount,
            String audience,
            String instructions);
}
