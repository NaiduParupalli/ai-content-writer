package contentwriter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the AI Content Writer application.
 * <p>
 * This Spring Boot application provides APIs for AI-generated content
 * covering blogs, articles, social media posts, and more.
 * 
 * Technologies:
 * - Spring Boot 3.3 (Layered architecture)
 * - Java 17 (SOLID principles)
 * - MySQL with JPA/Hibernate (Persistence)
 */
@SpringBootApplication(scanBasePackages = "contentwriter")
public class ContentApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContentApplication.class, args);
    }
}
