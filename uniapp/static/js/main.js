document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#search-form");
    const resultsContainer = document.querySelector("#results");
    const btnSearch = document.querySelector('.btn-search');
    const errorBox = document.querySelector("#error-box");
    const citiesList = document.querySelector(".cities-list");
    const citiesLabel = document.querySelector(".cities-label");
    const countryToggle = document.querySelector("#country-toggle");
    const countryLabel = document.querySelector("#country-label");

    const cities = {
        "КНР": ["Сычуань", "Пекин", "Харбин", "Синьчжу", "Шанхай", "Тяньцзинь", "Ухань", "Чунцин", "Гуанси", "Сиань", "Хейлунцзян", "Гуанчжоу", "Гонконг", "Шэньчжэнь", "Нанкин", "Хунань", "Далянь", "Наньчан", "Шаньдунь", "Чанчунь", "Ляонин"],
        "РФ": ["Москва", "Санкт-Петербург", "Новосибирск", "Казань", "Екатеринбург", "Нижний Новгород", "Самара", "Воронеж", "Красноярск", "Пермь", "Челябинск", "Омск", "Ростов-на-Дону", "Уфа", "Волгоград", "Краснодар"]
    };
    function maskToSubjects(mask) {
    const SUBJECTS_BITS = {
        "Биология": 1 << 0,
        "География": 1 << 1,
        "Иностранный язык": 1 << 2,
        "Информатика и ИКТ": 1 << 3,
        "История": 1 << 4,
        "Литература": 1 << 5,
        "Профильная математика": 1 << 6,
        "Обществознание": 1 << 7,
        "Русский язык": 1 << 8,
        "Физика": 1 << 9,
        "Химия": 1 << 10,
    };

    const subjects = [];
    Object.entries(SUBJECTS_BITS).forEach(([subject, bitValue]) => {
        if ((mask & bitValue) > 0) {
            subjects.push(subject);
        }
    });
    return subjects;
}

    function renderCities(country) {
        citiesList.innerHTML = "";
        cities[country].forEach(city => {
            const li = document.createElement("li");
            li.innerHTML = `<label><input type="checkbox" value="${city}"> ${city}</label>`;
            citiesList.appendChild(li);
        });
        citiesLabel.textContent = "Города";
        attachCityCheckboxListeners();
    }

    function attachCityCheckboxListeners() {
        document.querySelectorAll(".cities-list input[type='checkbox']").forEach(cb =>
            cb.addEventListener("change", updateLabels)
        );
    }

    function updateLabels() {
        const selectedCities = Array.from(document.querySelectorAll(".cities-list input:checked")).map(cb => cb.value);
        citiesLabel.textContent = selectedCities.length ? selectedCities.join(", ") : "Города";

        const selectedSubjects = Array.from(document.querySelectorAll(".subject-list input:checked")).map(cb => cb.value);
        const subjectsLabel = document.querySelector(".subjects-label");
        if (subjectsLabel) subjectsLabel.textContent = selectedSubjects.length ? selectedSubjects.join(", ") : "Предметы";
    }

    // Изначально КНР
    renderCities("КНР");

    countryToggle.addEventListener("change", () => {
        const country = countryToggle.checked ? "РФ" : "КНР";
        countryLabel.textContent = country;
        renderCities(country);
    });

    document.querySelector(".subjects-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector(".subject-list")?.classList.toggle("hidden");
    });

    document.querySelector(".cities-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        citiesList.classList.toggle("hidden");
    });

form.addEventListener("submit", async (event) => {
    event.preventDefault(); // предотвращаем перезагрузку страницы

    const selectedSubjects = Array.from(document.querySelectorAll(".subject-list input:checked")).map(cb => cb.value);
    const selectedCities = Array.from(document.querySelectorAll(".cities-list input:checked")).map(cb => cb.value);

    // Очищаем результаты и скрываем возможные ошибки
    resultsContainer.innerHTML = "";
    errorBox.style.display = "none";
    errorBox.textContent = "";

    try {
        // Используем POST-запрос для отправки данных
        const response = await fetch("/api/universities/search-universities/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subjects: selectedSubjects, cities: selectedCities }),
        });

        if (!response.ok) throw new Error("Ошибка сервера");

        const data = await response.json();

        if (!Object.keys(data).length) {
            resultsContainer.innerHTML = "<p>Университетов не найдено.</p>";
            return;
        }

        // Генерируем список результатов
        const ul = document.createElement("ul");
        Object.entries(data).forEach(([universityName, details]) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${universityName}</strong> <br><small>Города: ${details.cities.join(", ")}</small>`;

            if (details.programs && details.programs.length) {
                const subUl = document.createElement("ul");
                details.programs.forEach(program => {
                    const subLi = document.createElement("li");
                    subLi.textContent = `Программа: ${program.name} | Требования: ${program.required_all}, ${program.required_any}`;
                    subUl.appendChild(subLi);
                });
                li.appendChild(subUl);
            }
            ul.appendChild(li);
        });
        resultsContainer.appendChild(ul);

    } catch (err) {
        errorBox.style.display = "block";
        errorBox.textContent = "Ошибка при выполнении запроса.";
        console.error(err);
    }
});
    document.querySelectorAll(".subject-list input[type='checkbox']").forEach(cb =>
        cb.addEventListener("change", updateLabels)
    );
});
