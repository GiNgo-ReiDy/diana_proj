document.querySelector("#search-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const program = document.querySelector("#program").value;
    const subjects = document.querySelector("#subjects").value;
    const city = document.querySelector("#city").value;

    const res = await fetch(`/api/universities?program=${encodeURIComponent(program)}&subjects=${encodeURIComponent(subjects)}&city=${encodeURIComponent(city)}`);
    const data = await res.json();

    const resultsContainer = document.querySelector("#results");
    resultsContainer.innerHTML = "";

    if (!data || data.length === 0) {
        resultsContainer.innerHTML = "<p>Университеты не найдены</p>";
        return;
    }

    const ul = document.createElement("ul");
    data.forEach(u => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${u.name}</strong> (${u.country})`;
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
});
