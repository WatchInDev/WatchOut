import { View, ScrollView, SafeAreaView } from "react-native";
import { Text } from "components/Base/Text";
import { Card, Icon } from "react-native-paper";

export const EventTypes = () => {
  const eventTypes = [
    {
      id: 1,
      name: "Wypadek komunikacyjny",
      description: "Incydenty na drogach, które mogą zagrażać uczestnikom ruchu lub powodować poważne utrudnienia.",
      iconName: "car-off"
    },
    {
      id: 2,
      name: "Zagrożenie pożarowe",
      description: "Niebezpieczny, niekontrolowany ogień, zagrażający życiu, zdrowiu i mieniu, często z toksycznym dymem.",
      iconName: "fire"
    },
    {
      id: 3,
      name: "Przerwy w dostawie prądu",
      description: "Awaria energetyczna pozbawiająca prądu dany obszar, paraliżująca życie codzienne. zdarzeń.",
      iconName: "lightning-bolt"
    },
    {
      id: 4,
      name: "Ekstremalne zjawiska pogodowe",
      description: "Silne burze, huragany, powodzie lub inne zjawiska atmosferyczne mogące powodować szkody.",
      iconName: "weather-lightning-rainy"
    },
    {
      id: 5,
      name: "Zdarzenia masowe",
      description: "Wydarzenia z dużą liczbą uczestników, które mogą prowadzić do zagrożeń zdrowotnych lub bezpieczeństwa.",
      iconName: "account-multiple"
    },
    {
      id: 6,
      name: "Zagrożenia chemiczne",
      description: "Wyciek substancji chemicznych mogących zagrażać zdrowiu ludzi i środowisku.",
      iconName: "chemical-weapon"
    },
    {
      id: 7,
      name: "Zagrożenia biologiczne",
      description: "Zdarzenia związane z chorobami zakaźnymi lub innymi zagrożeniami biologicznymi.",
      iconName: "virus"
    },
    {
      id: 8,
      name: "Zagrożenia radiacyjne",
      description: "Wyciek substancji radioaktywnych mogących zagrażać zdrowiu ludzi i środowisku.",
      iconName: "biohazard"
    },
    {
      id: 9,
      name: "Zagrożenia terrorystyczne",
      description: "Zdarzenia związane z atakami terrorystycznymi, które mogą zagrażać życiu i zdrowiu ludzi.",
      iconName: "bomb"
    },
    {
      id: 10,
      name: "Inne",
      description: "Inne zdarzenia, które mogą zagrażać zdrowiu lub bezpieczeństwu ludzi.",
      iconName: "alert-circle"
    }
  ];

  return (
    <SafeAreaView className='flex-1 px-3'>
      <Text className='text-5xl font-semibold py-8 text-center tracking-normal'>Rodzaje zdarzeń</Text>
      <ScrollView>
        {eventTypes.map((event) => (
          <Card key={event.id} mode="contained" className='flex-1 mb-4 px-4 py-4'>
            <View className='flex flex-row items-center gap-4'>
              <Icon source={event.iconName} size={64} />
              <View className="flex-1">
                <Text className='text-2xl font-bold'>{event.name}</Text>
                <Text className='font-light'>{event.description}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}