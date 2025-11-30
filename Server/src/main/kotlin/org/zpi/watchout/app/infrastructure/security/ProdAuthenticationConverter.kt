package org.zpi.watchout.app.infrastructure.security

import org.springframework.context.annotation.Profile
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import org.zpi.watchout.app.infrastructure.exceptions.AccessDeniedException
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.enums.Role
import org.zpi.watchout.data.repos.AdminRepository
import org.zpi.watchout.data.repos.UserRepository

@Component
class ProdAuthenticationConverter(val userRepository: UserRepository, val adminRepository: AdminRepository) : Converter<Jwt, UsernamePasswordAuthenticationToken> {
    override fun convert(source: Jwt): UsernamePasswordAuthenticationToken? {
        val request = (RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes)?.request
        val externalId = source.getClaim<String>("sub")

        if (request?.requestURI == "/api/v1/users/create") {
            return UsernamePasswordAuthenticationToken(externalId, null, listOf())
        }

        var token : UsernamePasswordAuthenticationToken? = null
        userRepository.findByExternalId(externalId).ifPresent {
            if(it.isBlocked){
                throw AccessDeniedException("User is blocked")
            }
            token = UsernamePasswordAuthenticationToken(it.id, null, listOf(Role.ROLE_USER))
        }

        if(token == null){
            adminRepository.findByExternalId(externalId).orElseThrow { EntityNotFoundException("User not found") }
            token = UsernamePasswordAuthenticationToken(10000, null, listOf(Role.ROLE_ADMIN))
        }
        return token


    }
}