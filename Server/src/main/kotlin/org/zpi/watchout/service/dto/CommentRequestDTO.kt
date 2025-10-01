package org.zpi.watchout.service.dto

import jakarta.validation.constraints.NotBlank

data class CommentRequestDTO(
    @field:NotBlank(message = "Content must not be blank")
    val content: String
)
