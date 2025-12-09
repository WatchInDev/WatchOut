package service

import io.mockk.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.transaction.annotation.Transactional
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ExternalWarningsServiceTest {

    private lateinit var userFavouritePlaceRepo: UserFavouritePlaceRepository
    private lateinit var weatherWarningRepo: WeatherWarningRepository
    private lateinit var outageRepo: ElectricalOutageRepository
    private lateinit var favouritePlacePrefRepo: UserFavouritePlacePreferenceRepository
    private lateinit var globalPrefRepo: UserGlobalPreferenceRepository

    private lateinit var service: ExternalWarningsService

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

    // -----------------------------------------------------------------------------------------
    // getExternalWarning()
    // -----------------------------------------------------------------------------------------

    @Test
    fun `getExternalWarning returns empty when global preference disabled`() {
        val userId = 1L
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf()
        every { globalPrefRepo.findByUserId(userId) } returns UserGlobalPreference(notifyOnExternalWarning = false)

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
        val fav = UserFavouritePlace(id = 10L, placeName = "Home", locality = "L1", voivodeship = "V1", region = "R1", location = "Loc1")

        every { globalPrefRepo.findByUserId(userId) } returns UserGlobalPreference(notifyOnExternalWarning = true)
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf(fav)

        every { favouritePlacePrefRepo.findByUserFavouritePlaceId(10L) } returns
                UserFavouritePlacePreference(notificationEnabled = false, weather = true, electricity = true)

        val result = service.getExternalWarning(userId)

        assertTrue(result.isEmpty())
        verify(exactly = 0) { weatherWarningRepo.findWeatherWarningByUsersFavouritePlace(any()) }
        verify(exactly = 0) { outageRepo.findElectricalOutageByFavouritePlace(any(), any(), any()) }
    }

    @Test
    fun `getExternalWarning collects only weather warnings when electricity disabled`() {
        val userId = 4L
        val fav = UserFavouritePlace(id = 11L, placeName = "FavPlace", locality = "L2", voivodeship = "V2", region = "R2", location = "Loc2")

        every { globalPrefRepo.findByUserId(userId) } returns UserGlobalPreference(notifyOnExternalWarning = true)
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf(fav)

        every { favouritePlacePrefRepo.findByUserFavouritePlaceId(11L) } returns
                UserFavouritePlacePreference(notificationEnabled = true, weather = true, electricity = false)

        val w1 = WeatherWarning(region = "X", event = "Storm", description = "Desc", fromDate = null, toDate = null)

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
        val fav = UserFavouritePlace(id = 12L, placeName = "Fav2", locality = "L3", voivodeship = "V3", region = "R3", location = "Loc3")

        every { globalPrefRepo.findByUserId(userId) } returns UserGlobalPreference(notifyOnExternalWarning = true)
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf(fav)

        every { favouritePlacePrefRepo.findByUserFavouritePlaceId(12L) } returns
                UserFavouritePlacePreference(notificationEnabled = true, weather = false, electricity = true)

        val o1 = ElectricalOutage(voivodeship = "V3", region = "R3", location = "Loc3", provider = "P1")

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
        val fav = UserFavouritePlace(id = 13L, placeName = "Merged", locality = "L4", voivodeship = "V4", region = "R4", location = "Loc4")

        every { globalPrefRepo.findByUserId(userId) } returns UserGlobalPreference(notifyOnExternalWarning = true)
        every { userFavouritePlaceRepo.findByUserId(userId) } returns listOf(fav)

        every { favouritePlacePrefRepo.findByUserFavouritePlaceId(13L) } returns
                UserFavouritePlacePreference(notificationEnabled = true, weather = true, electricity = true)

        val w = WeatherWarning(region = "A", event = "Ice", description = "Cold", fromDate = null, toDate = null)
        val o = ElectricalOutage(voivodeship = "V4", region = "R4", location = "Loc4", provider = "Z")

        every { weatherWarningRepo.findWeatherWarningByUsersFavouritePlace("L4") } returns listOf(w)
        every { outageRepo.findElectricalOutageByFavouritePlace("V4", "Loc4", "R4") } returns listOf(o)

        val result = service.getExternalWarning(userId)

        assertEquals(2, result.size)
        assertTrue(result.all { it.placeName == "Merged" })
    }


    // -----------------------------------------------------------------------------------------
    // saveWeatherWarnings()
    // -----------------------------------------------------------------------------------------

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
        every { weatherWarningRepo.saveAll(any<List<WeatherWarning>>()) } returnsArgument 0

        service.saveWeatherWarnings(listOf(dto))

        verify { weatherWarningRepo.deleteAll() }

        verify {
            weatherWarningRepo.saveAll(withArg { list ->
                assertEquals(2, list.size)
                assertEquals("P1", list[0].region)
                assertEquals("P2", list[1].region)
                assertEquals("Storm", list[0].event)
            })
        }
    }


    // -----------------------------------------------------------------------------------------
    // saveElectricalOutageWarning()
    // -----------------------------------------------------------------------------------------

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
        every { outageRepo.saveAll(any<List<ElectricalOutage>>()) } returnsArgument 0

        service.saveElectricalOutageWarning(listOf(dto))

        verify { outageRepo.deleteAll() }

        verify {
            outageRepo.saveAll(withArg { list ->
                assertEquals(2, list.size)
                assertEquals("Voiv1", list[0].voivodeship)
                assertEquals("Region1", list[0].region)
                assertEquals("LocA", list[0].location)
                assertEquals("LocB", list[1].location)
                assertEquals("PWR", list[0].provider)
            })
        }
    }
}
