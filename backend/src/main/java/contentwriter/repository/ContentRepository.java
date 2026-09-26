package contentwriter.repository;

import contentwriter.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Content entity.
 * <p>
 * Extends JpaRepository with standard CRUD operations plus custom queries.
 */
@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {

}
