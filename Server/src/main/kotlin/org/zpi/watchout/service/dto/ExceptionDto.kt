package org.zpi.watchout.service.dto

data class ExceptionDto(
    val timestamp: String,
    val message: String,
    val status: Int,
) {
}