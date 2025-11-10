package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.data.repos.ElectricalOutageRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.data.repos.WeatherWarningRepository
import org.zpi.watchout.service.dto.ExternalWarningDTO


@Service
class ExternalWarningsService(val userFavouritePlaceRepository: UserFavouritePlaceRepository, val weatherWarningRepository: WeatherWarningRepository, val electricalOutageRepository: ElectricalOutageRepository) {
    fun getExternalWarning(userId: Long) : List<ExternalWarningDTO>{
        val favouritePlaces = userFavouritePlaceRepository.findByUserId(userId)
        val warnings = mutableListOf<ExternalWarningDTO>()
        favouritePlaces.forEach { fav -> {
            val updatedWarnings = weatherWarningRepository
                .findWeatherWarningByUsersFavouritePlace(fav.locality)
                .map { warning -> warning.apply { placeName = fav.placeName } }

            warnings.addAll(updatedWarnings)

            val updatedOutages = electricalOutageRepository.findElectricalOutageByFavouritePlace(fav.voivodeship, fav.location, fav.region)
                .map { outage -> outage.apply { placeName = fav.placeName } }
            warnings.addAll(updatedOutages)
        }}
        return warnings
    }
}