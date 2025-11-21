package org.zpi.watchout.service.dto

data class UserCreateRequestDTO(
    val firebaseUid: String,
    val email: String,
    val displayName: String
) {
}