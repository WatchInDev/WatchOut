package org.zpi.watchout.service.dto

data class OutagesResponse(val energa: Map<String, Map<String, List<OutageRecord>>>)
data class OutageRecord(val interval: Interval, val locations: List<String>)
data class Interval(val from_date: String, val to_date: String)