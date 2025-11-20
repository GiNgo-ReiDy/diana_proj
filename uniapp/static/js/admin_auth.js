
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#login-form");
    
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // обязательно!

        const username = document.querySelector("#username").value.trim();
        const password = document.querySelector("#password").value.trim();
        
        if (username === "123" && password === "123") {
            window.location.href = "/admin";
        } else {
            let errorDiv = document.querySelector(".error");
            if (!errorDiv) {
                errorDiv = document.createElement("div");
                errorDiv.className = "error";
                form.prepend(errorDiv);
            }
            errorDiv.textContent = "Неверный логин или пароль";
        }
    });
});
