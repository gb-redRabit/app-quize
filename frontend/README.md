# Quiz App – Frontend

Nowoczesna aplikacja quizowa oparta na **Vue 3** i **Tailwind CSS**.

---

## 🚀 Funkcje

- 🔐 Rejestracja i logowanie użytkowników (JWT)
- 📝 Rozwiązywanie quizów i egzaminów z losowymi pytaniami
- ⏱️ Timer i automatyczne zakończenie testu po czasie
- 📊 Historia quizów i egzaminów użytkownika
- 🛠️ Panel administracyjny do zarządzania pytaniami (CRUD, import/eksport Excel)
- 🔍 Wyszukiwanie pytań po ID, treści i kategoriach
- 📚 Przeglądanie pytań wg kategorii
- 🎨 Personalizacja: własny avatar, wybór motywu (jasny/ciemny)
- 📱 Responsywny, nowoczesny interfejs (mobile/desktop)
- 🌙 Tryb ciemny (dark mode)

---

## 📂 Struktura katalogów

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/           # Style globalne (Tailwind, main.css)
│   ├── components/       # Komponenty wielokrotnego użytku (Navbar, SearchBar, QuestionList, Timer, Avatar, BaseButton, BaseAlert, BaseLoader, itd.)
│   ├── views/            # Główne widoki (Home, QuizView, ExamView, AdminView, CategoryQuestionsView, HistoryView, HistoryDetailsView, NotFound, UserPanel)
│   ├── router/           # Konfiguracja Vue Router (index.js, auth.js, quiz.js, user.js, admin.js)
│   ├── store/            # Vuex store (index.js + moduły: user.js, questions.js, ui.js)
│   ├── utils/            # Funkcje pomocnicze (randomQuestions.js, shuffleArray.js)
│   ├── App.vue           # Główny komponent aplikacji
│   └── main.js           # Punkt wejściowy aplikacji
├── tailwind.config.js    # Konfiguracja Tailwind CSS
├── postcss.config.js     # Konfiguracja PostCSS
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚡ Instalacja i uruchomienie

1. Przejdź do katalogu frontend:

   ```bash
   cd frontend
   ```

2. Zainstaluj zależności:

   ```bash
   npm install
   ```

3. Uruchom aplikację developerską:

   ```bash
   npm run serve
   ```

4. Otwórz [http://localhost:8080](http://localhost:8080) w przeglądarce.

---

## 🗂️ Najważniejsze pliki i katalogi

- `src/views/` – główne widoki (QuizView, ExamView, AdminView, Home, Historia, UserPanel, NotFound)
- `src/components/` – komponenty wielokrotnego użytku (QuestionList, SearchBar, Navbar, Timer, Avatar, BaseButton, BaseAlert, BaseLoader, ProgressBar, itd.)
- `src/store/` – Vuex store (moduły: user, questions, ui)
- `src/router/` – Vue Router (nawigacja, podział na pliki: auth.js, quiz.js, user.js, admin.js)
- `src/assets/` – style globalne (Tailwind CSS, main.css)

---

## 🧑‍💻 Użytkowanie

- Zarejestruj się lub zaloguj, aby korzystać z quizów i egzaminów.
- Rozwiązuj quizy i egzaminy, przeglądaj statystyki i historię.
- Jako admin możesz dodawać, edytować, usuwać i importować pytania.
- Wyszukuj pytania po ID, treści lub kategoriach.
- Personalizuj swój profil: wybierz avatar, kolor, motyw jasny/ciemny.
- Przeglądaj szczegółową historię swoich wyników.

---

## 🌗 Tryb ciemny

Aplikacja automatycznie zapamiętuje wybrany motyw (jasny/ciemny) i stosuje go globalnie. Możesz przełączać motyw w panelu użytkownika.

---

## 🛠️ Technologie

- [Vue 3](https://vuejs.org/) + [Vuex](https://vuex.vuejs.org/) + [Vue Router](https://router.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/) – utility-first CSS
- [Axios](https://axios-http.com/) – komunikacja z backendem
- [JWT](https://jwt.io/) – autoryzacja użytkowników
- [ExcelJS](https://github.com/exceljs/exceljs) – import/eksport pytań do Excela

---

## 📝 Licencja

MIT License

---

## 👨‍💻 Autorzy

Projekt stworzony przez [Grzegorz](https://github.com/gb-redRabit)

---
