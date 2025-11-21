document.addEventListener("DOMContentLoaded", () => {
    loadUniversities();

    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("keyup", searchTable);

    const addBtn = document.querySelector(".add-btn");
    addBtn.addEventListener("click", showAddForm);
});

/**
 * Загружает список университетов с API
 */
async function loadUniversities() {
    try {
        const response = await fetch("/api/universities/all");

        if (!response.ok) {
            throw new Error("Ошибка загрузки данных");
        }

        const universities = await response.json();
        renderTable(universities);

    } catch (err) {
        console.error(err);
        alert("Ошибка при загрузке списка университетов");
    }
}

/**
 * Рендер таблицы
 */
function renderTable(universities) {
    const tbody = document.querySelector("#uniTable tbody");
    tbody.innerHTML = "";

    universities.forEach(u => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.cities?.[0] || ""}</td>
            <td>${u.cities?.[1] || ""}</td>
            <td>${u.programs.map(p => p.required_subjects.join(", ")).join("<br>")}</td>
            <td>${u.programs.map(p => p.name).join("<br>")}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editUniversity(${u.id})">Редактировать</button>
                <button class="delete-btn" onclick="deleteUniversity(${u.id})">Удалить</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/**
 * Переход к редактированию
 */
function editUniversity(id) {
    window.location.href = `/admin/universities/${id}/edit`;
}

/**
 * Удаление
 */
async function deleteUniversity(id) {
    if (!confirm("Удалить университет?")) return;

    try {
        const response = await fetch(`/api/universities/delete/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Ошибка удаления");
        }

        alert("Удалено!");
        loadUniversities(); // Обновляем таблицу

    } catch (err) {
        console.error(err);
        alert("Ошибка сервера");
    }
}

/**
 * Поиск по таблице
 */
function searchTable() {
    let filter = document.getElementById("searchInput").value.toLowerCase();
    let rows = document.querySelectorAll("#uniTable tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

/**
 * Показать форму добавления университета
 */
function showAddForm() {
    const formHtml = `
        <div id="addFormContainer" style="margin: 20px 0;">
            <input type="text" id="newUniName" placeholder="Название университета" required>
            <input type="text" id="newUniCities" placeholder="Города (через запятую)">
            <button id="submitAdd">Добавить</button>
            <button id="cancelAdd">Отмена</button>
        </div>
    `;
    const container = document.createElement("div");
    container.innerHTML = formHtml;
    document.body.insertBefore(container, document.querySelector("#uniTable"));

    document.getElementById("submitAdd").addEventListener("click", addUniversity);
    document.getElementById("cancelAdd").addEventListener("click", () => {
        container.remove();
    });
}

/**
 * Добавление нового университета через API
 */
async function addUniversity() {
    const name = document.getElementById("newUniName").value.trim();
    const cities = document.getElementById("newUniCities").value.split(",").map(c => c.trim()).filter(c => c);

    if (!name) {
        alert("Название университета обязательно");
        return;
    }

    try {
        const response = await fetch("/api/universities/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, cities })
        });

        if (!response.ok) {
            throw new Error("Ошибка при добавлении университета");
        }

        alert("Университет добавлен!");
        document.getElementById("addFormContainer").remove();
        loadUniversities(); // Обновляем таблицу

    } catch (err) {
        console.error(err);
        alert("Ошибка сервера при добавлении университета");
    }
}
