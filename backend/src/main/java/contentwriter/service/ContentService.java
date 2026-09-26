package contentwriter.service;

import contentwriter.dto.ContentRequestDto;
import contentwriter.dto.ContentResponse;
import contentwriter.entity.Content;
import contentwriter.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ContentService {

    private final AIService aiService;
    private final ContentRepository contentRepository;

    public ContentResponse generateContent(ContentRequestDto request) {

        int wordCount = request.getWordCount();

        return aiService.generate(
                request.getTopic(),
                request.getContentType().toUpperCase(),
                request.getTone().toUpperCase(),
                wordCount,
                request.getTargetAudience(),
                request.getAdditionalInstructions()
        ).map(generatedContent -> {

            int actualWordCount = generatedContent.trim().isEmpty()
                    ? 0
                    : generatedContent.trim().split("\\s+").length;

            Content content = Content.builder()
                    .title(extractTitle(generatedContent, request.getTopic()))
                    .topic(request.getTopic())
                    .contentType(request.getContentType())
                    .tone(request.getTone())
                    .content(generatedContent)
                    .wordCount(actualWordCount)
                    .targetAudience(request.getTargetAudience())
                    .additionalInstructions(request.getAdditionalInstructions())
                    .build();

            Content savedContent = contentRepository.save(content);

            return toResponse(savedContent);

        }).block();
    }

    public List<ContentResponse> getAllContent() {

        return contentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ContentResponse getContentById(Long id) {

        Content content = contentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Content not found with id: " + id)
                );

        return toResponse(content);
    }

    public ContentResponse regenerateContent(
            Long id,
            ContentRequestDto request
    ) {

        Content existingContent = contentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Content not found with id: " + id)
                );

        int wordCount = request.getWordCount();

        return aiService.generate(
                request.getTopic(),
                request.getContentType().toUpperCase(),
                request.getTone().toUpperCase(),
                wordCount,
                request.getTargetAudience(),
                request.getAdditionalInstructions()
        ).map(generatedContent -> {

            int actualWordCount = generatedContent.trim().isEmpty()
                    ? 0
                    : generatedContent.trim().split("\\s+").length;

            existingContent.setTitle(
                    extractTitle(generatedContent, request.getTopic())
            );

            existingContent.setTopic(request.getTopic());
            existingContent.setContentType(request.getContentType());
            existingContent.setTone(request.getTone());
            existingContent.setContent(generatedContent);
            existingContent.setWordCount(actualWordCount);
            existingContent.setTargetAudience(request.getTargetAudience());
            existingContent.setAdditionalInstructions(
                    request.getAdditionalInstructions()
            );

            Content savedContent = contentRepository.save(existingContent);

            return toResponse(savedContent);

        }).block();
    }

    public void deleteContent(Long id) {

        if (!contentRepository.existsById(id)) {
            throw new RuntimeException(
                    "Content not found with id: " + id
            );
        }

        contentRepository.deleteById(id);
    }

    private ContentResponse toResponse(Content content) {

        ContentResponse response = new ContentResponse();

        response.setId(content.getId());
        response.setTitle(content.getTitle());
        response.setTopic(content.getTopic());
        response.setContentType(content.getContentType());
        response.setTone(content.getTone());
        response.setContent(content.getContent());
        response.setWordCount(content.getWordCount());
        response.setTargetAudience(content.getTargetAudience());
        response.setAdditionalInstructions(
                content.getAdditionalInstructions()
        );
        response.setCreatedAt(content.getCreatedAt());
        response.setUpdatedAt(content.getUpdatedAt());

        return response;
    }

    private String extractTitle(
            String content,
            String fallbackTopic
    ) {

        if (content == null || content.isBlank()) {
            return fallbackTopic;
        }

        String[] lines = content.split("\\R");

        for (String line : lines) {

            String cleaned = line
                    .replace("#", "")
                    .replace("*", "")
                    .trim();

            if (!cleaned.isEmpty() && cleaned.length() <= 200) {
                return cleaned;
            }
        }

        return fallbackTopic;
    }
}
