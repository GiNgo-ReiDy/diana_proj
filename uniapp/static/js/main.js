document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#search-form");
    const resultsContainer = document.querySelector("#results");
    const errorBox = document.querySelector("#error-box");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Считываем значения
        const subjects = document.querySelector("#subjects").value.trim();
        const city = document.querySelector("#city").value.trim();

        // Очищаем область ошибок и результатов
        errorBox.style.display = "none";
        errorBox.textContent = "";
        resultsContainer.innerHTML = "";

        try {
            // Формируем запроuniс
            const url = `/api/universities/get_universities/?subjects=${encodeURIComponent(subjects)}&city=${encodeURIComponent(city)}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Ошибка сервера");
            }

            const data = await response.json();

            // Если пусто
            if (!data || data.length === 0) {
                resultsContainer.innerHTML = "<p>Университеты не найдены</p>";
                return;
            }

            // Рендер
            const ul = document.createElement("ul");

            data.forEach((u) => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${u.name}</strong> (${u.country || "страна не указана"})`;

                if (u.programs && u.programs.length > 0) {
                    const subUl = document.createElement("ul");

                    u.programs.forEach((p) => {
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
});

let subjectsLabel = document.querySelector(".subjects-label")
let subjectList = document.querySelector(".subject-list")

function toggleSubjects(e){
    e.preventDefault();
    subjectList.classList.toggle("hidden");
}

document.querySelector(".btn-dropdown").addEventListener("click", toggleSubjects);

document.querySelectorAll("input[type='checkbox']").forEach(function (checkbox){
    checkbox.addEventListener("change", updateSelectedSubjects);
});

function updateSelectedSubjects(){
    let selectedSubjects = [];
    document.querySelectorAll("input[type='checkbox']:checked").forEach(function (checkbox){
        selectedSubjects.push(checkbox.value)
    });
    if(selectedSubjects.length > 0){
        subjectsLabel.innerText = selectedSubjects.join(", ");
    } else{
        subjectsLabel.innerText = "Предметы";
    }

}

