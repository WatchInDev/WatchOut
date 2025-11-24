package org.zpi.watchout.service.schedule

import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.zpi.watchout.data.entity.ElectricalOutage
import org.zpi.watchout.data.entity.WeatherWarning
import org.zpi.watchout.data.repos.ElectricalOutageRepository
import org.zpi.watchout.data.repos.UserFavouritePlacePreferenceRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.data.repos.WeatherWarningRepository
import org.zpi.watchout.data.repos.impl.ElectricalOutagesJdbcRepositoryInterface
import org.zpi.watchout.data.repos.impl.WeatherWarningsJdbcRepository
import org.zpi.watchout.service.NotificationService
import org.zpi.watchout.service.NotificationType
import org.zpi.watchout.service.dto.OutageRecord
import org.zpi.watchout.service.dto.OutagesResponse
import org.zpi.watchout.service.dto.WeatherDTO
import java.io.BufferedReader
import java.io.InputStreamReader

private val logger = KotlinLogging.logger {}

@Service
class ExternalDataGetSchedule(private val weatherWarningRepository: WeatherWarningRepository, private val electricalOutageRepository: ElectricalOutageRepository, val userRepository: UserRepository, val notificationService: NotificationService, val usersFavouritePlaceRepository: UserFavouritePlaceRepository,val userFavouritePlacePreferenceRepository: UserFavouritePlacePreferenceRepository, val userGlobalPreferenceRepository: UserGlobalPreferenceRepository) {

        @Scheduled(cron = "\${scheduler.get.external.data.time}")
    fun sendNotifications() {
            logger.info { "Sending notifications for external warnings..." }
            val users = userRepository.findAll()
            for (user in users) {
                val userPreferences = userGlobalPreferenceRepository.findByUserId(user.id!!)

                if (userPreferences?.notifyOnExternalWarning != true) {
                    continue
                }

                val favouritePlaces = usersFavouritePlaceRepository.findByUserId(user.id!!)
                for (fav in favouritePlaces) {
                    val warnings = mutableListOf<Any>()

                    val placePreferences = userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(fav.id!!)
                    if (placePreferences?.notificationEnabled != true) {
                        continue
                    }

                    if(placePreferences.weather){
                        val weatherWarnings = weatherWarningRepository.findWeatherWarningByUsersFavouritePlace(fav.locality)
                            .map { warning -> warning.apply { placeName = fav.placeName } }
                        warnings.addAll(weatherWarnings)
                    }

                    if(placePreferences.electricity) {
                        val electricalOutages = electricalOutageRepository.findElectricalOutageByFavouritePlace(fav.voivodeship, fav.location, fav.region)
                            .map { outage -> outage.apply { placeName = fav.placeName } }
                        warnings.addAll(electricalOutages)
                    }

                    for (warning in warnings) {
                        notificationService.createNotification(
                            NotificationType.EXTERNAL_WARNING,
                            user.id!!,
                            when (warning) {
                                is WeatherWarning -> warning.event
                                is ElectricalOutage -> "Problem z prądem"
                                else -> "External Warning"
                            },
                            fav.placeName
                        )
                    }
                }

            }


        }
}