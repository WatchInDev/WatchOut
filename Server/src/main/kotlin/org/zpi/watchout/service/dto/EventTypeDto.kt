package org.zpi.watchout.service.dto

data class EventTypeDto(
    val id: Long,
    val name: String,
    val icon: String,
    val description: String
) {
}