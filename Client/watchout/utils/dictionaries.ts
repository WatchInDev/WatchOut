import { PostUnabilityReason } from './types';

export const firebaseAuthErrorMessages: { [code: string]: string } = {
  // Klient ma już konto
  'auth/email-already-exists': 'Podany adres e-mail jest już zajęty przez istniejące konto.',
  'auth/email-already-in-use': 'Podany adres e-mail jest już zajęty przez istniejące konto.', // Duplikat/Alternatywa
  'auth/phone-number-already-exists':
    'Podany numer telefonu jest już używany przez innego użytkownika.',

  // Problemy z danymi wejściowymi
  'auth/invalid-email': 'Wprowadzono nieprawidłowy format adresu e-mail.',
  'auth/invalid-credential': 'Adres e-mail lub hasło są nieprawidłowe.',
  'auth/invalid-password': 'Hasło jest nieprawidłowe. Musi zawierać co najmniej 6 znaków.',
  'auth/weak-password': 'Hasło jest zbyt słabe. Użyj co najmniej 6 znaków.', // Dodano z Twojego przykładu

  // Problemy z kontem
  'auth/user-not-found': 'Nie znaleziono użytkownika dla podanych danych.',
  'auth/user-disabled': 'To konto użytkownika zostało zablokowane przez administratora.',
  'auth/wrong-password': 'Nieprawidłowe hasło.', // Dodano z Twojego przykładu

  // === Błędy Tokenów i Sesji ===
  'auth/id-token-expired': 'Sesja wygasła. Proszę zalogować się ponownie.',
  'auth/session-cookie-expired': 'Sesja wygasła. Proszę zalogować się ponownie.',
  'auth/id-token-revoked': 'Token sesji został unieważniony. Proszę zalogować się ponownie.',
  'auth/session-cookie-revoked': 'Token sesji został unieważniony. Proszę zalogować się ponownie.',

  // === Błędy Serwera i Limity ===
  'auth/too-many-requests':
    'Wykryto zbyt wiele nieudanych prób. Proszę spróbować ponownie później.',
  'auth/internal-error':
    'Wystąpił nieoczekiwany błąd serwera. Jeśli problem się powtarza, skontaktuj się ze wsparciem.',

  // === Błędy Konfiguracji i Argumentów ===
  'auth/invalid-argument': 'Wystąpił błąd danych. Proszę zweryfikować wprowadzone informacje.',
  'auth/operation-not-allowed': 'Metoda logowania jest wyłączona w ustawieniach projektu Firebase.',
  'auth/invalid-phone-number':
    'Wprowadzony numer telefonu jest nieprawidłowy (wymagany format E.164).',
  'auth/invalid-display-name': 'Nazwa użytkownika jest nieprawidłowa lub pusta.',
  'auth/unauthorized-continue-uri':
    'Domena przekierowania nie jest autoryzowana. Skontaktuj się z administratorem.',

  // === Błędy Admin SDK (rzadziej na kliencie) ===
  'auth/claims-too-large':
    'Nie można ustawić atrybutów: przekroczono limit rozmiaru (1000 bajtów).',
  'auth/uid-already-exists':
    'Wewnętrzny identyfikator UID jest już używany przez innego użytkownika.',

  // === Domyślne (catch-all) ===
  default: 'Wystąpił nieznany błąd autoryzacji. Spróbuj ponownie lub skontaktuj się ze wsparciem.',
};

export const unavailabilityDictionary: { [reason in PostUnabilityReason]: string } = {
  DISTANCE_RESTRICTION:
    'Nie możesz zgłosić zdarzenia ze swojej obecnej lokalizacji, ponieważ jest ona zbyt daleko od miejsca zdarzenia.',
  REPUTATION_RESTRICTION:
    'Nie możesz zgłosić nowego zdarzenia, ponieważ twoja reputacja jest zbyt niska. Spróbuj ponownie później.',
};
