package org.zpi.watchout.service.dto

import java.time.LocalDateTime

data class WeatherDTO(
    val nazwa_zdarzenia: String,
    val prawdopodobienstwo: String,
    val obowiazuje_do: LocalDateTime,
    val obowiazuje_od: LocalDateTime,
    val opublikowano: String,
    val tresc: String,
    val komentarz: String,
    val biuro: String,
    val powiaty: List<String>
)