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

        // Преобразуем биты в массив предметов для каждого элемента
        const normalizedPrograms = program.map(p => ({
            ...p,
            required_subjects: maskToSubjects(p.mask_required_all), // Обязательные предметы
            optional_subjects: maskToSubjects(p.mask_required_any)  // Факультативные предметы
        }));

        console.log('program raw:', program);
        console.log('program normalized:', normalizedPrograms);
        renderTablePr(normalizedPrograms);
    } catch (err) {
        console.error(err);
        alert("Ошибка при загрузке списка программ");
    }
}

// Переводит битовую маску в список предметов
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

// Function to convert an array of subjects into a bitmask
function convertSubjectsToBitmask(subjects) {
    const SUBJECTS_BITMAP = {
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

    let bitmask = 0;
    subjects.forEach(subject => {
        if (SUBJECTS_BITMAP.hasOwnProperty(subject)) {
            bitmask |= SUBJECTS_BITMAP[subject];
        }
    });
    return bitmask;
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

function renderTablePr(programs) {
    const tbody = document.querySelector("#programTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    programs.forEach(prog => {
        // Безопасно преобразуем маски в текстовые представления предметов
        const requiredAllSubjects = prog.mask_required_all !== undefined && prog.mask_required_all !== null
            ? maskToSubjects(prog.mask_required_all).join(', ')
            : "не указано";

        const requiredAnySubjects = prog.mask_required_any !== undefined && prog.mask_required_any !== null
            ? maskToSubjects(prog.mask_required_any).join(', ')
            : "не указано";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${prog.id}</td>
            <td>${prog.name}</td>
            <td>Обязательно: ${requiredAllSubjects}<br />Дополнительно: ${requiredAnySubjects}</td>
            <td>${prog.program_url}</td>
            <td>${prog.university_id}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editProgram(${prog.id})">Редактировать</button>
                <button class="delete-btn" onclick="deleteProgram(${prog.id})">Удалить</button>
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
                <!-- Поле для обязательных предметов -->
                <label for="requiredSubjects">Обязательные предметы:</label><br />
                <textarea id="requiredSubjects" rows="2" cols="50"></textarea><br /><br />
        
                <!-- Поле для факультативных предметов -->
                <label for="optionalSubjects">Факультативные предметы:</label><br />
                <textarea id="optionalSubjects" rows="2" cols="50"></textarea><br /><br />
        
                <!-- Поле для университета -->
                <label for="programUni">ID университета:</label><br />
                <textarea id="programUni" rows="2" cols="50"></textarea><br /><br />
                
                <label for="programUrl">Ссылка на программу</label><br />
                <textarea id="programUrl" rows="2" cols="50"></textarea><br /><br />
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
    // Получаем данные из формы
    const requiredSubjectsRaw = document.getElementById('requiredSubjects').value || ''; // Обязательные предметы
    const optionalSubjectsRaw = document.getElementById('optionalSubjects').value || ''; // Факультативные предметы
    const programUrl = document.getElementById('programUrl').value.trim();
    const universityID = document.getElementById('programUni').value.trim();

    // Нормализуем и собираем данные
    const normalizedRequiredSubjects = normalizeSubjects(requiredSubjectsRaw);
    const normalizedOptionalSubjects = normalizeSubjects(optionalSubjectsRaw);

    // Проверяем корректность данных
    if (!(normalizedRequiredSubjects.length || normalizedOptionalSubjects.length)) {
        alert("Необходимо заполнить хотя бы одно из полей: обязательные или факультативные предметы!");
        return;
    }

    if (isNaN(universityID)) {
        alert("Введите корректный ID университета!");
        return;
    }

    if (!programUrl) {
        alert("Введите ссылку на проограмму университета");
        return;
    }

    // Преобразуем массивы предметов в битовые маски
    const requiredSubjectsBitmask = convertSubjectsToBitmask(normalizedRequiredSubjects);
    const optionalSubjectsBitmask = convertSubjectsToBitmask(normalizedOptionalSubjects);

    // Готовим данные для отправки
    const updatedData = {
        required_all: requiredSubjectsBitmask,
        required_any: optionalSubjectsBitmask,
        program_url: programUrl,
        university_id: parseInt(universityID)
    };

    // 🔥 Выводим в консоль отправляемые данные
    console.log("Отправляемые данные:", updatedData);

    try {
        // Отправляем PATCH-запрос на сервер
        const response = await fetch(`/api/program/update/${programID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error("Ошибка при обновлении программы");
        }

        alert("Изменения сохранены успешно.");
        closeModalProgram();
    } catch (err) {
        console.error(err);
        alert("Ошибка сервера при сохранении изменений");
    }
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
            <input type="text" id="newPrReqSubjects" placeholder="Обязательные предметы" required>
            <input type="text" id="newPrOptSubjects" placeholder="Факультативные предметы" required>
            <input type="text" id="newPrUrl" placeholder="Ссылка на образовательную программу" required>
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
    // Получаем данные из формы
    const name = document.getElementById("newPrName").value.trim();
    const reqSubjectsRaw = document.getElementById("newPrReqSubjects").value || '';
    const optSubjectsRaw = document.getElementById("newPrOptSubjects").value || '';
    const prUrl = document.getElementById("newPrUrl").value.trim();
    const university_id = parseInt(document.getElementById("newPrUniId").value.trim());

    // Нормализуем и обрабатываем данные
    const normalizedReqSubjects = normalizeSubjects(reqSubjectsRaw);
    const normalizedOptSubjects = normalizeSubjects(optSubjectsRaw);

    // Проверяем корректность данных
    if (!name) {
        alert("Название программы обязательно");
        return;
    }
    if (!normalizedReqSubjects.length && !normalizedOptSubjects.length) {
        alert("Необходимо указать хотя бы один предмет (обязательный или факультативный)");
        return;
    }
    if (!prUrl){
        alert("Нужно указать ссылку на сайт программы")
        return;
    }
    if (!university_id) {
        alert("Нужно указать ID университета");
        return;
    }

    // Преобразуем массивы предметов в битовые маски
    const requiredSubjectsBitmask = convertSubjectsToBitmask(normalizedReqSubjects);
    const optionalSubjectsBitmask = convertSubjectsToBitmask(normalizedOptSubjects);

    // Готовим данные для отправки
    const postData = {
        name: name,
        required_all: requiredSubjectsBitmask,
        required_any: optionalSubjectsBitmask,
        program_url: prUrl,
        university_id: university_id
    };

    try {
        // Отправляем POST-запрос на сервер
        const response = await fetch("/api/program/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(JSON.stringify(err));
        }

        alert("Программа добавлена!");
        document.getElementById("addFormContainer").remove();
        await loadProgram();
    } catch (err) {
        console.error(err);
        alert("Ошибка при добавлении программы:\n" + err.message);
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
