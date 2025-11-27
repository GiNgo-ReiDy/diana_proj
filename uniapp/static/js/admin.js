document.addEventListener("DOMContentLoaded", () => {
    loadUniversities();
    loadProgram();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("keyup", searchTable);

    const addBtn = document.querySelector(".add-btn");
    if (addBtn) addBtn.addEventListener("click", showAddForm);

    const addProgramBtn = document.querySelector(".add-program-btn");
    if (addProgramBtn) addProgramBtn.addEventListener("click", showAddFormPr);
});

// ----- Helpers -----
function normalizeSubjects(raw) {
    // Возвращает массив строк или null
    if (raw == null) return null;

    // Если уже массив
    if (Array.isArray(raw)) {
        // Если получили массив одиночных символов -> склеим в одно слово и вернём как один элемент
        if (raw.length > 0 && raw.every(x => typeof x === 'string' && x.length === 1)) {
            return ['' + raw.join('')];
        }
        // Если элементы — строки длинее 1, считаем, что это нормальный массив предметов
        return raw.map(x => String(x).trim()).filter(Boolean);
    }

    // Если строка — разделим по запятым/точкам с запятой/вертикальной черте
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed === '') return [];
        return trimmed.split(/[;,|]+/).map(s => s.trim()).filter(Boolean);
    }

    // В остальных случаях попытка привести к строке
    return [String(raw)];
}

// ----- Load -----
async function loadUniversities() {
    try {
        const response = await fetch("/api/universities/all");
        if (!response.ok) throw new Error("Ошибка загрузки данных");
        const universities = await response.json();
        renderTable(universities);
    } catch (err) {
        console.error(err);
        alert("Ошибка при загрузке списка университетов");
    }
}

async function loadProgram() {
    try {
        const response = await fetch("/api/program/all");
        if (!response.ok) throw new Error("Ошибка загрузки данных");
        const program = await response.json();
        // Нормализуем полученные записи (на фронте)
        const normalized = program.map(p => ({
            ...p,
            required_subjects: normalizeSubjects(p.required_subjects)
        }));
        console.log('program raw:', program);
        console.log('program normalized:', normalized);
        renderTablePr(normalized);
    } catch (err) {
        console.error(err);
        alert("Ошибка при загрузке списка программ");
    }
}

// ----- Render tables -----
function renderTable(universities) {
    const tbody = document.querySelector("#uniTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    universities.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${Array.isArray(u.cities) ? u.cities.join(", ") : u.cities}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editUniversity(${u.id})">Редактировать</button>
                <button class="delete-btn" onclick="deleteUniversity(${u.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTablePr(program) {
    const tbody = document.querySelector("#programTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    program.forEach(p => {
        const subjArray = normalizeSubjects(p.required_subjects) || [];
        const subjects = subjArray.join(", ");
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${subjects}</td>
            <td>${p.university_id}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editProgram(${p.id})">Редактировать</button>
                <button class="delete-btn" onclick="deleteProgram(${p.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ----- Universities: edit/add/delete -----
async function editUniversity(id) { createModalWindow(id); }
function createModalWindow(universityID){
    const modalContainer = document.createElement('div')
    modalContainer.className = 'modal-container';
    modalContainer.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal()">x</span>
            <h2>Редактирование университета</h2>
            <form id="editForm">
                <label for="uniCities">Города:</label><br />
                <textarea id="uniCities" rows="4" cols="50"></textarea><br /><br />
                <button type="button" onclick="saveEditedUniversity(${universityID})">Сохранить изменения</button>
            </form>
        </div>
    `;
    document.body.appendChild(modalContainer);
}
function closeModal() {
    const el = document.querySelector('.modal-container');
    if (el) document.body.removeChild(el);
}
async function saveEditedUniversity(universityID) {
    const cities = (document.getElementById('uniCities').value || '')
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
    if (!cities.length) { alert("Нужно указать хотя бы один город."); return; }
    try {
        const response = await fetch(`/api/universities/update/${universityID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cities })
        });
        if (!response.ok) throw new Error("Ошибка при обновлении университета");
        alert("Список городов успешно обновлён.");
        closeModal();
    } catch (err) {
        console.error(err);
        alert("Ошибка сервера при обновлении университета");
    }
    await loadUniversities();
}

// ----- Programs: edit/add/delete -----
async function editProgram(id) { createModalWindowProgram(id); }
function createModalWindowProgram(programID){
    const modalContainer = document.createElement('div')
    modalContainer.className = 'modal-container';
    modalContainer.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="closeModalProgram()">x</span>
            <h2>Редактирование программы №${programID}</h2>
            <form id="editForm">
                <label for="programSubjects">Предметы для сдачи:</label><br />
                <textarea id="programSubjects" rows="2" cols="50"></textarea><br /><br />
                <label for="programUni">ID университета:</label><br />
                <textarea id="programUni" rows="2" cols="50"></textarea><br /><br />
                <button type="button" onclick="saveEditedProgram(${programID})">Сохранить изменения</button>
            </form>
        </div>
    `;
    document.body.appendChild(modalContainer);
}
function closeModalProgram() {
    const el = document.querySelector('.modal-container');
    if (el) document.body.removeChild(el);
}

async function saveEditedProgram(programID) {
    let updatedData = {};

    // Берём значение как строку
    const subjectsRaw = document.getElementById('programSubjects').value || '';
    // Нормализуем в массив
    const subjectsArr = normalizeSubjects(subjectsRaw);

    if (subjectsArr && subjectsArr.length) {
        updatedData.required_subjects = subjectsArr;
    }

    const uniIDInput = (document.getElementById('programUni').value || '').trim();
    if (uniIDInput !== '' && !isNaN(parseInt(uniIDInput))) {
        updatedData.university_id = parseInt(uniIDInput);
    }

    if (Object.keys(updatedData).length === 0) {
        alert("Нет изменений для сохранения!");
        return;
    }

    console.log('sending updatedData:', updatedData);

    try {
        const response = await fetch(`/api/program/update/${programID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) throw new Error("Ошибка при обновлении программы");
        alert("Изменения сохранены успешно.");
        closeModalProgram();
    } catch (err) {
        console.error(err);
        alert("Ошибка сервера при сохранении изменений");
    }

    await loadProgram();
}

// Delete
async function deleteUniversity(id) {
    if (!confirm("Удалить университет?")) return;
    try {
        const response = await fetch(`/api/universities/delete/${id}`, { method: "DELETE"});
        if (!response.ok) throw new Error("Ошибка удаления");
        alert("Удалено!");
        loadUniversities();
    } catch (err) {
        console.error(err);
        alert("Ошибка сервера");
    }
}
async function deleteProgram(id) {
    if (!confirm("Удалить программу?")) return;
    try {
        const response = await fetch(`/api/program/delete/${id}`, { method: "DELETE"});
        if (!response.ok) throw new Error("Ошибка удаления");
        alert("Удалено!");
        loadProgram();
    } catch (err) {
        console.error(err);
        alert("Ошибка сервера");
    }
}

// Add forms
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
    document.getElementById("cancelAdd").addEventListener("click", () => container.remove());
}
async function addUniversity() {
    const name = document.getElementById("newUniName").value.trim();
    const cities = (document.getElementById("newUniCities").value || '').split(",").map(c => c.trim()).filter(c => c);
    if (!name) { alert("Название университета обязательно"); return; }
    try {
        const response = await fetch("/api/universities/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, cities })
        });
        if (!response.ok) throw new Error("Ошибка при добавлении университета");
        alert("Университет добавлен!");
        document.getElementById("addFormContainer").remove();
        loadUniversities();
    } catch (err) {
        console.error(err);
        alert("Ошибка сервера при добавлении университета");
    }
}

function showAddFormPr() {
    const formHtml = `
        <div id="addFormContainer" style="margin: 20px 0;">
            <input type="text" id="newPrName" placeholder="Название программы" required>
            <input type="text" id="newPrSubjects" placeholder="Необходимые предметы(через запятую)" required>
            <input type="text" id="newPrUniId" placeholder="ID вуза" required>
            <button id="submitAdd">Добавить</button>
            <button id="cancelAdd">Отмена</button>
        </div>
    `;
    const container = document.createElement("div");
    container.innerHTML = formHtml;
    document.body.insertBefore(container, document.querySelector("#programTable"));
    document.getElementById("submitAdd").addEventListener("click", addProgram);
    document.getElementById("cancelAdd").addEventListener("click", () => container.remove());
}
async function addProgram() {
    const name = document.getElementById("newPrName").value.trim();
    const subjects = (document.getElementById("newPrSubjects").value || '').split(",").map(c => c.trim()).filter(c => c);
    const uniid = document.getElementById("newPrUniId").value.trim();
    if (!name) { alert("Название программы обязательно"); return; }
    if (!subjects.length) { alert("Обязательно сдавать предметы"); return; }
    if (!uniid) { alert("Программа обязательно должна быть привязана к вузу"); return; }
    try {
        const response = await fetch("/api/program/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, subjects, uniid })
        });
        if (!response.ok) throw new Error("Ошибка при добавлении программы");
        alert("Программа добавлена!");
        document.getElementById("addFormContainer").remove();
        loadProgram();
    } catch (err) {
        console.error(err);
        alert("Ошибка сервера при добавлении программы");
    }
}

// Search
function searchTable() {
    let filter = (document.getElementById("searchInput").value || '').toLowerCase();
    let rows = document.querySelectorAll("#uniTable tbody tr");
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}
