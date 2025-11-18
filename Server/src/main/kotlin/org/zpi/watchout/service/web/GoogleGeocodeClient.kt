package org.zpi.watchout.service.web

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.zpi.watchout.app.infrastructure.exceptions.GoogleGeocodeRequestError
import org.zpi.watchout.service.dto.GeocodeResponseDTO
import reactor.core.publisher.Mono
import java.util.concurrent.CompletableFuture

private val logger = KotlinLogging.logger {}

@Service
class GoogleGeocodeClient {
    val googleGeocodeClient: WebClient = WebClient.builder()
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .baseUrl("https://maps.googleapis.com/maps/api/geocode")
        .build()

        @Value("\${google.api.key}")
        private lateinit var apiKey: String

    fun getAddressFromCoordinates(lat: Double, lng: Double): GeocodeResponseDTO {
        val response = googleGeocodeClient.get()
            .uri { uriBuilder ->
                uriBuilder
                    .path("/json")
                    .queryParam("latlng", "$lat,$lng")
                    .queryParam("key", apiKey)
                    .build()
            }
            .retrieve()
            .bodyToMono(GeocodeResponseDTO::class.java)
            .doOnError { error ->
                logger.error { "Error fetching geocode data: ${error.message}" }
                throw GoogleGeocodeRequestError ("Failed to fetch geocode data")
            }
            .block()
        return response!!

    }


}