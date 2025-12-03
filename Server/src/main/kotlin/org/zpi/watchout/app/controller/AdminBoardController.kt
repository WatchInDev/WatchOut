package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.apache.coyote.Response
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.data.entity.Report
import org.zpi.watchout.service.AdminService
import org.zpi.watchout.service.dto.AdminCommentsDTO
import org.zpi.watchout.service.dto.AdminEventDTO
import org.zpi.watchout.service.dto.AdminUserDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Board", description = "Endpoints for admin board access")
class AdminBoardController(val adminService: AdminService) {
    @GetMapping("/check")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Access admin board", description = "Endpoint to verify access to the admin board for users with ADMIN role.")
    fun getAdminBoard(): ResponseEntity<Void> {
        logger.info { "Admin board accessed" }
        return ResponseEntity.status(HttpStatus.OK).build()
    }

    @GetMapping("/content/events")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch admin event content", description = "Endpoint to fetch event-related content for the admin board.")
    fun getAdminEventContent(): List<AdminEventDTO> {
        logger.info { "Fetching admin event content" }
        val content = adminService.getAdminEvents()
        logger.info { "Fetched ${content.size} admin event content items" }
        return content
    }

    @GetMapping("/content/events/{eventId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch specific admin event content by ID", description = "Endpoint to fetch specific event-related content for the admin board by event ID.")
    fun getAdminEventContentById(@PathVariable("eventId") eventId: Long): AdminEventDTO {
        logger.info { "Fetching admin event content for event ID: $eventId" }
        val content = adminService.getAdminEventById(eventId)
        logger.info { "Fetched admin event content for event ID: $eventId" }
        return content
    }

    @GetMapping("/content/users/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch admin user content", description = "Endpoint to fetch user-related content for the admin board.")
    fun getAdminUserContent(): List<AdminUserDTO> {
        logger.info { "Fetching admin user content" }
        val content = adminService.getAllUsers()
        logger.info { "Fetched ${content.size} admin user content items" }
        return content
    }

    @GetMapping("/content/users/banned")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch banned admin user content", description = "Endpoint to fetch banned user-related content for the admin board.")
    fun getBannedAdminUserContent(): List<AdminUserDTO> {
        logger.info { "Fetching banned admin user content" }
        val content = adminService.getAllBlockedUsers()
        logger.info { "Fetched ${content.size} banned admin user content items" }
        return content
    }

    @GetMapping("/content/comments/{commentId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch specific admin comment content by ID", description = "Endpoint to fetch specific comment-related content for the admin board by comment ID.")
    fun getAdminCommentContentById(@PathVariable("commentId") commentId: Long): AdminCommentsDTO {
        logger.info { "Fetching admin comment content for comment ID: $commentId" }
        val content = adminService.getAdminCommentsById(commentId)
        logger.info { "Fetched admin comment content for comment ID: $commentId" }
        return content
    }

    @PatchMapping("/actions/users/block/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Block a user", description = "Endpoint to block a user by their ID.")
    fun blockUser(@PathVariable("userId") userId: Long) {
        logger.info { "Blocking user with ID: $userId" }
        adminService.blockUser(userId)
        logger.info { "Blocked user with ID: $userId" }
    }

    @PatchMapping("/actions/users/unblock/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Unblock a user", description = "Endpoint to unblock a user by their ID.")
    fun unblockUser(@PathVariable("userId") userId: Long) {
        logger.info { "Unblocking user with ID: $userId" }
        adminService.unblockUser(userId)
        logger.info { "Unblocked user with ID: $userId" }
    }

    @PatchMapping("/actions/comments/delete/{commentId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Delete a comment", description = "Endpoint to delete a comment by its ID.")
    fun deleteComment(@PathVariable("commentId") commentId: Long) {
        logger.info { "Deleting comment with ID: $commentId" }
        adminService.deleteComment(commentId)
        logger.info { "Deleted comment with ID: $commentId" }
    }

    @PatchMapping("/actions/events/delete/{eventId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Deactivate an event", description = "Endpoint to deactivate an event by its ID.")
    fun deleteEvent(@PathVariable("eventId") eventId: Long) {
        logger.info { "Deleting event with ID: $eventId" }
        adminService.deleteEvent(eventId)
        logger.info { "Deleted event with ID: $eventId" }
    }

    @GetMapping("/content/reports")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch reports", description = "Endpoint to fetch all reports for the admin board.")
    fun getReports(): List<Report> {
        logger.info { "Fetching reports" }
        val reports = adminService.getReportedEvents()
        logger.info { "Fetched ${reports.size} reports" }
        return reports
    }

    @GetMapping("/content/user/events/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch events by user ID", description = "Endpoint to fetch all events  created by a specific user for the admin board.")
    fun getEventsByUserId(@PathVariable("userId") userId: Long): List<AdminEventDTO> {
        logger.info { "Fetching events for user ID: $userId" }
        val events = adminService.getAdminEventsByAuthor(userId)
        logger.info { "Fetched ${events.size} events for user ID: $userId" }
        return events
    }

    @GetMapping("/content/user/comments/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch comments by user ID", description = "Endpoint to fetch all comments created by a specific user for the admin board.")
    fun getCommentsByUserId(@PathVariable("userId") userId: Long): List<AdminCommentsDTO> {
        logger.info { "Fetching comments for user ID: $userId" }
        val comments = adminService.getAdminCommentsByAuthor(userId)
        logger.info { "Fetched ${comments.size} comments for user ID: $userId" }
        return comments
    }

    @GetMapping("/content/event/comments/{eventId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch comments by event ID", description = "Endpoint to fetch all comments for a specific event for the admin board.")
    fun getCommentsByEventId(@PathVariable("eventId") eventId: Long): List<AdminCommentsDTO> {
        logger.info { "Fetching comments for event ID: $eventId" }
        val comments = adminService.getAdminCommentByEventId(eventId)
        logger.info { "Fetched ${comments.size} comments for event ID: $eventId" }
        return comments
    }


    @GetMapping("/content/user/info/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Fetch user info by user ID", description = "Endpoint to fetch detailed information about a specific user for the admin board.")
    fun getUserInfoByUserId(@PathVariable("userId") userId: Long): AdminUserDTO {
        logger.info { "Fetching user info for user ID: $userId" }
        val userInfo = adminService.getUserById(userId)
        logger.info { "Fetched user info for user ID: $userId" }
        return userInfo
    }



}
