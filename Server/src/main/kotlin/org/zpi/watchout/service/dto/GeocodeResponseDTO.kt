package org.zpi.watchout.service.dto

data class GeocodeResponseDTO(
    val results: List<Result>
)

data class Result(
    val address_components: List<AddressComponent>
)

data class AddressComponent(
    val long_name: String,
    val short_name: String,
    val types: List<String>
)
