package org.zpi.watchout.app.infrastructure

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.service.dto.ExceptionDTO
import java.time.LocalDateTime

private val logger = KotlinLogging.logger {}

@RestControllerAdvice
class AppExceptionHandler {

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): ResponseEntity<ExceptionDTO> {
        val exceptionDto = ExceptionDTO(
            timestamp = LocalDateTime.now().toString(),
            message = ex.message ?: HttpStatus.INTERNAL_SERVER_ERROR.reasonPhrase,
            status = HttpStatus.INTERNAL_SERVER_ERROR.value()
        )
        logger.error(ex) { "An error occurred: ${ex.message}" }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(exceptionDto)
    }

    @ExceptionHandler(EntityNotFoundException::class)
    fun handleEntityNotFoundException(ex: EntityNotFoundException): ResponseEntity<ExceptionDTO> {
        val exceptionDto = ExceptionDTO(
            timestamp = LocalDateTime.now().toString(),
            message = ex.message ?: HttpStatus.NOT_FOUND.reasonPhrase,
            status = HttpStatus.NOT_FOUND.value()
        )
        logger.warn(ex) { "Entity not found: ${ex.message}" }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exceptionDto)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ExceptionDTO> {
        val errors = ex.bindingResult.allErrors.joinToString("; ") { it.defaultMessage ?: "Invalid value" }
        val exceptionDto = ExceptionDTO(
            timestamp = LocalDateTime.now().toString(),
            message = "Validation failed: $errors",
            status = HttpStatus.BAD_REQUEST.value()
        )
        logger.warn(ex) { "Validation error: $errors" }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exceptionDto)
    }


}