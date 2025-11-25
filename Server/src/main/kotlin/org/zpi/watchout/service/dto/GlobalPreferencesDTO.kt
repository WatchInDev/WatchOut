package org.zpi.watchout.service.dto

import jakarta.persistence.Column

data class GlobalPreferencesDTO(
    val notifyOnComment: Boolean,
    val notifyOnEvent: Boolean,
    val notifyOnExternalWarning: Boolean
)
