package org.zpi.watchout.data.repos

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.service.dto.AdminCommentsDTO
import org.zpi.watchout.service.dto.CommentResponseDTO

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {

    @Query(
        value = """
        SELECT new org.zpi.watchout.service.dto.CommentResponseDTO(
            c.id,
            c.content,
            c.eventId,
            c.createdAt,
            new org.zpi.watchout.service.dto.AuthorResponseDTO(
                uAuthor.id * 1000003 + c.eventId * 1009,
                uAuthor.reputation
            ),
            COALESCE(SUM(cr.rating * uRater.reputation), 0.0),
            COALESCE(MAX(CASE WHEN uRater.id = :userId THEN cr.rating ELSE NULL END), 0),
            CASE WHEN uAuthor.id = :userId THEN true ELSE false END
        )
        FROM Comment c
        JOIN c.author uAuthor
        LEFT JOIN CommentRating cr ON cr.comment = c
        LEFT JOIN cr.user uRater
        WHERE c.eventId = :eventId
        AND c.isDeleted = false
        GROUP BY 
            c.id, c.content,uAuthor.id, c.eventId, c.createdAt, uAuthor.reputation
    """,
        countQuery = """
        SELECT COUNT(c.id)
        FROM Comment c
        WHERE c.eventId = :eventId
        AND c.isDeleted = false
    """
    )
    fun findByEventId(
        @Param("eventId") eventId: Long,
        @Param("userId") userId: Long,
        pageable: Pageable
    ): Page<CommentResponseDTO>


    @Query(
        value = """
        SELECT new org.zpi.watchout.service.dto.CommentResponseDTO(
            c.id,
            c.content,
            c.eventId,
            c.createdAt,
            new org.zpi.watchout.service.dto.AuthorResponseDTO(
                uAuthor.id,
                uAuthor.reputation
            ),
            COALESCE(SUM(cr.rating * uRater.reputation), 0.0),
            0.0,
            true 
        )
        FROM Comment c
        JOIN c.author uAuthor
        LEFT JOIN CommentRating cr ON cr.comment = c
        LEFT JOIN cr.user uRater
        WHERE (:authorId IS NULL OR uAuthor.id = :authorId)
        GROUP BY 
            c.id, c.content, uAuthor.id, c.eventId, c.createdAt, uAuthor.reputation
    """
    )
    fun findByAuthor(@Param("authorId") authorId: Long? = null): List<CommentResponseDTO>


    @Query(
        value = """
        SELECT new org.zpi.watchout.service.dto.AdminCommentsDTO(
            c.id,
            c.content,
            uAuthor.email,
            uAuthor.id,
            c.createdAt,
            c.isDeleted
        )
        FROM Comment c
        JOIN c.author uAuthor
        WHERE c.id = :commentId
    """
    )
    fun getAdminCommentById(@Param("commentId") commentId: Long): AdminCommentsDTO?

    @Query(
        value = """
        SELECT new org.zpi.watchout.service.dto.AdminCommentsDTO(
            c.id,
            c.content,
            uAuthor.email,
            uAuthor.id,
            c.createdAt,
            c.isDeleted
        )
        FROM Comment c
        JOIN c.author uAuthor
        WHERE uAuthor.id = :authorId
    """
    )
    fun getAdminCommentsByAuthor(authorId: Long): List<AdminCommentsDTO>
}