# Quiz App – Backend

Wydajny i skalowalny backend dla aplikacji quizowej, zbudowany w oparciu o **Node.js**, **Express** i **MongoDB**. Zapewnia REST API do zarządzania pytaniami, użytkownikami, uwierzytelnianiem i statystykami.

---

## 🚀 Kluczowe Funkcje

-   **Uwierzytelnianie JWT**: Bezpieczna rejestracja i logowanie z wykorzystaniem tokenów JSON Web Token i hashowaniem haseł (`bcrypt`).
-   **Zaawansowane Zarządzanie Pytaniami**: Pełen CRUD z automatycznym, sekwencyjnym nadawaniem ID nowym pytaniom.
-   **Import/Eksport do Excela**: Wbudowane narzędzia do masowego importu i eksportu pytań za pomocą plików `.xlsx`.
-   **Panel Administratora**: Dedykowane endpointy do zarządzania użytkownikami (zmiana ról) i bazą pytań (grupowe usuwanie, czyszczenie bazy).
-   **Szczegółowa Historia Użytkownika**: Śledzenie historii ukończonych quizów (`history`) oraz postępów w poszczególnych pytaniach (`hquestion`).
-   **Statystyki i Cache'owanie**: Dynamicznie generowane statystyki (liczba pytań, podział na kategorie) z prostym systemem cache'owania w pamięci w celu optymalizacji wydajności.
-   **Wyszukiwanie i Filtrowanie**: Możliwość wyszukiwania pytań po ID lub treści oraz filtrowania po kategorii.
-   **Personalizacja Użytkownika**: Obsługa awatarów, kolorów, motywów i ukrytych kategorii na poziomie API.
-   **Optymalizacja**: Kompresja odpowiedzi HTTP (`gzip`) w celu zmniejszenia transferu danych.

---

## 🛠️ Technologie

-   **Framework**: [Node.js](https://nodejs.org/) z [Express.js](https://expressjs.com/)
-   **Baza Danych**: [MongoDB](https://www.mongodb.com/) z [Mongoose](https://mongoosejs.com/) jako ODM
-   **Uwierzytelnianie**: [JSON Web Token](https://jwt.io/) (`jsonwebtoken`), [bcrypt](https://www.npmjs.com/package/bcrypt)
-   **Obsługa Plików**: [ExcelJS](https://github.com/exceljs/exceljs) do operacji na plikach `.xlsx`, [Multer](https://github.com/expressjs/multer) do obsługi uploadu.
-   **Optymalizacja**: [compression](https://www.npmjs.com/package/compression)
-   **Zmienne Środowiskowe**: [dotenv](https://www.npmjs.com/package/dotenv)

---

## 📁 Struktura Projektu

Struktura katalogów jest zorganizowana w sposób modularny, co ułatwia utrzymanie i rozbudowę API.

```
backend/
├── data/                # Przykładowe dane do importu (JSON)
├── src/
│   ├── app.js           # Główny plik serwera, konfiguracja Express i middleware
│   ├── config/          # Konfiguracja połączenia z bazą danych
│   ├── controllers/     # Logika biznesowa dla poszczególnych endpointów
│   ├── middleware/      # Middleware (np. do weryfikacji tokena JWT)
│   ├── models/          # Schematy bazy danych Mongoose (User, Question, Stats)
│   ├── routes/          # Definicje tras API
│   └── utils/           # Funkcje pomocnicze (np. prosty cache)
├── uploads/             # Katalog na tymczasowe pliki (opcjonalnie)
├── .env                 # Plik ze zmiennymi środowiskowymi (klucz JWT, URI bazy danych)
├── importData.js        # Skrypt do importu danych z plików JSON do MongoDB
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

3.  **Skonfiguruj zmienne środowiskowe**. Utwórz plik `.env` w głównym katalogu `backend` i uzupełnij go:
    ```env
    # Sekretny klucz do podpisywania tokenów JWT
    JWT_SECRET=twoj_super_tajny_klucz_jwt

    # Adres połączenia z bazą danych MongoDB
    MONGO_URI=mongodb://localhost:27017/quizapp

    # Port, na którym będzie działał serwer
    PORT=3000
    ```

4.  **(Opcjonalnie) Zaimportuj dane startowe** do swojej bazy MongoDB:
    ```bash
    node importData.js
    ```

5.  **Uruchom serwer**:
    -   W trybie produkcyjnym:
        ```bash
        npm start
        ```
    -   W trybie deweloperskim (z automatycznym przeładowaniem po zmianach w kodzie):
        ```bash
        npm run dev
        ```

Serwer będzie dostępny pod adresem `http://localhost:3000` (lub innym portem zdefiniowanym w `.env`).

---

## 🔗 Dokumentacja API

### Autoryzacja (`/api/auth`)
-   `POST /register`: Rejestracja nowego użytkownika.
-   `POST /login`: Logowanie i uzyskanie tokena JWT.
-   `POST /logout`: Wylogowanie (endpoint formalny, usuwa token po stronie klienta).

### Pytania (`/api/questions`)
-   `GET /`: Pobieranie pytań z paginacją (np. `?page=1&limit=20`).
-   `GET /?ids=1,2,3`: Pobieranie konkretnych pytań po ich ID.
-   `GET /search?query=...`: Wyszukiwanie pytań po ID lub treści.
-   `GET /category/:category`: Pobieranie pytań z danej kategorii.
-   `POST /`: Dodawanie nowego pytania (wymaga autoryzacji).
-   `PUT /:id`: Aktualizacja pytania o podanym ID (wymaga autoryzacji).
-   `DELETE /:id`: Usunięcie pytania o podanym ID (wymaga autoryzacji).
-   `GET /export/excel`: Eksport wszystkich pytań do pliku `.xlsx` (wymaga autoryzacji).
-   `POST /import/excel`: Masowy import pytań z pliku `.xlsx` (wymaga autoryzacji, `multipart/form-data`).
-   `POST /clear`: Usunięcie **wszystkich** pytań z bazy (admin).
-   `DELETE /category/:category`: Usunięcie wszystkich pytań z danej kategorii (admin).

### Użytkownicy (`/api/users`)
-   `GET /me`: Pobranie danych zalogowanego użytkownika.
-   `PUT /update-profile`: Aktualizacja profilu (hasło, awatar, historia, opcje).
-   `GET /history`: Pobranie historii quizów użytkownika.
-   `GET /hquestion`: Pobranie historii odpowiedzi na poszczególne pytania.
-   `POST /hquestion`: Zapisanie lub aktualizacja odpowiedzi na pojedyncze pytanie.
-   `PUT /clear-category`: Wyczyszczenie historii odpowiedzi (`hquestion`) dla danej kategorii.
-   `GET /all`: Pobranie listy wszystkich użytkowników (admin).
-   `PUT /:id/role`: Zmiana roli użytkownika (admin).

### Statystyki (`/api/stats`)
-   `GET /`: Pobranie globalnych statystyk (całkowita liczba pytań, podział na kategorie). Wyniki są cache'owane.

---

## 👨‍💻 Autor

Projekt stworzony i rozwijany przez [Grzegorz](https://github.com/gb-redRabit).
