package org.zpi.watchout.service.dto

import java.time.LocalDateTime


data class EventResponseDTO(
    val id: Long,
    val name: String,
    val description : String,
    val images: List<String>,
    val latitude: Double,
    val longitude: Double,
    val reportedDate: LocalDateTime,
    val endDate: LocalDateTime,
    val isActive: Boolean,
    val eventType: EventTypeDTO,
    val author: AuthorResponseDTO,
    val rating: Double,
    val ratingForCurrentUser: Int,
    val isAuthor : Boolean
) {
    constructor(
        id: Long,
        name: String,
        description : String,
        image: String,
        point: org.locationtech.jts.geom.Point,
        reportedDate: LocalDateTime,
        endDate: LocalDateTime,
        isActive: Boolean,
        eventTypeId: Long,
        eventTypeName: String,
        eventTypeIcon: String,
        eventTypeDescription: String,
        authorId: Long,
        authorReputation: Double,
        rating: Double,
        ratingForCurrentUser: Int,
        isAuthor : Boolean
    ) : this(
        id,
        name,
        description,
        image.split(","),
        point.y,
        point.x,
        reportedDate,
        endDate,
        isActive,
        EventTypeDTO(eventTypeId, eventTypeName, eventTypeIcon, eventTypeDescription),
        AuthorResponseDTO(authorId,  authorReputation),
        rating,
        ratingForCurrentUser,
        isAuthor
    )
}