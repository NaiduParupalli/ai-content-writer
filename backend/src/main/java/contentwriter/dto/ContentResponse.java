package contentwriter.dto;

import contentwriter.entity.Content;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Response DTO for generated content.
 * <p>
 * Contains the AI-generated response with all metadata and statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentResponse {

    /**
     * Unique identifier for this content piece.
     */
    private Long id;

    /**
     * The generated title.
     */
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;

    /**
     * The subject/topic of the content.
     */
    @NotBlank(message = "Topic is required")
    @Size(min = 5, max = 500, message = "Topic must be between 5 and 500 characters")
    private String topic;

    /**
     * Type of content (BLOG, ARTICLE, SOCIAL_MEDIA, etc.).
     */
    @NotBlank(message = "Content type is required")
    @Size(max = 100, message = "Content type must not exceed 100 characters")
    private String contentType;

    /**
     * Tone of the content (FRIENDLY, PROFESSIONAL, etc.).
     */
    @NotBlank(message = "Tone is required")
    @Size(max = 100, message = "Tone must not exceed 100 characters")
    private String tone;

    /**
     * The full AI-generated content text.
     */
    @NotBlank(message = "Content is required")
    @Size(min = 50, max = 100000, message = "Content must be between 50 and 100K characters")
    private String content;

    /**
     * Number of words in the generated content.
     */
    @Min(value = 0, message = "Word count cannot be negative")
    private Integer wordCount;

    /**
     * Description of target audience (optional).
     */
    @Size(max = 300, message = "Target audience must not exceed 300 characters")
    private String targetAudience;

    /**
     * Additional instructions provided by user.
     */
    @Size(max = 1000, message = "Additional instructions must not exceed 1000 characters")
    private String additionalInstructions;

    /**
     * When the content was originally generated.
     */
    @NotNull(message = "Created at cannot be null")
    private LocalDateTime createdAt;

    /**
     * Last modification timestamp.
     */
    private LocalDateTime updatedAt;

    /**
     * Convert entity to response object.
     */
    public static ContentResponse fromEntity(Content content) {
        return ContentResponse.builder()
                .id(content.getId())
                .title(content.getTitle())
                .topic(content.getTopic())
                .contentType(content.getContentType())
                .tone(content.getTone())
                .content(content.getContent())
                .wordCount(content.getWordCount())
                .targetAudience(content.getTargetAudience())
                .additionalInstructions(content.getAdditionalInstructions())
                .createdAt(content.getCreatedAt())
                .updatedAt(content.getUpdatedAt())
                .build();
    }
}
