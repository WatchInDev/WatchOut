package org.zpi.watchout.service.dto

import java.time.LocalDateTime


data class EventResponseDTO(
    val id: Long,
    val name: String,
    val description : String,
    val image: ByteArray,
    val latitude: Double,
    val longitude: Double,
    val reportedDate: LocalDateTime,
    val endDate: LocalDateTime,
    val isActive: Boolean,
    val eventType: EventTypeDTO,
    val author: AuthorResponseDTO,
    val rating: Double
) {
    constructor(
        id: Long,
        name: String,
        description : String,
        image: ByteArray,
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
        rating: Double
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
        rating
    )
}