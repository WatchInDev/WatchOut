package org.zpi.watchout.service.mapper

import org.springframework.stereotype.Component
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.service.dto.AuthorResponseDTO

@Component
class UserMapper {
    fun mapAuthorUserToDto(user: User): AuthorResponseDTO{
        return AuthorResponseDTO(
            id = user.id!!,
            name = user.name,
            lastname = user.lastName,
            reputation = user.reputation
        )
    }
}