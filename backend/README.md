# Quiz App – Backend

Wydajny, skalowalny backend dla aplikacji quizowej, zbudowany w oparciu o **Node.js**, **Express** i **MongoDB**. Zapewnia REST API do zarządzania pytaniami, użytkownikami, uwierzytelnianiem i statystykami.

---

## 🚀 Kluczowe Funkcje

- **Uwierzytelnianie JWT**: Bezpieczna rejestracja i logowanie z wykorzystaniem tokenów JWT oraz hashowaniem haseł (`bcrypt`).
- **Zaawansowane Zarządzanie Pytaniami**: Pełen CRUD z automatycznym, sekwencyjnym nadawaniem ID nowym pytaniom.
- **Import/Eksport do Excela**: Masowy import i eksport pytań przez pliki `.xlsx`.
- **Panel Administratora**: Endpointy do zarządzania użytkownikami (zmiana ról) i bazą pytań (grupowe usuwanie, czyszczenie bazy).
- **Kolejkowanie zapytań**: Proxy-model oraz Agenda zapewniają bezpieczne i wydajne kolejkowanie operacji na pytaniach.
- **Szczegółowa Historia Użytkownika**: Śledzenie historii quizów (`history`) i odpowiedzi (`hquestion`).
- **Statystyki i Cache'owanie**: Dynamiczne statystyki (liczba pytań, podział na kategorie) z cache'owaniem w pamięci.
- **Wyszukiwanie i Filtrowanie**: Wyszukiwanie pytań po ID lub treści, filtrowanie po kategorii.
- **Personalizacja Użytkownika**: Obsługa awatarów, kolorów, motywów i ukrytych kategorii.
- **Optymalizacja**: Kompresja odpowiedzi HTTP (`gzip`), limity na zapytania, rate limiting, walidacja danych wejściowych.

---

## 🛠️ Technologie

- **Framework**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Baza Danych**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Kolejkowanie**: [Agenda](https://github.com/agenda/agenda)
- **Uwierzytelnianie**: [jsonwebtoken](https://jwt.io/), [bcrypt](https://www.npmjs.com/package/bcrypt)
- **Obsługa Plików**: [ExcelJS](https://github.com/exceljs/exceljs), [Multer](https://github.com/expressjs/multer)
- **Optymalizacja**: [compression](https://www.npmjs.com/package/compression), [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- **Cache**: Prosty cache w pamięci (utils/cache.js)
- **Zmienne Środowiskowe**: [dotenv](https://www.npmjs.com/package/dotenv)

---

## 📁 Struktura Projektu

```
backend/
├── data/                # Przykładowe dane do importu (JSON)
├── src/
│   ├── app.js           # Główny plik serwera, konfiguracja Express i middleware
│   ├── config/          # Konfiguracja połączenia z bazą danych
│   ├── controllers/     # Logika biznesowa dla endpointów
│   ├── jobs/            # Kolejkowanie zadań (Agenda)
│   ├── middleware/      # Middleware (np. JWT)
│   ├── models/          # Schematy Mongoose (User, Question, Stats)
│   ├── routes/          # Definicje tras API
│   └── utils/           # Funkcje pomocnicze (np. cache)
├── uploads/             # Tymczasowe pliki (opcjonalnie)
├── .env                 # Zmienne środowiskowe
├── importData.js        # Skrypt do importu danych
├── package.json
└── README.md
```

---

## ⚡ Instalacja i Uruchomienie

1.  **Sklonuj repozytorium** i przejdź do katalogu `backend`.

2.  **Zainstaluj zależności**:

    ```bash
    npm install
    ```

3.  **Skonfiguruj zmienne środowiskowe** w pliku `.env`:

    ```env
    JWT_SECRET=twoj_super_tajny_klucz_jwt
    MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/quizapp
    PORT=3000
    # Opcjonalnie: wymuszaj kod zaproszenia przy rejestracji
    REGISTRATION_INVITE_CODE=twoj_kod
    ```

4.  **(Opcjonalnie) Zaimportuj dane startowe**:

    ```bash
    node importData.js
    ```

5.  **Uruchom serwer**:
    - Produkcyjnie:
      ```bash
      npm start
      ```
    - Dewelopersko:
      ```bash
      npm run dev
      ```

Serwer będzie dostępny pod adresem `http://localhost:3000`.

---

## 🔗 Dokumentacja API

### Autoryzacja (`/api/auth`)

- `POST /register`: Rejestracja nowego użytkownika (jeśli ustawiono `REGISTRATION_INVITE_CODE`, wymagany `inviteCode`).
- `POST /login`: Logowanie i uzyskanie tokena JWT.
- `POST /logout`: Wylogowanie (usuwa token po stronie klienta).

### Pytania (`/api/questions`)

> Odczyty wymagają JWT; zapis, edycja, usuwanie, import/eksport — rola `admin`.

- `GET /`: Pobieranie pytań z paginacją (`?page=1&limit=20`).
- `GET /?ids=1,2,3`: Pobieranie pytań po ID.
- `GET /search?query=...`: Wyszukiwanie pytań po ID lub treści (zabezpieczenie regex).
- `GET /category/:category`: Pobieranie pytań z danej kategorii.
- `POST /`: Dodawanie nowego pytania (wymaga autoryzacji).
- `PUT /:id`: Aktualizacja pytania (wymaga autoryzacji).
- `DELETE /:id`: Usunięcie pytania (wymaga autoryzacji).
- `GET /export/excel`: Eksport pytań do `.xlsx` (wymaga autoryzacji).
- `POST /import/excel`: Import pytań z `.xlsx` (wymaga autoryzacji, `multipart/form-data`).
- `POST /clear`: Usunięcie **wszystkich** pytań (admin).
- `DELETE /category/:category`: Usunięcie wszystkich pytań z kategorii (admin).

### Użytkownicy (`/api/users`)

- `GET /me`: Dane zalogowanego użytkownika.
- `PUT /update-profile`: Aktualizacja profilu (hasło, awatar, historia, opcje).
- `GET /history`: Historia quizów użytkownika.
- `GET /hquestion`: Historia odpowiedzi na pytania.
- `POST /hquestion`: Zapis/aktualizacja odpowiedzi na pytanie.
- `PUT /clear-category`: Wyczyść odpowiedzi (`hquestion`) dla kategorii.
- `GET /all`: Lista wszystkich użytkowników (admin).
- `PUT /:id/role`: Zmiana roli użytkownika (admin).

### Statystyki (`/api/stats`)

- `GET /`: Globalne statystyki (wymaga JWT; liczba pytań, podział na kategorie, cache).

---

## 🛡️ Bezpieczeństwo i optymalizacja

- **Rate limiting**: Ograniczenie liczby żądań na IP.
- **Walidacja i sanityzacja**: Wszystkie dane wejściowe są walidowane.
- **Limity na zapytania**: Maksymalnie 500 rekordów na zapytanie.
- **Kolejka zadań**: Agenda czyści wykonane zadania, nie trzyma dużych wyników w bazie.
- **CORS**: Ograniczone do zaufanych domen.
- **Kompresja**: Odpowiedzi HTTP są kompresowane (gzip).

---

## 👨‍💻 Autor

Projekt stworzony i rozwijany przez [Grzegorz](https://github.com/gb-redRabit).
