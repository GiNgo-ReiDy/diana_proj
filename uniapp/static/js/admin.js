document.addEventListener("DOMContentLoaded", () => {
    loadUniversities();
    loadProgram();

    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("keyup", searchTable);

    const addBtn = document.querySelector(".add-btn");
    addBtn.addEventListener("click", showAddForm);

    const addProgramBtn = document.querySelector(".add-program-btn");
    addProgramBtn.addEventListener("click", showAddFormPr);
});


//Загружает список университетов
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
/////


//Загружает список программ
async function loadProgram() {
    try {
        const response = await fetch("/api/program/all");

        if (!response.ok) {
            throw new Error("Ошибка загрузки данных");
        }

        const program = await response.json();
        renderTablePr(program);

    } catch (err) {
        console.error(err);
        alert("Ошибка при загрузке списка программ");
    }
}
/////


//Рендерит таблицу универов
function renderTable(universities) {
    const tbody = document.querySelector("#uniTable tbody");
    tbody.innerHTML = "";

    universities.forEach(u => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.cities}</td>
            
            <td class="actions">
                <button class="edit-btn" onclick="editUniversity(${u.id})">Редактировать</button>
                <button class="delete-btn" onclick="deleteUniversity(${u.id})">Удалить</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}
/////


//Рендерит таблицу программ
function renderTablePr(program) {
    const tbody = document.querySelector("#programTable tbody");
    tbody.innerHTML = "";

    program.forEach(p => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.required_subjects}</td>
            <td>${p.university_id}</td>
            
            <td class="actions">
                <button class="edit-btn" onclick="editProgram(${p.id})">Редактировать</button>
                <button class="delete-btn" onclick="deleteProgram(${p.id})">Удалить</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}
//////


//Все, связанное с редактированием университетов
async function editUniversity(id) {
    openModal(id);
}

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

                <label for="uniCities">Города:</label><br />
                <textarea id="uniCities" rows="4" cols="50"></textarea><br /><br />

                <button type="button" onclick="saveEditedUniversity(${universityID})">Сохранить изменения</button>
            </form>
        </div>
    `;

    document.body.appendChild(modalContainer);

    // Устанавливаем фокус на первое поле
    // document.getElementById('uniName').focus(); - у нас уже нет этого поля, думаю нет смысла в строчке
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
/////



//Все, что связано с редактированием программ: ЗАЧЕМ ОНО НАМ?
async function editProgram(id) {
    openModalProgram(id);
}

function openModalProgram(id) {
    // window.location.href = `/api/universities/update/${id}`;
    createModalWindowProgram(id);
}

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

    // // Устанавливаем фокус на первое поле
    // document.getElementById('proName').focus();
}

function closeModalProgram() {
    document.body.removeChild(document.querySelector('.modal-container'));
}

async function saveEditedProgram(programID) {
    let updatedData = {};


    const subjectsInput = document.getElementById('programSubjects').value.trim();

    if (subjectsInput !== '') {
        // Проверяем, есть ли запятые в строке
        if (subjectsInput.includes(',')) {
            // Есть запятые — значит, это несколько предметов
            updatedData.required_subjects = subjectsInput.split(',')
                                              .map(s => s.trim())      // Убираем лишнюю пунктуацию
                                              .filter(Boolean);       // Удаляем пустые элементы
        } else {
            // Нет запятых — считается одним предметом
            updatedData.required_subjects = [subjectsInput];
        }
    }

    const uniIDInput = document.getElementById('programUni').value.trim();
    if (uniIDInput !== '' && !isNaN(parseInt(uniIDInput))) { // Убедимся, что введено число
        updatedData.university_id = parseInt(uniIDInput);
    }

    if (Object.keys(updatedData).length === 0) {
        alert("Нет изменений для сохранения!");
        return;
    }

    try {
        const response = await fetch(`/api/program/update/${programID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
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
////



// Удаление университета по ID
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
///////


//Удаление программы по ID
async function deleteProgram(id) {
    if (!confirm("Удалить программу?")) return;

    try {
        const response = await fetch(`/api/program/delete/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Ошибка удаления");
        }

        alert("Удалено!");
        loadProgram(); // Обновляем таблицу

    } catch (err) {
        console.error(err);
        alert("Ошибка сервера");
    }
}
////////


//Показ формы добавления университета
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
//////


//Добавление университета
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
//////


//Показ формы добавления программы
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
    document.getElementById("cancelAdd").addEventListener("click", () => {
        container.remove();
    });
}
//////


//Добавление программы
async function addProgram() {
    const name = document.getElementById("newPrName").value.trim();
    const subjects = document.getElementById("newPrSubjects").value.split(",").map(c => c.trim()).filter(c => c);
    const uniid = document.getElementById("newPrUniId").value.trim();


    if (!name) {
        alert("Название программы обязательно");
        return;
    }

    if (!subjects) {
        alert("Обязательно сдавать предметы");
        return;
    }
    if (!uniid) {
        alert("Программа обязательно должна быть привязана к вузу");
        return;
    }

    try {
        const response = await fetch("/api/program/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, subjects, uniid })
        });

        if (!response.ok) {
            throw new Error("Ошибка при добавлении программы");
        }

        alert("Программа добавлена!");
        document.getElementById("addFormContainer").remove();
        loadProgram(); // Обновляем таблицу

    } catch (err) {
        console.error(err);
        alert("Ошибка сервера при добавлении программы");
    }
}
/////


//Поиск по таблице университетов
function searchTable() {
    let filter = document.getElementById("searchInput").value.toLowerCase();
    let rows = document.querySelectorAll("#uniTable tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}


//Поиск по таблице программ