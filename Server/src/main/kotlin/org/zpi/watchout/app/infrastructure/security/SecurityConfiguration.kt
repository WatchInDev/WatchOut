package org.zpi.watchout.app.infrastructure.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfiguration(
    private val converter: Converter<Jwt, UsernamePasswordAuthenticationToken>
) {

    companion object {
        private val WHITE_LIST_URL = arrayOf(
            "/api/v1/auth/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/api/v1/internal/**"
        )
    }

    @Bean
    @Profile("prod")
    fun securityFilterChainProd(http: HttpSecurity): SecurityFilterChain {
        http.csrf { csrf -> csrf.disable() }
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests { req ->
                req.requestMatchers(*WHITE_LIST_URL)
                    .permitAll()
                    .anyRequest()
                    .authenticated()
            }
            .sessionManagement { session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt -> jwt.jwtAuthenticationConverter(converter) }
            }
            .headers { headers ->
                headers.frameOptions { frame -> frame.disable() }
            }

        return http.build()
    }

    @Bean
    @Profile("local")
    fun securityFilterChainLocal(http: HttpSecurity): SecurityFilterChain {
        http.csrf { it.disable() }
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests { it.anyRequest().permitAll() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        return http.build()
    }
}