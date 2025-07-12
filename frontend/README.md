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
- 🧩 Ukrywanie kategorii, statystyki, podgląd historii odpowiedzi
- 🧑‍💻 Panel użytkownika z edycją profilu i hasła

---

## 📦 Użyte narzędzia i biblioteki

Projekt korzysta z następujących narzędzi (na podstawie package.json):

- **vue** – framework frontendowy
- **vue-router** – routing SPA
- **vuex** – zarządzanie stanem aplikacji
- **tailwindcss** – utility-first CSS framework
- **axios** – komunikacja z backendem (REST API)
- **postcss** – przetwarzanie CSS
- **autoprefixer** – automatyczne dodawanie prefixów CSS
- **@vue/cli-service** – narzędzia developerskie Vue CLI
- **@vue/compiler-sfc** – kompilacja plików .vue
- **exceljs** – import/eksport pytań do/z Excela
- **vue-virtual-scroller** – wydajne listy i tabele
- **core-js** – polyfill dla nowych funkcji JS
- **sass**/**sass-loader** – wsparcie dla SCSS/SASS
- **eslint**/**eslint-plugin-vue** – lintowanie kodu
- **jest**/**@vue/test-utils** – testy jednostkowe
- **babel**/**babel-loader** – transpilacja JS
- **@tailwindcss/forms** – stylowanie formularzy
- **@tailwindcss/typography** – stylowanie tekstu
- **@tailwindcss/line-clamp** – obcinanie tekstu
- **@tailwindcss/aspect-ratio** – proporcje elementów

---

## 📂 Struktura katalogów

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/           # Style globalne (Tailwind, main.css)
│   ├── components/       # Komponenty wielokrotnego użytku (Navbar, SearchBar, QuestionList, Timer, Avatar, BaseButton, BaseAlert, BaseLoader, itd.)
│   ├── views/            # Główne widoki (Home, QuizView, ExamView, AdminView, CategoryQuestionsView, HistoryView, HistoryDetailsView, NotFound, UserPanel, AdminUsersView)
│   ├── router/           # Konfiguracja Vue Router (index.js, auth.js, quiz.js, user.js, admin.js)
│   ├── store/            # Vuex store (index.js + moduły: user.js, questions.js, ui.js)
│   ├── utils/            # Funkcje pomocnicze (randomQuestions.js, shuffleArray.js)
│   ├── App.vue           # Główny komponent aplikacji
│   └── main.js           # Punkt wejściowy aplikacji
├── tailwind.config.js    # Konfiguracja Tailwind CSS
├── postcss.config.js     # Konfiguracja PostCSS
├── .env                  # Zmienne środowiskowe (np. VUE_APP_API_URL)
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

2. Skonfiguruj plik `.env` (przykład):

   ```
   VUE_APP_API_URL=http://localhost:3000/api
   ```

3. Zainstaluj zależności:

   ```bash
   npm install
   ```

4. Uruchom aplikację developerską:

   ```bash
   npm run serve
   ```

5. Otwórz [http://localhost:8080](http://localhost:8080) w przeglądarce.

---

## 🗂️ Najważniejsze pliki i katalogi

- `src/views/` – główne widoki (QuizView, ExamView, AdminView, Home, Historia, UserPanel, NotFound, AdminUsersView)
- `src/components/` – komponenty wielokrotnego użytku (QuestionList, SearchBar, Navbar, Timer, Avatar, BaseButton, BaseAlert, BaseLoader, ProgressBar, itd.)
- `src/store/` – Vuex store (moduły: user, questions, ui)
- `src/router/` – Vue Router (nawigacja, podział na pliki: auth.js, quiz.js, user.js, admin.js)
- `src/assets/` – style globalne (Tailwind CSS, main.css)
- `src/utils/` – funkcje pomocnicze (np. losowanie pytań, mieszanie odpowiedzi)

---

## 🧑‍💻 Użytkowanie

- Zarejestruj się lub zaloguj, aby korzystać z quizów i egzaminów.
- Rozwiązuj quizy i egzaminy, przeglądaj statystyki i historię.
- Jako admin możesz dodawać, edytować, usuwać i importować pytania.
- Wyszukuj pytania po ID, treści lub kategoriach.
- Personalizuj swój profil: wybierz avatar, kolor, motyw jasny/ciemny.
- Przeglądaj szczegółową historię swoich wyników.
- Ukrywaj wybrane kategorie pytań w panelu użytkownika.
- Eksportuj i importuj pytania do/z pliku Excel.

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
- [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller) – wydajne listy
- [Jest](https://jestjs.io/) – testy jednostkowe
- [ESLint](https://eslint.org/) – lintowanie kodu
- [PostCSS](https://postcss.org/) – przetwarzanie CSS

---

## 🔗 Integracja z backendem

- Domyślny adres API: `http://localhost:3000/api` (możesz zmienić w `.env`)
- Backend: [Quiz App Backend](../backend/README.md)

---

## 🧩 Rozszerzanie

Kod jest modularny – możesz łatwo dodawać nowe widoki, komponenty, akcje Vuex lub trasy w routerze.  
Możesz podpiąć dowolny backend zgodny z REST API.

---

## 🛡️ Bezpieczeństwo

- Autoryzacja przez JWT
- Ochrona tras wymagających logowania i uprawnień admina
- Dane użytkownika przechowywane w sessionStorage

---

## 📝 Licencja

MIT License  
Szczegóły w pliku [license.md](../license.md)

---

## 💡 FAQ

**Jak dodać nowy widok?**  
Dodaj plik w `src/views/` i trasę w `src/router/`.

**Jak dodać nowy komponent?**  
Dodaj plik w `src/components/` i użyj go w widoku lub innym komponencie.

**Jak zmienić motyw?**  
Przejdź do panelu użytkownika i wybierz motyw jasny/ciemny.

**Jak dodać nową kategorię pytań?**  
Dodaj pytanie z nową kategorią w panelu admina.

**Jak zaimportować pytania z Excela?**  
Użyj funkcji importu w panelu admina.

---

## 👨‍💻 Autorzy

Projekt stworzony przez [Grzegorz](https://github.com/gb-redRabit)

---
