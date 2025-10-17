package org.zpi.watchout.app.infrastructure.security

import org.springframework.context.annotation.Profile
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.UserRepository

@Component
class ProdAuthenticationConverter(val userRepository: UserRepository) : Converter<Jwt, UsernamePasswordAuthenticationToken> {
    override fun convert(source: Jwt): UsernamePasswordAuthenticationToken? {
        val externalId = source.getClaim<String>("sub")
        val user = userRepository.findByExternalId(externalId)
            .orElseThrow { EntityNotFoundException("User with external with id ${externalId} not found") }
        return UsernamePasswordAuthenticationToken(user.id, null, listOf())
    }
}