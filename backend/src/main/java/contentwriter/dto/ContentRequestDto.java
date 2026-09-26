package contentwriter.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request DTO for content generation.
 * <p>
 * Represents the parameters a user provides when requesting AI-generated content:
 * topic, type, tone, length, optional audience and custom instructions.
 */
@Data
@Builder
public class ContentRequestDto {

    /**
     * The main subject/topic for content generation.
     */
    @NotBlank(message = "Topic is required")
    @Size(min = 5, max = 500, message = "Topic must be between 5 and 500 characters")  
    private String topic;

    /**
     * Type of content to generate.
     */
    @NotBlank(message = "Content type is required")
    @Builder.Default
    private String contentType = "BLOG";

    /**
     * Tone/style of the content.
     */
    @NotBlank(message = "Tone is required")
    @Builder.Default
    private String tone = "FRIENDLY";

    /**
     * Desired length: SHORT(300), MEDIUM(600), LONG(1000), CUSTOM
     */
    @NotNull(message = "Length must be specified")
    private Object length;

    /**
     * Optional additional instructions.
     */
    @Size(max = 1000, message = "Additional instructions must not exceed 1000 characters")
    private String additionalInstructions;

    /**
     * Target audience description (optional).
     */
    @Size(max = 300, message = "Target audience must not exceed 300 characters")
    private String targetAudience;

    public int getWordCount() {
        if (this.length instanceof String str) {
            return switch(str.toUpperCase()) {
                case "SHORT" -> 300;
                case "MEDIUM" -> 600;
                case "LONG" -> 1000;
                default -> parseWordCount(str);
            };
        } else if (this.length instanceof Integer) {
            return ((Integer)this.length).intValue();
        }
        return 600;
    }

    private int parseWordCount(String s) {
        try {
            String[] parts = s.split("\\s", 2);
            if (parts.length == 1 && Character.isDigit(parts[0].charAt(0))) {
                return Integer.parseInt(parts[0]);
            }
        } catch (Exception ignored) {}
        return 600;
    }
}
