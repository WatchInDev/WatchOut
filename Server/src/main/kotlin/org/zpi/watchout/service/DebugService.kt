package org.zpi.watchout.service

import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.data.repos.UserRepository
import java.time.LocalDateTime
import kotlin.random.Random

@Service
@Profile("local")
class DebugService(val eventRepository: EventRepository, val eventTypeRepository: EventTypeRepository, val commentRepository: CommentRepository, val userRepository: UserRepository) {

    private val eventNames = listOf(
        "Wypadek komunikacyjny",
        "Zagrożenie pożarowe",
        "Przerwy w dostawie prądu",
        "Ekstremalne zjawiska pogodowe",
        "Zdarzenia masowe",
        "Zagrożenia chemiczne",
        "Zagrożenia biologiczne",
        "Zagrożenia radiacyjne",
        "Zagrożenia terrorystyczne",
        "Inne"
    )

    val eventDescriptions = mapOf(
        "Wypadek komunikacyjny" to "Incydenty na drogach, które mogą zagrażać uczestnikom ruchu lub powodować poważne utrudnienia.",
        "Zagrożenie pożarowe" to "Niebezpieczny, niekontrolowany ogień, zagrażający życiu, zdrowiu i mieniu, często z toksycznym dymem.",
        "Przerwy w dostawie prądu" to "Awaria energetyczna pozbawiająca prądu dany obszar, paraliżująca życie codzienne.",
        "Ekstremalne zjawiska pogodowe" to "Silne burze, huragany, powodzie lub inne zjawiska atmosferyczne mogące powodować szkody.",
        "Zdarzenia masowe" to "Wydarzenia z dużą liczbą uczestników, które mogą prowadzić do zagrożeń zdrowotnych lub bezpieczeństwa.",
        "Zagrożenia chemiczne" to "Wyciek substancji chemicznych mogących zagrażać zdrowiu ludzi i środowisku.",
        "Zagrożenia biologiczne" to "Zdarzenia związane z chorobami zakaźnymi lub innymi zagrożeniami biologicznymi.",
        "Zagrożenia radiacyjne" to "Wyciek substancji radioaktywnych mogących zagrażać zdrowiu ludzi i środowisku.",
        "Zagrożenia terrorystyczne" to "Zdarzenia związane z atakami terrorystycznymi, które mogą zagrażać życiu i zdrowiu ludzi.",
        "Inne" to "Inne zdarzenia, które mogą zagrażać zdrowiu lub bezpieczeństwu ludzi."
    )

    private val locations = mapOf(
        "WROCLAW" to Pair(51.107883, 17.038538),
        "KRAKOW" to Pair(50.064650, 19.944980),
        "GDANSK" to Pair(54.352025, 18.646638),
        "WARSZAWA" to Pair(52.229676, 21.012229),
        "POZNAN" to Pair(52.406374, 16.925168),
        "SZCZECIN" to Pair(53.428543, 14.552812),
        "LODZ" to Pair(51.759248, 19.455983),
        "LUBLIN" to Pair(51.246453, 22.568446),
        "BYDGOSZCZ" to Pair(53.123481, 18.008438),
        "KATOWICE" to Pair(50.264891, 19.023781)
    )

    val locationDiff = 0.15

    fun clearAllEvents() {
        eventRepository.deleteAll()
    }

    fun generateSampleEvents(number: Int) {
        val eventTypes : List<EventType> = eventTypeRepository.findAll()
        val events = mutableListOf<Event>()
        for (i in 1..number) {
            val randomEventType = eventTypes.random()
            val randomEventName = eventNames.random()
            val randomLocation = locations.values.random()
            val randomLatitude = randomLocation.first + Random.nextDouble(-locationDiff, locationDiff)
            val randomLongitude = randomLocation.second + Random.nextDouble(-locationDiff, locationDiff)

            val event = Event(
                name = randomEventName,
                description = eventDescriptions[randomEventName] ?: "Brak opisu",
                latitude = randomLatitude,
                longitude = randomLongitude,
                image = ByteArray(0),
                reportedDate = LocalDateTime.now().minusDays((0..10).random().toLong()),
                endDate = LocalDateTime.now().plusDays((1..10).random().toLong()),
                isActive = true,
                eventType = eventTypes.find { it.name == randomEventName } ?: randomEventType,
            )
            events.add(event)
        }
        eventRepository.saveAll(events)
    }

    fun generateSampleComments(number: Int, eventId: Long) {
        val comments = mutableListOf<Comment>()
        val event = eventRepository.findById(eventId).orElseThrow( { Exception("Event not found") } )
        val users = userRepository.findAll()
        for (i in 1..number) {
            val comment = Comment(
                content = "To jest przykładowy komentarz numer $i",
                author = users.random(),
                eventId = eventId
            )
            comments.add(comment)
        }
        commentRepository.saveAll(comments)
    }

    fun clearAllComments() {
        commentRepository.deleteAll()
    }

}