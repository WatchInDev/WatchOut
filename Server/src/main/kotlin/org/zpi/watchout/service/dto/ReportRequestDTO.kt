package org.zpi.watchout.service.dto

import jakarta.persistence.Column

data class ReportRequestDTO(
    val reason: String,
    val reporterId: Long,
    val reportedObjectId: Long,
    val reportedObject: String
)
