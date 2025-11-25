document.addEventListener("DOMContentLoaded", () => {
    loadUniversities();

    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("keyup", searchTable);

    const addBtn = document.querySelector(".add-btn");
    addBtn.addEventListener("click", showAddForm);
});

async function editUniversity(id) {
    openModal(id);
}

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
            <td>${u.cities}</td>
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
function openModal(id) {
    // window.location.href = `/api/universities/update/${id}`;
    createModalWindow(id);
}

function createModalWindow(universityID){
    const modalContainer = document.createElement('div')
    modalContainer.className = 'modal-container';

    modalContainer.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal()">x</span>
            <h2>Редактирование университета</h2>
            <form id="editForm">
                <label for="uniName">Название университета:</label><br />
                <input type="text" id="uniName" required /><br /><br />

                <label for="uniCities">Города:</label><br />
                <textarea id="uniCities" rows="4" cols="50"></textarea><br /><br />

                <button type="button" onclick="saveEditedUniversity(${universityID})">Сохранить изменения</button>
            </form>
        </div>
    `;

    document.body.appendChild(modalContainer);

    // Устанавливаем фокус на первое поле
    document.getElementById('uniName').focus();
}

function closeModal() {
    document.body.removeChild(document.querySelector('.modal-container'));
}

async function saveEditedUniversity(universityID) {
    const cities = document.getElementById('uniCities').value.split(',')
                            .map(c => c.trim())
                            .filter(Boolean); // Фильтрация пустых строк

    if (!cities.length) {
        alert("Нужно указать хотя бы один город.");
        return;
    }

    try {
        const response = await fetch(`/api/universities/update/${universityID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ // Только изменённые данные
                cities
            })
        });

        if (!response.ok) {
            throw new Error("Ошибка при обновлении университета");
        }

        alert("Список городов успешно обновлён.");
        closeModal(); // Закрываем окно после успешного сохранения
        // Можно вызвать функцию для обновления таблицы на странице
    } catch (err) {
        console.error(err);
        alert("Ошибка сервера при обновлении университета");
    }
    // Обновляем страницу с текущими данными университета
    await loadUniversities();
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
