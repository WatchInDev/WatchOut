package org.zpi.watchout.service.dto

data class EventTypeDTO(
    val id: Long,
    val name: String,
    val icon: String,
    val description: String
) {
}