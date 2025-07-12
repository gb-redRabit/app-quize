<div align="center">
  <img src="https://via.placeholder.com/150/4FC08D/FFFFFF?text=QA" alt="Quiz App Logo" style="border-radius: 50%;">
</div>

---

**Quiz App** to interaktywna platforma do nauki i testowania wiedzy. Umożliwia użytkownikom rozwiązywanie quizów i egzaminów, śledzenie postępów, a administratorom łatwe zarządzanie bazą pytań.

## ✨ Kluczowe Funkcje

- 🔐 **Pełna Autentykacja**: Bezpieczna rejestracja i logowanie użytkowników przy użyciu **JWT**.
- 📝 **Dynamiczne Quizy i Egzaminy**: Losowe pytania, różne tryby (nauka, egzamin) i kategorie.
- ⏱️ **Timer**: Ograniczenie czasowe dla egzaminów z automatycznym zakończeniem.
- 📊 **Śledzenie Postępów**: Szczegółowa historia rozwiązanych quizów i analiza wyników.
- 🎨 **Zaawansowana Personalizacja**: Użytkownicy mogą zmieniać swoje awatary, kolory interfejsu oraz motyw (jasny/ciemny).
- 🛠️ **Panel Administracyjny**: Kompleksowe zarządzanie pytaniami (CRUD) z funkcją importu/eksportu z plików **Excel**.
- 🔍 **Inteligentne Wyszukiwanie**: Filtrowanie pytań po ID, treści i kategoriach.
- 📱 **W Pełni Responsywny Interfejs**: Nowoczesny design, który świetnie wygląda na każdym urządzeniu.
- 📚 **Przeglądanie pytań wg kategorii** oraz ukrywanie wybranych kategorii.
- 🧩 **Statystyki, podgląd historii odpowiedzi, panel użytkownika z edycją profilu i hasła**
- 🌙 **Tryb ciemny** (dark mode)

---

## 🛠️ Stos Technologiczny

| Kategoria       | Technologia                                                                                                                                                                                         |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**    | [Vue 3](https://vuejs.org/) (Composition API), [Vuex](https://vuex.vuejs.org/), [Vue Router](https://router.vuejs.org/), [Tailwind CSS](https://tailwindcss.com/), [Axios](https://axios-http.com/) |
| **Backend**     | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [JWT](https://jwt.io/), [ExcelJS](https://github.com/exceljs/exceljs), [Mongoose](https://mongoosejs.com/)                       |
| **Baza Danych** | Pliki JSON lub [MongoDB](https://www.mongodb.com/)                                                                                                                                                  |
| **Narzędzia**   | [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Nodemon](https://nodemon.io/)                                                                                                     |

---

## 🚀 Szybki Start

### Wymagania Wstępne

- [Node.js](https://nodejs.org/) (zalecana wersja 18.x lub nowsza)
- [npm](https://www.npmjs.com/) (zazwyczaj instalowany z Node.js)
- [MongoDB](https://www.mongodb.com/) (lokalnie lub w chmurze, np. Atlas)

### Kroki Instalacji

1.  **Sklonuj repozytorium:**

    ```bash
    git clone https://github.com/gb-redRabit/quiz-app.git
    cd quiz-app
    ```

2.  **Zainstaluj zależności dla Backendu:**

    ```bash
    cd backend
    npm install
    ```

3.  **Zainstaluj zależności dla Frontendu:**

    ```bash
    cd ../frontend
    npm install
    ```

4.  **Skonfiguruj pliki `.env`:**

    - Backend (`backend/.env`):
      ```
      JWT_SECRET=twoj_super_tajny_klucz
      MONGO_URI=mongodb://localhost:27017/quizapp
      ```
    - Frontend (`frontend/.env`):
      ```
      VUE_APP_API_URL=http://localhost:3000/api
      ```

5.  **Zaimportuj dane testowe (opcjonalnie):**
    ```bash
    cd backend
    node importData.js
    ```

### Uruchomienie Aplikacji

Aplikację należy uruchomić w dwóch osobnych terminalach.

1.  **Uruchom serwer backendu:**

    ```bash
    cd backend
    npm run dev
    ```

    > Serwer będzie nasłuchiwał na porcie `3000`.

2.  **Uruchom aplikację frontendową:**
    ```bash
    cd frontend
    npm run serve
    ```
    > Aplikacja będzie dostępna pod adresem [http://localhost:8080](http://localhost:8080).

---

## 📂 Struktura Projektu

Projekt jest zorganizowany jako monorepo z dwoma głównymi katalogami: `frontend` i `backend`.

```
app-quize/
├── 📁 backend/
│   ├── 📁 data/              # Pliki JSON jako baza danych
│   ├── 📁 src/
│   │   ├── 📄 app.js         # Główny plik serwera Express
│   │   ├── 📁 controllers/  # Logika biznesowa
│   │   ├── 📁 middleware/   # Middleware (np. weryfikacja JWT)
│   │   ├── 📁 models/       # Schematy Mongoose
│   │   ├── 📁 routes/       # Definicje endpointów API
│   │   └── 📁 utils/        # Narzędzia (cache, fileUtils)
│   ├── 📄 importData.js     # Skrypt importu danych z plików JSON do MongoDB
│   ├── 📄 .env              # Zmienne środowiskowe
│   └── 📄 package.json
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📄 main.js        # Punkt wejściowy aplikacji Vue
│   │   ├── 📄 App.vue        # Główny komponent aplikacji
│   │   ├── 📁 assets/       # Style i zasoby statyczne
│   │   ├── 📁 components/   # Komponenty wielokrotnego użytku
│   │   ├── 📁 router/       # Konfiguracja Vue Router
│   │   ├── 📁 store/        # Moduły Vuex
│   │   ├── 📁 views/        # Główne widoki stron
│   │   └── 📁 utils/        # Funkcje pomocnicze
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   ├── 📄 .env
│   └── 📄 package.json
│
└── 📄 README.md             # Ten plik
```

---

## 🔗 API – Przykładowe Endpointy

### Autoryzacja

- `POST /api/auth/register` – rejestracja użytkownika
- `POST /api/auth/login` – logowanie
- `POST /api/auth/logout` – wylogowanie
- `POST /api/auth/refresh` – odświeżenie tokena JWT

### Pytania

- `GET /api/questions` – pobierz wszystkie pytania
- `POST /api/questions` – dodaj pytanie (wymaga JWT)
- `PUT /api/questions/:id` – edytuj pytanie (wymaga JWT)
- `DELETE /api/questions/:id` – usuń pytanie (wymaga JWT)
- `GET /api/questions/export/excel` – eksport pytań do pliku Excel
- `POST /api/questions/import/excel` – import pytań z pliku Excel
- `POST /api/questions/clear` – wyczyść bazę pytań (admin)
- `GET /api/questions/stats` – statystyki pytań i kategorii

### Użytkownicy

- `GET /api/users/history` – pobierz historię quizów użytkownika (JWT)
- `PUT /api/users/update-profile` – aktualizuj profil użytkownika (avatar, motyw, historia, ukryte kategorie)
- `GET /api/users/me` – pobierz dane zalogowanego użytkownika
- `GET /api/users/hquestion` – pobierz historię odpowiedzi na pytania
- `POST /api/users/hquestion` – zapisz odpowiedź na pytanie
- `PUT /api/users/clear-category` – wyczyść historię pytań z danej kategorii
- `GET /api/users/all` – lista wszystkich użytkowników (admin)
- `PUT /api/users/:id/role` – zmiana roli użytkownika (admin)

---

## 🛡️ Bezpieczeństwo

- Hasła użytkowników są hashowane (bcrypt)
- Autoryzacja przez JWT
- Middleware sprawdzający uprawnienia
- Ograniczenie CORS do zaufanych domen
- Ochrona tras frontendowych wymagających logowania i uprawnień admina

---

## 🧩 Rozszerzanie

Kod jest modularny – możesz łatwo dodawać nowe trasy, modele, widoki lub logikę w katalogu `src/`.  
Możesz podpiąć dowolną bazę danych (np. MongoDB, PostgreSQL) – obecnie obsługiwany jest MongoDB przez Mongoose.

---

## 🧪 Testowanie

- Możesz dodać testy jednostkowe np. w [Jest](https://jestjs.io/) lub [Mocha](https://mochajs.org/) dla backendu.
- Frontend można testować za pomocą [Vue Test Utils](https://vue-test-utils.vuejs.org/) i [Jest](https://jestjs.io/).

---

## 🌗 Tryb ciemny

Aplikacja automatycznie zapamiętuje wybrany motyw (jasny/ciemny) i stosuje go globalnie. Możesz przełączać motyw w panelu użytkownika.

---

## 💡 FAQ

**Jak dodać nowe pole do użytkownika?**  
Dodaj je w `src/models/User.js` i obsłuż w kontrolerze.

**Jak zmienić port serwera?**  
Zmień wartość `PORT` w pliku `.env` lub w `src/app.js`.

**Jak dodać nowy endpoint?**  
Dodaj trasę w katalogu `src/routes/` i logikę w `src/controllers/`.

**Jak zaimportować pytania z Excela?**  
Użyj endpointu `POST /api/questions/import/excel` (w panelu admina frontend).

**Jak dodać nowy widok lub komponent?**  
Dodaj plik w `src/views/` lub `src/components/` i trasę w `src/router/`.

---

## 📜 Licencja

Projekt jest udostępniony na licencji MIT.  
Szczegóły w pliku [license.md](license.md)

---

## 👨‍💻 Autorzy

Projekt stworzony przez [Grzegorz](https://github.com/gb-redRabit)

---
