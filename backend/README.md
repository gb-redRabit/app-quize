# Quiz App Backend

Backend aplikacji Quiz App oparty na Node.js i Express.

---

## Funkcje

- Rejestracja i logowanie użytkowników (JWT)
- CRUD pytań do quizu (dodawanie, edycja, usuwanie, pobieranie)
- Historia rozwiązywanych quizów i egzaminów
- Przechowywanie danych w plikach JSON (pytania, użytkownicy)
- Middleware autoryzujący (token JWT)

---

## Struktura katalogów

```
backend/
├── data/
│   ├── data.json         # Pytania do quizów
│   └── users.json        # Użytkownicy i ich historia
├── src/
│   ├── app.js            # Główny plik uruchamiający serwer
│   ├── controllers/      # Logika obsługi tras (usersController.js, questionsController.js, authController.js)
│   ├── middleware/       # Middleware (authMiddleware.js)
│   ├── routes/           # Definicje tras (users.js, questions.js, auth.js)
│   └── utils/            # Narzędzia (fileUtils.js)
├── package.json
├── package-lock.json
└── README.md
```

---

## Uruchomienie

1. Przejdź do katalogu backend:

   ```bash
   cd backend
   ```

2. Zainstaluj zależności:

   ```bash
   npm install
   ```

3. Uruchom serwer:
   ```bash
   npm start
   # lub na dev:
   npm run dev
   ```

Serwer działa domyślnie na `http://localhost:3000`.

---

## API

- **Autoryzacja**

  - `POST /api/auth/register` – rejestracja
  - `POST /api/auth/login` – logowanie
  - `POST /api/auth/logout` – wylogowanie

- **Pytania**

  - `GET /api/questions` – pobierz wszystkie pytania
  - `POST /api/questions` – dodaj pytanie (wymaga JWT)
  - `PUT /api/questions/:id` – edytuj pytanie (wymaga JWT)
  - `DELETE /api/questions/:id` – usuń pytanie (wymaga JWT)

- **Użytkownicy**
  - `GET /api/users/history` – historia quizów użytkownika (JWT)
  - `PUT /api/users/update` – zapisz nową historię (JWT)

---

## Pliki danych

- `data/data.json` – pytania do quizów
- `data/users.json` – użytkownicy i ich historia

---

## Licencja

MIT License
