document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#search-form");
    const resultsContainer = document.querySelector("#results");
    const errorBox = document.querySelector("#error-box");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Считываем выбранные предметы и города
        const checkedSubjects = Array.from(document.querySelectorAll('input[name="subjects[]"]:checked')).map(subjectCheckbox => subjectCheckbox.value);
        const checkedCities = Array.from(document.querySelectorAll('input[name="cities[]"]:checked')).map(cityCheckbox => cityCheckbox.value);

        // Очищаем область ошибок и результатов
        errorBox.style.display = "none";
        errorBox.textContent = "";
        resultsContainer.innerHTML = "";

        try {
            // Формируем запрос
            const url = `/api/universities/get_universities/?subjects=${encodeURIComponent(checkedSubjects.join(","))}&city=${encodeURIComponent(checkedCities.join(","))}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Ошибка сервера");
            }

            const data = await response.json();

            // Если университеты не найдены
            if (!data || data.length === 0) {
                resultsContainer.innerHTML = "<p>Университеты не найдены</p>";
                return;
            }

            // Рендер
            const ul = document.createElement("ul");

            data.forEach(u => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${u.name}</strong> (${u.country || "страна не указана"})`;

                if (u.programs && u.programs.length > 0) {
                    const subUl = document.createElement("ul");

                    u.programs.forEach(p => {
                        const subLi = document.createElement("li");
                        subLi.textContent = `Программа: ${p.name}, Предметы: ${p.required_subjects}`;
                        subUl.appendChild(subLi);
                    });

                    li.appendChild(subUl);
                }

                ul.appendChild(li);
            });

            resultsContainer.appendChild(ul);

        } catch (err) {
            errorBox.style.display = "block";
            errorBox.textContent = "Произошла ошибка при выполнении запроса";
        }
    });

    // Элементы для вывода выбранной информации
    const subjectsLabel = document.querySelector(".subjects-label");
    const citiesLabel = document.querySelector(".cities-label");

    // Функция для скрытия-показа списка предметов
    function toggleSubjects(event) {
        event.preventDefault();
        const subjectList = document.querySelector(".subject-list");
        subjectList.classList.toggle("hidden");
    }

    // Новая функция для скрытия-показа списка городов
    function toggleCities(event) {
        event.preventDefault();
        const citiesList = document.querySelector(".cities-list");
        citiesList.classList.toggle("hidden");
    }

    // Функция обновления выбранного текста
    function updateSelectedItems() {
        let selectedSubjects = [];
        let selectedCities = [];

        // Выбираем отмеченные предметы
        document.querySelectorAll("input[name='subjects[]']:checked").forEach(cb => selectedSubjects.push(cb.value));

        // Выбираем отмеченные города
        document.querySelectorAll("input[name='cities[]']:checked").forEach(cb => selectedCities.push(cb.value));

        // Отображаем выбранные предметы
        if (selectedSubjects.length > 0) {
            subjectsLabel.innerText = selectedSubjects.join(", ");
        } else {
            subjectsLabel.innerText = "Предметы";
        }

        // Отображаем выбранные города
        if (selectedCities.length > 0) {
            citiesLabel.innerText = selectedCities.join(", ");
        } else {
            citiesLabel.innerText = "Города";
        }
    }

    // Присоединяем события кликов
    document.querySelector(".subjects-btn").addEventListener("click", toggleSubjects);
    document.querySelector(".cities-btn").addEventListener("click", toggleCities);

    // Следим за изменениями чекбоксов
    document.querySelectorAll("input[type='checkbox']").forEach(cb => cb.addEventListener("change", updateSelectedItems));
});
