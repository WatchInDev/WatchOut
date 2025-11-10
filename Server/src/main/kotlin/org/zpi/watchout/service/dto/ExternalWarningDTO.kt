package org.zpi.watchout.service.dto

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = WeatherWarningDTO::class, name = "weather"),
    JsonSubTypes.Type(value = ElectricalOutageDTO::class, name = "electrical_outage")
)
class ExternalWarningDTO(var placeName: String = "") {

}