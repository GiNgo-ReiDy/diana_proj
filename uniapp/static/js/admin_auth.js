document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("login-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const login = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`/api/password_check?password=${password}&login=${login}`);

            if (!response.ok) {
                throw new Error("Ошибка сервера");
            }

            const data = await response.json();

            if (data.status === "success") {
                window.location.href = "/admin";
            } else {
                alert("Неверный логин или пароль");
            }

        } catch (err) {
            console.error(err);
            alert("Ошибка сервера");
        }
    });

});
