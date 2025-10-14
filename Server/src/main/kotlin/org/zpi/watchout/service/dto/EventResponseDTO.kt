package org.zpi.watchout.service.dto

import java.time.LocalDateTime


data class EventResponseDTO(
    val id: Long,
    val name: String,
    val description : String,
    val image: String,
    val latitude: Double,
    val longitude: Double,
    val reportedDate: LocalDateTime,
    val endDate: LocalDateTime,
    val isActive: Boolean,
    val eventType: EventTypeDTO,
    val author: AuthorResponseDTO,
    val rating: Double,
    val ratingForCurrentUser: Int
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
        authorName: String,
        authorLastname: String,
        authorReputation: Double,
        rating: Double,
        ratingForCurrentUser: Int
    ) : this(
        id,
        name,
        description,
        image,
        point.y,
        point.x,
        reportedDate,
        endDate,
        isActive,
        EventTypeDTO(eventTypeId, eventTypeName, eventTypeIcon, eventTypeDescription),
        AuthorResponseDTO(authorId, authorName, authorLastname, authorReputation),
        rating,
        ratingForCurrentUser
    )
}