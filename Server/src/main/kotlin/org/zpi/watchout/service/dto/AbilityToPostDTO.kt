package org.zpi.watchout.service.dto

enum class ReasonCannotPost {
    REPUTATION_RESTRICTION,
    DISTANCE_RESTRICTION
}

data class AbilityToPostDTO(
    val canPost: Boolean,
    val reason: String? = null
){
    constructor(
        reasonCannotPost: ReasonCannotPost,
    ) : this(
        canPost = false,
        reason = reasonCannotPost.name
    )
}
