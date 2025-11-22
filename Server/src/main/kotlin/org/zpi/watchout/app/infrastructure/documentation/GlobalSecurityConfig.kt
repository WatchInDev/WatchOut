package org.zpi.watchout.app.infrastructure.documentation

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import org.springframework.context.annotation.Configuration

@Configuration
@OpenAPIDefinition(security = [SecurityRequirement(name = "bearerAuth")])
class GlobalSecurityConfig {
}