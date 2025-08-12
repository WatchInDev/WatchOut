CREATE TABLE watchout.event_types (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            icon VARCHAR(50) NOT NULL,
                            description TEXT NOT NULL,
                            created_at TIMESTAMP NOT NULL DEFAULT now(),
                            updated_at TIMESTAMP DEFAULT now()
);


INSERT INTO watchout.event_types (name, icon, description, created_at, updated_at)
VALUES
    (
        'Wypadek komunikacyjny',
        'car-off',
        'Incydenty na drogach, które mogą zagrażać uczestnikom ruchu lub powodować poważne utrudnienia.',
        now(),
        now()
    ),
    (
        'Zagrożenie pożarowe',
        'fire',
        'Niebezpieczny, niekontrolowany ogień, zagrażający życiu, zdrowiu i mieniu, często z toksycznym dymem.',
        now(),
        now()
    ),
    (
        'Przerwy w dostawie prądu',
        'lightning-bolt',
        'Awaria energetyczna pozbawiająca prądu dany obszar, paraliżująca życie codzienne.',
        now(),
        now()
    ),
    (
        'Ekstremalne zjawiska pogodowe',
        'weather-lightning-rainy',
        'Silne burze, huragany, powodzie lub inne zjawiska atmosferyczne mogące powodować szkody.',
        now(),
        now()
    ),
    (
        'Zdarzenia masowe',
        'account-multiple',
        'Wydarzenia z dużą liczbą uczestników, które mogą prowadzić do zagrożeń zdrowotnych lub bezpieczeństwa.',
        now(),
        now()
    ),
    (
        'Zagrożenia chemiczne',
        'chemical-weapon',
        'Wyciek substancji chemicznych mogących zagrażać zdrowiu ludzi i środowisku.',
        now(),
        now()
    ),
    (
        'Zagrożenia biologiczne',
        'virus',
        'Zdarzenia związane z chorobami zakaźnymi lub innymi zagrożeniami biologicznymi.',
        now(),
        now()
    ),
    (
        'Zagrożenia radiacyjne',
        'biohazard',
        'Wyciek substancji radioaktywnych mogących zagrażać zdrowiu ludzi i środowisku.',
        now(),
        now()
    ),
    (
        'Zagrożenia terrorystyczne',
        'bomb',
        'Zdarzenia związane z atakami terrorystycznymi, które mogą zagrażać życiu i zdrowiu ludzi.',
        now(),
        now()
    ),
    (
        'Inne',
        'alert-circle',
        'Inne zdarzenia, które mogą zagrażać zdrowiu lub bezpieczeństwu ludzi.',
        now(),
        now()
    );