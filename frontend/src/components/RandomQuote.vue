<template>
  <div
    class="container bg-white/90 rounded-xl shadow-lg p-6 my-6 mx-auto flex flex-col items-center"
  >
    <blockquote class="italic text-lg text-center mb-4 text-gray-700">
      "{{ quote.text }}"
    </blockquote>
    <div class="text-right w-full text-blue-700 font-semibold">
      — {{ quote.author }}
    </div>
  </div>
</template>

<script>
const quotes = [
  {
    text: "Najlepszym sposobem, by dowiedzieć się, czy możesz komuś zaufać, jest zaufać jemu samemu",
    author: "Ernest Hemingway",
  },
  {
    text: "Uwierz, że możesz, a jesteś w połowie drogi",
    author: "Theodore Roosevelt",
  },
  {
    text: "Nie możesz pomóc każdemu, ale każdy może pomóc komuś",
    author: "Ronald Reagan",
  },
  {
    text: "Nie mogę zmienić kierunku wiatru, ale mogę tak ustawić żagle, by zawsze dotrzeć do celu",
    author: "Jimmy Dean",
  },
  {
    text: "To, co jest za nami, i to, co jest przed nami, to maleńkie sprawy w porównaniu z tym, co jest w nas",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "Jeśli chcesz wieść szczęśliwe życie, przywiąż je do celu, a nie do ludzi czy rzeczy",
    author: "Albert Einstein",
  },
  {
    text: "Twój czas jest ograniczony, nie marnuj go, żyjąc życiem kogoś innego",
    author: "Steve Jobs",
  },
  {
    text: "Życie jest tym, czym je tworzymy i jak je tworzymy - bez względu na to, czy zdajemy sobie z tego sprawę, czy nie.",
    author: "Napoleon Hill",
  },
  {
    text: "Najważniejszą rzeczą jest cieszyć się życiem - być szczęśliwym - tylko to się liczy",
    author: "Dalai Lama",
  },
  {
    text: "Żyje się tylko raz, ale jeśli zrobisz to dobrze, raz wystarczy",
    author: "Mae West",
  },
  {
    text: "Żyć to najrzadsza rzecz na świecie. Większość ludzi istnieje, to wszystko",
    author: "Oscar Wilde",
  },
  {
    text: "Celem naszego życia jest bycie szczęśliwym",
    author: "Dalai Lama",
  },
  {
    text: "Nie płacz, bo to już koniec, uśmiechaj się, bo to się wydarzyło",
    author: "Dr Seuss",
  },
  {
    text: "Nie możemy rozwiązywać problemów tym samym sposobem myślenia, którego używaliśmy, gdy je tworzyliśmy.",
    author: "Albert Einstein",
  },
  {
    text: "Ucz się, jakbyś miał żyć wiecznie, żyj, jakbyś miał umrzeć jutro.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Trzymaj się z dala od ludzi, którzy próbują umniejszać Twoje ambicje. Wąskie umysły zawsze to robią, ale wielcy ludzie sprawiają, że uwierzysz, iż i Ty możesz stać się wielkim.",
    author: "Mark Twain",
  },
  {
    text: "Zmieniając swoje myśli, pamiętaj, aby zmienić też swój świat.",
    author: "Norman Vincent Peale",
  },
  {
    text: "Dopiero kiedy podejmujemy ryzyko, nasze życie nabiera nowego wymiaru. Najtrudniejszym ryzykiem, które musimy podjąć, jest szczerość.",
    author: "Walter Anderson",
  },
  {
    text: "Natura dała nam wszystko, co potrzebne do osiągnięcia doskonałego zdrowia i dobrego samopoczucia, ale to od nas zależy, jak je ze sobą połączymy.",
    author: "Diane McLaren",
  },
  {
    text: "Nigdy nie rezygnuj z celu tylko dlatego, że osiągnięcie go wymaga czasu. Czas i tak upłynie",
    author: "Earl Nightingale",
  },
  {
    text: "Porażka to po prostu okazja, by zacząć jeszcze raz, tym razem mądrzej",
    author: "Henry Ford",
  },
  {
    text: "Nie czekaj. Pora nigdy nie będzie idealna",
    author: "Napoleon Hill",
  },
  {
    text: "To zawsze wydaje się niemożliwe, dopóki nie zostanie zrobione",
    author: "Nelson Mandela",
  },
  {
    text: "Nieważne, jak wolno idziesz, tak długo, jak się nie zatrzymujesz",
    author: "Konfucjusz",
  },
  {
    text: "Sukces to suma niewielkich wysiłków powtarzanych dzień po dniu",
    author: "Robert Collier",
  },
  {
    text: "Odwaga to nie brak strachu, ale działanie pomimo niego",
    author: "Mark Twain",
  },
  {
    text: "Nie musisz być wielki, żeby zacząć, ale musisz zacząć, żeby być wielkim",
    author: "Les Brown",
  },
  {
    text: "Jedyną granicą dla naszych osiągnięć jutra jest nasza wątpliwość dzisiaj. Rzuć sobie wyzwanie i zobacz, do czego jesteś zdolny",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "Jeśli naprawdę chcesz coś zrobić, znajdziesz sposób. Jeśli nie, znajdziesz wymówkę",
    author: "Jim Rohn",
  },
  {
    text: "Życie to 10% tego, co ci się przydarza, i 90% tego, jak na to reagujesz",
    author: "Charles R. Swindoll",
  },
  {
    text: "W życiu nie chodzi o czekanie, aż burza minie. Chodzi o to, by nauczyć się tańczyć w deszczu",
    author: "Vivian Green",
  },
  {
    text: "Wielkie rzeczy nigdy nie pochodzą ze strefy komfortu",
    author: "Roy T. Bennett",
  },
  {
    text: "Kiedy napotykasz przeszkody, nie zmieniaj swoich celów – zmień swoje działania",
    author: "Konfucjusz",
  },
  {
    text: "Najlepszym czasem, żeby zacząć, jest teraz",
    author: "Mark Twain",
  },
  {
    text: "Jeśli kiedykolwiek zamierzasz cieszyć się życiem – teraz jest na to czas; nie jutro, nie za rok. Dzisiaj powinno być zawsze najwspanialszym dniem",
    author: "Thomas Dreier",
  },
  {
    text: "Nie masz wpływu na to, co ci się przydarza, ale masz wpływ na to, jak na to reagujesz",
    author: "Epiktet",
  },
  {
    text: "Nigdy nie jesteś zbyt stary na to, by zmienić cele lub marzyć nowe marzenia",
    author: "C.S. Lewis",
  },
  {
    text: "Sukces nie jest ostateczny, porażka nie jest fatalna. To odwaga, by kontynuować, jest tym, co się liczy",
    author: "Winston S. Churchill",
  },
  {
    text: "Nigdy nie bój się spróbować czegoś nowego. Pamiętaj, że arka została zbudowana przez amatorów, a Titanic przez profesjonalistów",
    author: "autor nieznany",
  },
  {
    text: "Nie oczekuj, że rzeczy się zmienią, jeśli ty nie zmienisz siebie",
    author: "Albert Einstein",
  },
  {
    text: "Nie narzekaj, że masz pod górę, gdy zmierzasz na szczyt",
    author: "Konfucjusz",
  },
  {
    text: "Wypełnij życie działaniem. Nie czekaj, aż coś się wydarzy. Spraw, by się wydarzyło",
    author: "Bradley Whitford",
  },
  {
    text: "Możesz pielęgnować swoje nieszczęście albo budować siłę. Wysiłek jest ten sam",
    author: "Carlos Castaneda",
  },
  {
    text: "Nie możesz przepłynąć morza, stojąc na brzegu i wpatrując się w wodę",
    author: "Rabindranath Tagore",
  },
  {
    text: "Różnica między niemożliwym a możliwym leży w ludzkiej determinacji",
    author: "Tommy Lasorda",
  },
  {
    text: "Od tego, jak spędzamy każdy dzień, zależy to, jak spędzamy całe życie",
    author: "Regina Brett",
  },
  {
    text: "Czy chciałbyś być człowiekiem, który ogląda, jak rzeczy się dzieją, czy człowiekiem, który sprawia, że rzeczy się dzieją?",
    author: "Jim Lovell",
  },
];

export default {
  name: "RandomQuote",
  data() {
    return {
      quote: quotes[Math.floor(Math.random() * quotes.length)],
    };
  },
};
</script>
