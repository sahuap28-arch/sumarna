// ==========================
// LOGIN + REGISTER SYSTEM (LOCAL VERSION) + LOG TO VERCEL
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const togglePassword = document.getElementById("togglePassword");
    const message = document.getElementById("loginMessage");
    const rememberStatus = document.getElementById("rememberStatus");

    const regUser = document.getElementById("newUsername");
    const regPass = document.getElementById("newPassword");
    const regConfirm = document.getElementById("confirmPassword");
    const regMessage = document.getElementById("registerMessage");

    // Cek session login
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const currentUser = sessionStorage.getItem("currentUser");
    if (isLoggedIn && currentUser) {
        window.location.href = "pages/index.html";
        return;
    }

    // Default users
    const defaultUsers = [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "user", password: "user123", role: "user" },
    ];
    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify(defaultUsers));
    }

    // Fungsi umum
    function showMessage(el, text, type) {
        el.textContent = text;
        el.className = `login-message show ${type}`;
        setTimeout(() => el.classList.remove("show"), 3000);
    }

    function showRemember(text) {
        rememberStatus.textContent = text;
        rememberStatus.classList.add("show");
        setTimeout(() => rememberStatus.classList.remove("show"), 2500);
    }

    // Toggle password visibility
    togglePassword.addEventListener("click", () => {
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        togglePassword.textContent = isHidden ? "🙈" : "👁️";
    });

    // Load saved credentials
    const savedUser = localStorage.getItem("savedUsername");
    const savedPass = localStorage.getItem("savedPassword");
    if (savedUser || savedPass) {
        usernameInput.value = savedUser || "";
        passwordInput.value = savedPass || "";
        rememberMe.checked = true;
        showRemember("💾 Data login diisi otomatis");
    }

    // Ganti form
    showRegister.addEventListener("click", () => {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
    });
    showLogin.addEventListener("click", () => {
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });

    // ==========================
    // LOGIN handler
    // ==========================
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find((u) => u.username === username && u.password === password);
        if (!user) return showMessage(message, "❌ Username atau password salah!", "error");

        // session
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("currentUser", JSON.stringify(user));

        // remember
        if (rememberMe.checked) {
            localStorage.setItem("savedUsername", username);
            localStorage.setItem("savedPassword", password);
            showRemember("💾 Data login disimpan");
        } else {
            localStorage.removeItem("savedUsername");
            localStorage.removeItem("savedPassword");
            showRemember("🧹 Data login dihapus");
        }

        showMessage(message, "✅ Login berhasil! Mengalihkan...", "success");

        // ✅ Catat login ke serverless function di Vercel
        fetch("/api/log-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        })
            .then((res) => res.json())
            .then((data) => console.log("✅ Login logged:", data))
            .catch((err) => console.error("⚠️ Logging failed:", err));

        // Redirect
        setTimeout(() => (window.location.href = "pages/index.html"), 1200);
    });

    // ==========================
    // REGISTER handler
    // ==========================
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newUser = regUser.value.trim();
        const newPass = regPass.value.trim();
        const confirm = regConfirm.value.trim();

        if (!newUser || !newPass)
            return showMessage(regMessage, "❌ Harap isi semua field!", "error");
        if (newPass !== confirm)
            return showMessage(regMessage, "⚠️ Password tidak cocok!", "error");

        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find((u) => u.username === newUser))
            return showMessage(regMessage, "⚠️ Username sudah ada!", "error");

        users.push({ username: newUser, password: newPass, role: "user" });
        localStorage.setItem("users", JSON.stringify(users));

        showMessage(regMessage, "✅ Akun berhasil dibuat! Login otomatis...", "success");

        // Auto-login setelah register (opsional)
        setTimeout(() => {
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem(
                "currentUser",
                JSON.stringify({ username: newUser, password: newPass, role: "user" })
            );
            window.location.href = "pages/index.html";
        }, 1500);
    });
});
