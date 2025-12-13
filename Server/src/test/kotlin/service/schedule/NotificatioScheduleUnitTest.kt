package service.schedule

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Point
import org.zpi.watchout.data.entity.ElectricalOutage
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.data.entity.UserFavouritePlacePreference
import org.zpi.watchout.data.entity.UserGlobalPreference
import org.zpi.watchout.data.entity.WeatherWarning
import org.zpi.watchout.data.repos.ElectricalOutageRepository
import org.zpi.watchout.data.repos.UserFavouritePlacePreferenceRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.data.repos.WeatherWarningRepository
import org.zpi.watchout.service.NotificationService
import org.zpi.watchout.service.NotificationType
import org.zpi.watchout.service.dto.ElectricalOutageDTO
import org.zpi.watchout.service.dto.WeatherWarningDTO
import org.zpi.watchout.service.schedule.ExternalDataGetSchedule
import java.sql.Timestamp
import java.time.LocalDateTime

class ExternalDataGetScheduleTest {

    private val weatherWarningRepository: WeatherWarningRepository = mockk()
    private val electricalOutageRepository: ElectricalOutageRepository = mockk()
    private val userRepository: UserRepository = mockk()
    private val notificationService: NotificationService = mockk(relaxed = true)
    private val usersFavouritePlaceRepository: UserFavouritePlaceRepository = mockk()
    private val userFavouritePlacePreferenceRepository: UserFavouritePlacePreferenceRepository = mockk()
    private val userGlobalPreferenceRepository: UserGlobalPreferenceRepository = mockk()

    private val schedule = ExternalDataGetSchedule(
        weatherWarningRepository,
        electricalOutageRepository,
        userRepository,
        notificationService,
        usersFavouritePlaceRepository,
        userFavouritePlacePreferenceRepository,
        userGlobalPreferenceRepository
    )

    @Test
    fun `sendNotifications creates notifications when preferences allow and warnings exist`() {
        val user = User(
            name = "dwadwad",
            email = "dads",
            reputation = 0.25,
            externalId = "dwada"
        ).apply {
            id = 1L
        }
        every { userRepository.findAll() } returns listOf(user)

        val globalPref = UserGlobalPreference(userId = 1L, notifyOnExternalWarning = true)
        every { userGlobalPreferenceRepository.findByUserId(1L) } returns globalPref

        val fav = UserFavouritePlace(
            userId = 1L,
            placeName = "Home",
            locality = "CityX",
            voivodeship = "VoivX",
            location = "LocX",
            region = "RegX",
            point = mockk<Point>()
        ).apply {
            id = 10L
        }
        every { usersFavouritePlaceRepository.findByUserId(1L) } returns listOf(fav)

        val placePref = UserFavouritePlacePreference(
            userFavouritePlaceId = 10L,
            notificationEnabled = true,
            weather = true,
            electricity = true,
            eventTypes = emptyList(),
            radius = 10.0
        ).apply {
            id = 1000L
        }
        every { userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(10L) } returns placePref

        val weather = WeatherWarningDTO(
            name = "Storm",
            locality = "City",
            description = "Severe storm warning",
            fromDate = Timestamp.valueOf(LocalDateTime.now()),
            toDate = Timestamp.valueOf(LocalDateTime.now().plusHours(2))
        )
        val outage = ElectricalOutageDTO(
            provider = "Problem z prądem",
            location = "LocX",
            fromDate = Timestamp.valueOf(LocalDateTime.now()),
            toDate = Timestamp.valueOf(LocalDateTime.now().plusHours(2))
        )

        every { weatherWarningRepository.findWeatherWarningByUsersFavouritePlace("CityX") } returns listOf(weather)
        every { electricalOutageRepository.findElectricalOutageByFavouritePlace("VoivX", "LocX", "RegX") } returns listOf(outage)

        schedule.sendNotifications()

        verify {
            notificationService.createNotification(
                NotificationType.EXTERNAL_WARNING,
                1L,
                "External Warning",
                "Home"
            )
        }
        verify {
            notificationService.createNotification(
                NotificationType.EXTERNAL_WARNING,
                1L,
                "External Warning",
                "Home"
            )
        }
    }

    @Test
    fun `sendNotifications does nothing when global or place preferences disable notifications`() {
        val user = User(
            name = "dwadwad",
            email = "dads",
            reputation = 0.25,
            externalId = "dwada"
        ).apply {
            id = 1L
        }
        every { userRepository.findAll() } returns listOf(user)

        val globalPrefDisabled = UserGlobalPreference(userId = 1L, notifyOnExternalWarning = false)
        every { userGlobalPreferenceRepository.findByUserId(1L) } returns globalPrefDisabled

        schedule.sendNotifications()

        verify(exactly = 0) { usersFavouritePlaceRepository.findByUserId(any()) }
        verify(exactly = 0) { notificationService.createNotification(any(), any(), any(), any()) }

        val globalPrefEnabled = UserGlobalPreference(userId = 1L, notifyOnExternalWarning = true)
        every { userGlobalPreferenceRepository.findByUserId(1L) } returns globalPrefEnabled

        val fav = UserFavouritePlace(
            userId = 1L,
            placeName = "Home",
            locality = "CityX",
            voivodeship = "VoivX",
            location = "LocX",
            region = "RegX",
            point = mockk<Point>()
        ).apply {
            id = 10L
        }
        every { usersFavouritePlaceRepository.findByUserId(1L) } returns listOf(fav)

        val placePref = UserFavouritePlacePreference(
            userFavouritePlaceId = 10L,
            notificationEnabled = false,
            weather = true,
            electricity = true,
            eventTypes = emptyList(),
            radius = 10.0
        ).apply {
            id = 1000L
        }
        every { userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(10L) } returns placePref

        schedule.sendNotifications()

        verify(exactly = 0) { weatherWarningRepository.findWeatherWarningByUsersFavouritePlace(any()) }
        verify(exactly = 0) { electricalOutageRepository.findElectricalOutageByFavouritePlace(any(), any(), any()) }
        verify(exactly = 0) { notificationService.createNotification(any(), any(), any(), any()) }
    }
}