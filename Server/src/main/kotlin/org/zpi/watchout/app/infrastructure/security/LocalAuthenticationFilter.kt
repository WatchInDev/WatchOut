package org.zpi.watchout.app.infrastructure.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import org.zpi.watchout.data.enums.Role

@Component
@Profile("local")
class LocalAuthenticationFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        ///user
        val auth = UsernamePasswordAuthenticationToken(27L, null, listOf(Role.ROLE_USER))
        ///admin
//        val auth = UsernamePasswordAuthenticationToken(10000L, null, listOf(Role.ROLE_ADMIN))
        SecurityContextHolder.getContext().authentication = auth
        filterChain.doFilter(request, response)
    }
}