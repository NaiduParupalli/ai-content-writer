package contentwriter.controller;

import contentwriter.dto.ContentRequestDto;
import contentwriter.dto.ContentResponse;
import contentwriter.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ContentController {

    private final ContentService contentService;

    @PostMapping
    public ResponseEntity<ContentResponse> generateContent(
            @Valid @RequestBody ContentRequestDto request) {

        return ResponseEntity.ok(
                contentService.generateContent(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<ContentResponse>> getAllContent() {

        return ResponseEntity.ok(
                contentService.getAllContent()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentResponse> getContentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                contentService.getContentById(id)
        );
    }

    @PostMapping("/{id}/regenerate")
    public ResponseEntity<ContentResponse> regenerateContent(
            @PathVariable Long id,
            @Valid @RequestBody ContentRequestDto request) {

        return ResponseEntity.ok(
                contentService.regenerateContent(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable Long id) {

        contentService.deleteContent(id);

        return ResponseEntity.noContent().build();
    }
}
