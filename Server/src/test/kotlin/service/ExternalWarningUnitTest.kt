package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.zpi.watchout.data.entity.*
import org.zpi.watchout.data.repos.*
import org.zpi.watchout.service.ExternalWarningsService
import org.zpi.watchout.service.dto.*

class ExternalWarningsServiceTest {

    private lateinit var userFavouritePlaceRepo: UserFavouritePlaceRepository
    private lateinit var weatherWarningRepo: WeatherWarningRepository
    private lateinit var outageRepo: ElectricalOutageRepository
    private lateinit var favouritePlacePrefRepo: UserFavouritePlacePreferenceRepository
    private lateinit var globalPrefRepo: UserGlobalPreferenceRepository

    private lateinit var service: ExternalWarningsService
    private val geometryFactory = GeometryFactory()

    @BeforeEach
    fun setup() {
        userFavouritePlaceRepo = mockk()
        weatherWarningRepo = mockk(relaxed = true)
        outageRepo = mockk(relaxed = true)
        favouritePlacePrefRepo = mockk()
        globalPrefRepo = mockk()

        service = ExternalWarningsService(
            userFavouritePlaceRepo,
            weatherWarningRepo,
            outageRepo,
            favouritePlacePrefRepo,
            globalPrefRepo
        )
    }

    @Test
    fun `getExternalWarning returns empty when global preference disabled`() {
        val userId = 1L
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf()
        every { globalPrefRepo.findByUserId(userId) } returns createGlobalPreference(userId, notifyOnExternalWarning = false)

        val result = service.getExternalWarning(userId)

        assertTrue(result.isEmpty())
        verify(exactly = 0) { weatherWarningRepo.findWeatherWarningByUsersFavouritePlace(any()) }
    }

    @Test
    fun `getExternalWarning returns empty when user global preference not found`() {
        val userId = 2L
        every { globalPrefRepo.findByUserId(userId) } returns null

        val result = service.getExternalWarning(userId)
        assertTrue(result.isEmpty())
    }

    @Test
    fun `getExternalWarning skips places where notificationEnabled is false`() {
        val userId = 3L
        val fav = createFavouritePlace(10L, "Home", "L1", "V1", "R1", "Loc1")

        every { globalPrefRepo.findByUserId(userId) } returns createGlobalPreference(userId, notifyOnExternalWarning = true)
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf(fav)

        every { favouritePlacePrefRepo.findByUserFavouritePlaceId(10L) } returns
                createFavouritePlacePreference(10L, notificationEnabled = false, weather = true, electricity = true)

        val result = service.getExternalWarning(userId)

        assertTrue(result.isEmpty())
        verify(exactly = 0) { weatherWarningRepo.findWeatherWarningByUsersFavouritePlace(any()) }
        verify(exactly = 0) { outageRepo.findElectricalOutageByFavouritePlace(any(), any(), any()) }
    }

    @Test
    fun `getExternalWarning collects only weather warnings when electricity disabled`() {
        val userId = 4L
        val fav = createFavouritePlace(11L, "FavPlace", "L2", "V2", "R2", "Loc2")

        every { globalPrefRepo.findByUserId(userId) } returns createGlobalPreference(userId, notifyOnExternalWarning = true)
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf(fav)

        every { favouritePlacePrefRepo.findByUserFavouritePlaceId(11L) } returns
                createFavouritePlacePreference(11L, notificationEnabled = true, weather = true, electricity = false)

        val w1 = createWeatherWarning("X", "Storm", "Desc")

        every { weatherWarningRepo.findWeatherWarningByUsersFavouritePlace("L2") } returns listOf(w1)

        val result = service.getExternalWarning(userId)

        assertEquals(1, result.size)
        assertEquals("FavPlace", result.first().placeName)

        verify { weatherWarningRepo.findWeatherWarningByUsersFavouritePlace("L2") }
        verify(exactly = 0) { outageRepo.findElectricalOutageByFavouritePlace(any(), any(), any()) }
    }

    @Test
    fun `getExternalWarning collects only electrical outages when weather disabled`() {
        val userId = 5L
        val fav = createFavouritePlace(12L, "Fav2", "L3", "V3", "R3", "Loc3")

        every { globalPrefRepo.findByUserId(userId) } returns createGlobalPreference(userId, notifyOnExternalWarning = true)
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf(fav)

        every { favouritePlacePrefRepo.findByUserFavouritePlaceId(12L) } returns
                createFavouritePlacePreference(12L, notificationEnabled = true, weather = false, electricity = true)

        val o1 = createElectricalOutage("V3", "R3", "Loc3", "P1")

        every { outageRepo.findElectricalOutageByFavouritePlace("V3", "Loc3", "R3") } returns listOf(o1)

        val result = service.getExternalWarning(userId)

        assertEquals(1, result.size)
        assertEquals("Fav2", result.first().placeName)

        verify { outageRepo.findElectricalOutageByFavouritePlace("V3", "Loc3", "R3") }
        verify(exactly = 0) { weatherWarningRepo.findWeatherWarningByUsersFavouritePlace(any()) }
    }

    @Test
    fun `getExternalWarning merges weather and outage warnings`() {
        val userId = 6L
        val fav = createFavouritePlace(13L, "Merged", "L4", "V4", "R4", "Loc4")

        every { globalPrefRepo.findByUserId(userId) } returns createGlobalPreference(userId, notifyOnExternalWarning = true)
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf(fav)

        every { favouritePlacePrefRepo.findByUserFavouritePlaceId(13L) } returns
                createFavouritePlacePreference(13L, notificationEnabled = true, weather = true, electricity = true)

        val w = createWeatherWarning("A", "Ice", "Cold")
        val o = createElectricalOutage("V4", "R4", "Loc4", "Z")

        every { weatherWarningRepo.findWeatherWarningByUsersFavouritePlace("L4") } returns listOf(w)
        every { outageRepo.findElectricalOutageByFavouritePlace("V4", "Loc4", "R4") } returns listOf(o)

        val result = service.getExternalWarning(userId)

        assertEquals(2, result.size)
        assertTrue(result.all { it.placeName == "Merged" })
    }

    @Test
    fun `saveWeatherWarnings clears repository and saves expanded warnings`() {
        val dto = WeatherDTO(
            nazwa_zdarzenia = "Storm",
            tresc = "Danger",
            obowiazuje_od = null,
            obowiazuje_do = null,
            powiaty = listOf("P1", "P2")
        )

        every { weatherWarningRepo.deleteAll() } just Runs
        every { weatherWarningRepo.saveAll(any()) } returnsArgument 0

        service.saveWeatherWarnings(listOf(dto))

        verify { weatherWarningRepo.deleteAll() }

        verify {
            weatherWarningRepo.saveAll(withArg<List<WeatherWarning>> { list ->
                assertEquals(2, list.size)
                assertEquals("P1", list[0].region)
                assertEquals("P2", list[1].region)
                assertEquals("Storm", list[0].event)
            })
        }
    }

    @Test
    fun `saveElectricalOutageWarning clears repository and saves all expanded outage records`() {
        val interval = OutageInterval(from_date = null, to_date = null)
        val record = OutageRecord(interval = interval, locations = listOf("LocA", "LocB"))

        val dto = ElectricalOutageRequestDTO(
            provider = "PWR",
            outagesResponse = mapOf(
                "Voiv1" to mapOf(
                    "Region1" to listOf(record)
                )
            )
        )

        every { outageRepo.deleteAll() } just Runs
        every { outageRepo.saveAll(any()) } returnsArgument 0

        service.saveElectricalOutageWarning(listOf(dto))

        verify { outageRepo.deleteAll() }

        verify {
            outageRepo.saveAll(withArg<List<ElectricalOutage>> { list ->
                assertEquals(2, list.size)
                assertEquals("Voiv1", list[0].voivodeship)
                assertEquals("Region1", list[0].region)
                assertEquals("LocA", list[0].location)
                assertEquals("LocB", list[1].location)
                assertEquals("PWR", list[0].provider)
            })
        }
    }

    private fun createGlobalPreference(userId: Long, notifyOnExternalWarning: Boolean) =
        UserGlobalPreference(
            userId = userId,
            notifyOnEvent = false,
            notifyOnComment = false,
            notifyOnExternalWarning = notifyOnExternalWarning,
            notifyOnUpdatedReputation = false
        )

    private fun createFavouritePlace(id: Long, placeName: String, locality: String, voivodeship: String, region: String, location: String) =
        UserFavouritePlace(
            userId = 1L,
            placeName = placeName,
            locality = locality,
            voivodeship = voivodeship,
            region = region,
            location = location,
            point = geometryFactory.createPoint(Coordinate(0.0, 0.0))
        ).apply {
            this.id = id
        }

    private fun createFavouritePlacePreference(placeId: Long, notificationEnabled: Boolean, weather: Boolean, electricity: Boolean) =
        UserFavouritePlacePreference(
            userFavouritePlaceId = placeId,
            notificationEnabled = notificationEnabled,
            eventTypes = emptySet(),
            radius = 5000.0,
            weather = weather,
            electricity = electricity
        )

    private fun createWeatherWarning(region: String, event: String, description: String) =
        WeatherWarning(
            region = region,
            event = event,
            description = description,
            fromDate = null,
            toDate = null
        )

    private fun createElectricalOutage(voivodeship: String, region: String, location: String, provider: String) =
        ElectricalOutage(
            voivodeship = voivodeship,
            region = region,
            location = location,
            provider = provider
        )
}