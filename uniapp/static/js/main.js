document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#search-form");
    const resultsContainer = document.querySelector("#results");
    const subjectsbtn = document.querySelector('.subjects-btn');
    const citiesbtn = document.querySelector('.cities-btn');
    const errorBox = document.querySelector("#error-box");
    const citiesList = document.querySelector(".cities-list");
    const citiesLabel = document.querySelector(".cities-label");
    const countryToggle = document.querySelector("#country-toggle");
    const countryLabel = document.querySelector("#country-label");

    const cities = {
        "КНР": ["Сычуань", "Пекин", "Харбин", "Синьчжу", "Шанхай", "Тяньцзинь", "Ухань", "Чунцин", "Гуанси", "Сиань", "Хейлунцзян", "Гуанчжоу", "Гонконг", "Шэньчжэнь", "Нанкин", "Хунань", "Далянь", "Наньчан", "Шаньдунь", "Чанчунь", "Ляонин"],
        "РФ": ["Москва", "Санкт-Петербург", "Новосибирск", "Казань", "Нижний Новгород", "Воронеж", "Пермь", "Челябинск", "Омск", "Уфа", "Волгоград", "Сочи", "Астрахань", "Мурманск"]
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
    function toggleArrowSubj() {
        if (subjectsbtn.textContent === '▼') {
            subjectsbtn.textContent = '▲'; // Меняем направление стрелочки вверх
        } else {
            subjectsbtn.textContent = '▼'; // Возвращаемся обратно
        }
    }
    subjectsbtn.addEventListener('click', toggleArrowSubj);

    function toggleArrowCities() {
        if (citiesbtn.textContent === '▼') {
            citiesbtn.textContent = '▲'; // Меняем направление стрелочки вверх
        } else {
            citiesbtn.textContent = '▼'; // Возвращаемся обратно
        }
    }
    citiesbtn.addEventListener('click', toggleArrowCities);

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

    if (selectedSubjects.length === 0 && selectedCities.length === 0) {
        alert("Нужно выбрать хотя бы один предмет или город.");
        return;
    }

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
    li.classList.add('university-item');

    li.innerHTML = `
        <strong class="university-name">${universityName}</strong> 
        <br><small class="city-list">Города: ${details.cities.join(", ")}</small> 
    `;

    if (details.programs && details.programs.length) {
        const subUl = document.createElement("ul");
        subUl.classList.add('program-list');

        details.programs.forEach(program => {
            const subLi = document.createElement("li");
            subLi.classList.add('program-item');

            // Создаем элемент anchor (<a>) для названия программы
            const programLink = document.createElement('a');
            programLink.href = program.program_url;
            programLink.target = "_blank";
            programLink.classList.add('program-link');
            programLink.textContent = program.name;

            let requirementsText = '';
            if (program.required_all || program.required_any) {
                const requiredAllStr = program.required_all
                    ? `Обязательные предметы: ${program.required_all}<br>`
                    : '';
                const requiredAnyStr = program.required_any
                    ? `Предметы по выбору: ${program.required_any.split(',').join('/')}`
                    : '';

                requirementsText = `${requiredAllStr}${requiredAnyStr}`;
            }

            subLi.innerHTML = `
                <div class="program-info">
                    ${programLink.outerHTML}
                </div>
                <p class="requirements-text">${requirementsText}</p>
            `;

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

const toggle = document.getElementById('theme-toggle');

toggle.addEventListener('change', () => {
    if (toggle.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
});

// При загрузке страницы проверяем сохранённую тему
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.checked = true;
} else {
    document.documentElement.removeAttribute('data-theme');
    toggle.checked = false;
}
