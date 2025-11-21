package org.zpi.watchout.service.dto

import java.time.LocalDate
import java.time.LocalDateTime

typealias OutagesResponse = Map<String, Map<String, List<OutageRecord>>>

data class OutageRecord(
    val interval: Interval,
    val locations: List<String>
)

data class Interval(
    val from_date: LocalDateTime,
    val to_date: LocalDateTime
)