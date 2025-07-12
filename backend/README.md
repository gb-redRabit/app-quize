# Quiz App Backend

Backend aplikacji Quiz App – REST API w Node.js + Express, z prostym przechowywaniem danych w plikach JSON lub MongoDB.

---

## 🚀 Funkcje

- Rejestracja i logowanie użytkowników (JWT)
- CRUD pytań do quizu (dodawanie, edycja, usuwanie, pobieranie)
- Historia quizów i egzaminów użytkownika
- Middleware autoryzujący (token JWT)
- Przechowywanie danych w plikach JSON lub MongoDB
- Import/eksport pytań do/z pliku Excel
- Statystyki pytań i kategorii
- Panel administracyjny (zmiana roli użytkownika)
- Obsługa ukrytych kategorii, avatarów, motywów użytkownika
- Prosta struktura, łatwa do rozbudowy

---

## 📁 Struktura katalogów

```
backend/
├── data/                # Pliki z danymi (JSON)
│   ├── data.json        # Pytania do quizów
│   └── users.json       # Użytkownicy i ich historia
├── src/
│   ├── app.js           # Główny plik uruchamiający serwer
│   ├── config/          # Konfiguracja bazy danych (database.js)
│   ├── controllers/     # Logika tras (usersController.js, questionsController.js, authController.js)
│   ├── middleware/      # Middleware (authMiddleware.js)
│   ├── models/          # Schematy Mongoose (User.js, Question.js, Stats.js)
│   ├── routes/          # Definicje tras (users.js, questions.js, auth.js)
│   └── utils/           # Narzędzia (fileUtils.js, cache.js)
├── importData.js        # Skrypt importu danych z plików JSON do MongoDB
├── .env                 # Zmienne środowiskowe (np. JWT_SECRET, MONGO_URI)
├── package.json
├── package-lock.json
└── README.md
```

---

## 🛠️ Instalacja i uruchomienie

1. Przejdź do katalogu backend:

   ```bash
   cd backend
   ```

2. Skonfiguruj plik `.env` (przykład poniżej):

   ```
   JWT_SECRET=twoj_super_tajny_klucz
   MONGO_URI=mongodb://localhost:27017/quizapp
   ```

3. Zainstaluj zależności:

   ```bash
   npm install
   ```

4. Uruchom serwer:

   ```bash
   npm start
   # lub tryb developerski (z automatycznym restartem po zmianach):
   npm run dev
   ```

Serwer domyślnie działa na [http://localhost:3000](http://localhost:3000).

---

## 🗃️ Baza danych

- Domyślnie MongoDB (możesz użyć lokalnej lub Atlas Cloud).
- Dane testowe możesz zaimportować z plików JSON za pomocą skryptu `importData.js`:

  ```bash
  node importData.js
  ```

---

## 🔗 API – Endpoints

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

## 🗂️ Pliki danych

- `data/data.json` – pytania do quizów (przykładowe dane)
- `data/users.json` – użytkownicy i ich historia (przykładowe dane)

---

## 🧩 Rozszerzanie

Kod jest modularny – możesz łatwo dodawać nowe trasy, modele lub logikę w katalogu `src/`.  
Możesz podpiąć dowolną bazę danych (np. MongoDB, PostgreSQL) – obecnie obsługiwany jest MongoDB przez Mongoose.

---

## 🛡️ Bezpieczeństwo

- Hasła użytkowników są hashowane (bcrypt)
- Autoryzacja przez JWT
- Middleware sprawdzający uprawnienia
- Ograniczenie CORS do zaufanych domen (patrz `src/app.js`)

---

## 🧪 Testowanie

---

## 📝 Licencja

MIT License  
Szczegóły w pliku [license.md](../license.md)

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

---

## 👨‍💻 Autorzy

Projekt stworzony przez [Grzegorz](https://github.com/gb-redRabit)

---
