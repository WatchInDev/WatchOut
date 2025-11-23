package org.zpi.watchout.app.infrastructure.documentation

import io.swagger.v3.oas.annotations.security.SecurityScheme
import org.springframework.context.annotation.Configuration

@Configuration
@SecurityScheme(
    name = "bearerAuth",
    type = io.swagger.v3.oas.annotations.enums.SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    `in` = io.swagger.v3.oas.annotations.enums.SecuritySchemeIn.HEADER
)
class SwaggerConfig {
}