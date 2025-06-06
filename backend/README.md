# Quiz App Backend

Backend aplikacji Quiz App oparty na Node.js i Express.

## Funkcje

- Rejestracja i logowanie użytkowników
- CRUD pytań do quizu
- Historia rozwiązywanych quizów i egzaminów
- Przechowywanie danych w plikach JSON

## Uruchomienie

1. Przejdź do katalogu backend:

   ```
   cd quiz-app/backend
   ```

2. Zainstaluj zależności:
   ```
   npm install
   ```

### Uruchamianie aplikacji

Aby uruchomić serwer backendowy, użyj polecenia:

```
npm start
```

Serwer będzie działał pod adresem `http://localhost:3000`.

### Punkty końcowe API

- **Uwierzytelnianie**

  - `POST /api/auth/login`: Logowanie użytkownika
  - `POST /api/auth/register`: Rejestracja nowego użytkownika

- **Pytania**

  - `GET /api/questions`: Pobierz wszystkie pytania
  - `POST /api/questions`: Dodaj nowe pytanie
  - `PUT /api/questions/:id`: Edytuj istniejące pytanie
  - `DELETE /api/questions/:id`: Usuń pytanie

- **Użytkownicy**
  - `GET /api/users/history`: Pobierz historię użytkownika

### Struktura plików

- `src/app.js`: Punkt wejścia aplikacji
- `src/routes/`: Zawiera definicje tras
- `src/controllers/`: Zawiera logikę kontrolerów
- `src/middleware/`: Zawiera funkcje pośredniczące
- `src/utils/`: Zawiera funkcje pomocnicze do operacji na plikach
- `data/`: Zawiera pliki JSON dla pytań i danych użytkowników

### Wkład

Wkład w rozwój aplikacji jest mile widziany! Proszę otworzyć zgłoszenie lub przesłać pull request w celu wprowadzenia poprawek lub ulepszeń.

### Licencja

Ten projekt jest licencjonowany na podstawie licencji MIT.
