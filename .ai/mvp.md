# Aplikacja - Co się dzieje w Polsce? (MVP)

## Główny problem

Obywatele nie mają łatwego dostępu do informacji o zmianach w prawie.  
Nie są na bieżąco informowani o nowych ustawach i rozporządzeniach z
wiarygodnych, obiektywnych źródeł.  
Treść aktów prawnych jest trudna w odbiorze, a brak wiedzy o tym, jak głosują
poszczególne partie, ogranicza transparentność procesu legislacyjnego.

## Proponowane rozwiązanie

Aplikacja prezentująca w przystępnej formie najważniejsze zmiany w prawie –
skrócone, wyjaśnione i zrozumiałe dla każdego użytkownika.  
Każda publikacja zawiera:

- streszczenie aktu prawnego w prostym języku,
- wyjaśnienie wpływu zmian na obywateli,
- informacje o wynikach głosowań i stanowiskach partii.

## Najmniejszy zestaw funkcjonalności (MVP)

- Możliwość rejestracji i logowania użytkownika.
- Dostęp do listy ustaw i rozporządzeń z krótkimi podsumowaniami.
- Limit dostępu: anonimowy użytkownik może przeczytać 3 podsumowania (w
  localStorage), po czym zostaje zablokowany. Zalogowani użytkownicy mają
  zwiększony limit (5).
- Konto **admina** z uprawnieniami do edycji treści ustaw.

## Co NIE wchodzi w zakres MVP

- System płatności lub subskrypcji.
- Generowanie podsumowań na platformy społecznościowe.
- Zaawansowane funkcje personalizacji lub rekomendacji treści.

## Kryteria sukcesu

- Działająca aplikacja, umożliwiająca przeglądanie i wyświetlanie ustaw.
- Stabilny i przetestowany backend przetwarzający dane legislacyjne.
- Użytkownicy mogą łatwo zrozumieć podstawowe zmiany w prawie dzięki
  uproszczonym podsumowaniom.
