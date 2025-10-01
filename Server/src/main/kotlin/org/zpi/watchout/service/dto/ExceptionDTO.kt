package org.zpi.watchout.service.dto

data class ExceptionDTO(
    val timestamp: String,
    val message: String,
    val status: Int,
) {
}