document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#search-form");
    const resultsContainer = document.querySelector("#results");
    const errorBox = document.querySelector("#error-box");
    const citiesList = document.querySelector(".cities-list");
    const citiesLabel = document.querySelector(".cities-label");
    const countryToggle = document.querySelector("#country-toggle");
    const countryLabel = document.querySelector("#country-label");

    const cities = {
        "КНР": ["Сычуань","Пекин","Харбин","Синьчжу","Шанхай","Тяньцзинь","Ухань","Чунцин","Гуанси","Сиань","Хейлунцзян","Гуанчжоу","Гонконг","Шэньчжэнь","Нанкин","Хунань","Далянь","Наньчан","Шаньдунь","Чанчунь","Ляонин"],
        "РФ": ["Москва","Санкт-Петербург","Новосибирск","Казань","Екатеринбург","Нижний Новгород","Самара","Воронеж","Красноярск","Пермь","Челябинск","Омск","Ростов-на-Дону","Уфа","Волгоград","Краснодар"]
    };

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
        document.querySelector(".subjects-label").textContent = selectedSubjects.length ? selectedSubjects.join(", ") : "Предметы";
    }

    // Изначально КНР
    renderCities("КНР");

    countryToggle.addEventListener("change", () => {
        const country = countryToggle.checked ? "РФ" : "КНР";
        countryLabel.textContent = country;
        renderCities(country);
    });

    // Выпадающие списки
    document.querySelector(".subjects-btn").addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector(".subject-list").classList.toggle("hidden");
    });
    document.querySelector(".cities-btn").addEventListener("click", (e) => {
        e.preventDefault();
        citiesList.classList.toggle("hidden");
    });

    // Форма поиска
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const subjects = Array.from(document.querySelectorAll(".subject-list input:checked")).map(cb => cb.value);
        const citiesSelected = Array.from(document.querySelectorAll(".cities-list input:checked")).map(cb => cb.value);

        errorBox.style.display = "none";
        errorBox.textContent = "";
        resultsContainer.innerHTML = "";

        try {
            const url = `/api/universities/get_universities/?subjects=${encodeURIComponent(subjects.join(","))}&city=${encodeURIComponent(citiesSelected.join(","))}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error();

            const data = await response.json();
            if (!data || data.length === 0) {
                resultsContainer.innerHTML = "<p>Университеты не найдены</p>";
                return;
            }

            const ul = document.createElement("ul");
            data.forEach(u => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${u.name}</strong> <br><small>Города: ${u.cities.join(", ")}</small>`;
                if (u.programs?.length) {
                    const subUl = document.createElement("ul");
                    u.programs.forEach(p => {
                        const subLi = document.createElement("li");
                        subLi.textContent = `Программа: ${p.name} | Предметы: ${p.required_subjects.join(", ")}`;
                        subUl.appendChild(subLi);
                    });
                    li.appendChild(subUl);
                }
                ul.appendChild(li);
            });
            resultsContainer.appendChild(ul);

        } catch (err) {
            errorBox.style.display = "block";
            errorBox.textContent = "Ошибка при выполнении запроса";
        }
    });

    // Обновление подписей при изменении предметов
    document.querySelectorAll(".subject-list input[type='checkbox']").forEach(cb =>
        cb.addEventListener("change", updateLabels)
    );
});
