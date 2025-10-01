package org.zpi.watchout.service.dto

data class AuthorResponseDTO(
    val id: Long,
    val name: String,
    val lastname: String,
    val reputation: Double,
) {
}