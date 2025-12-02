package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.data.entity.ElectricalOutage
import org.zpi.watchout.data.entity.WeatherWarning
import org.zpi.watchout.data.repos.ElectricalOutageRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.data.repos.WeatherWarningRepository
import org.zpi.watchout.data.repos.impl.ElectricalOutageJdbcRepositoryInterface
import org.zpi.watchout.data.repos.impl.WeatherWarningJdbcRepositoryInterface
import org.zpi.watchout.service.dto.ElectricalOutageDTO
import org.zpi.watchout.service.dto.ElectricalOutageRequestDTO
import org.zpi.watchout.service.dto.ExternalWarningDTO
import org.zpi.watchout.service.dto.OutageRecord
import org.zpi.watchout.service.dto.OutagesResponse
import org.zpi.watchout.service.dto.WeatherDTO


@Service
class ExternalWarningsService(val userFavouritePlaceRepository: UserFavouritePlaceRepository, val weatherWarningRepository: WeatherWarningRepository, val electricalOutageRepository: ElectricalOutageRepository, val weatherWarningRepositoryJdbc: WeatherWarningJdbcRepositoryInterface, val electricalOutageRepositoryJdbc: ElectricalOutageJdbcRepositoryInterface) {
    fun getExternalWarning(userId: Long) : List<ExternalWarningDTO>{
        val favouritePlaces = userFavouritePlaceRepository.findByUserId(userId)
        val warnings = mutableListOf<ExternalWarningDTO>()
        favouritePlaces.forEach { fav ->
            val updatedWarnings = weatherWarningRepository
                .findWeatherWarningByUsersFavouritePlace(fav.locality)
                .map { warning -> warning.apply { placeName = fav.placeName } }

            warnings.addAll(updatedWarnings)

            val updatedOutages = electricalOutageRepository.findElectricalOutageByFavouritePlace(fav.voivodeship, fav.location, fav.region)
                .map { outage -> outage.apply { placeName = fav.placeName } }
            warnings.addAll(updatedOutages)
        }
        return warnings
    }

    @Transactional
    fun saveWeatherWarnings(result :List<WeatherDTO>) {
        weatherWarningRepository.deleteAll()
        val weatherWarnings : MutableList<WeatherWarning> = mutableListOf<WeatherWarning>()

        for(event in result) {
            for(region in event.powiaty) {
                val warning = WeatherWarning(
                    region = region,
                    event = event.nazwa_zdarzenia,
                    description = event.tresc,
                    fromDate = event.obowiazuje_od,
                    toDate = event.obowiazuje_do
                )
                weatherWarnings.add(warning)
            }
        }

        weatherWarningRepository.saveAll(weatherWarnings)
    }

    @Transactional
    fun saveElectricalOutageWarning(results: List<ElectricalOutageRequestDTO>){
        electricalOutageRepository.deleteAll()
        val outagesToSave : MutableList<ElectricalOutage> = mutableListOf<ElectricalOutage>()
        for(result in results){
            for (key in result.outagesResponse.keys) {
                val voivodshipOutages: Map<String, List<OutageRecord>> = result.outagesResponse[key] ?: continue
                for (subKey in voivodshipOutages.keys) {
                    val outageRecords: List<OutageRecord> = voivodshipOutages[subKey] ?: continue
                    for (record in outageRecords) {
                        for(location in record.locations) {
                            val outage = ElectricalOutage(
                                provider = result.provider,
                                voivodeship = key,
                                region = subKey,
                                fromDate = record.interval.from_date,
                                toDate = record.interval.to_date,
                                location = location
                            )
                            outagesToSave.add(outage)
                        }
                    }
                }
            }
        }
        electricalOutageRepository.saveAll(outagesToSave)

    }
}