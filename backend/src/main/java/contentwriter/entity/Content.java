package contentwriter.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Entity representing AI-generated content in the database.
 * <p>
 * Designed to store generated articles, blog posts, social media content, etc.
 * includes metadata like tone, type, and generation timestamps for history tracking.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "content")
public class Content {

    /**
     * Unique identifier for the content (Primary Key).
     * Used as a reference key in APIs for view/edit/delete operations.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The generated title of the content piece.
     * <p>
     * Maximum 500 characters - sufficient for most article titles and social posts.
     */
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    /**
     * The topic about which the content was generated.
     * <p>
     * What the user entered as their main subject/metric for generation.
     */
    @Column(name = "topic", nullable = false, length = 500)
    private String topic;

    /**
     * The type of content generated (BLOG, ARTICLE, SOCIAL_MEDIA, etc.).
     * <p>
     * One of the supported content types defined in the system configuration.
     * This can be extended later to support additional types.
     */
    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    /**
     * Tone/style of the generated content (FRIENDLY, PROFESSIONAL, etc.).
     * <p>
     * Controls the writing style as requested by the user.
     */
    @Column(name = "tone", nullable = false, length = 50)
    private String tone;

    /**
     * The actual AI-generated content text.
     * <p>
     * Stored as TEXT to accommodate variable lengths (300-1000+ words).
     */
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Word count of the generated content.
     * <p>
     * Used for displaying approximate length and meeting user requirements.
     */
    @Column(name = "word_count")
    private Integer wordCount;

    /**
     * Target audience description (optional).
     * <p>
     * Helps tailor the content to a specific demographic or knowledge level.
     */
    @Column(name = "target_audience", length = 200)
    private String targetAudience;

    /**
     * Additional instructions provided by the user for customizing generation.
     * <p>
     * Flexible field to capture any special requirements or preferences.
     */
    @Column(name = "additional_instructions", columnDefinition = "TEXT")
    private String additionalInstructions;

    /**
     * Timestamp when the content was generated.
     * <p>
     * Used for chronological sorting in history and audit purposes.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Last modification timestamp.
     * <p>
     * Updated automatically when content is edited or regenerated.
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Cascade operations to handle entity lifecycle properly in JPA/Hibernate.
     */
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Triggered on every update to track content modifications.
     */
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
