// ==========================
// === SISTEM HALAMAN UTAMA ===
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
    initNavbar();
    initGallery();
});

// === CEK LOGIN ===
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const userData = sessionStorage.getItem("currentUser");

    if (!isLoggedIn || !userData) {
        alert("Silakan login terlebih dahulu!");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    const userInfo = document.getElementById("userInfo");
    if (userInfo) userInfo.textContent = `Halo, ${user.username}`;
}

// === LOGOUT ===
function handleLogout() {
    if (confirm("Yakin ingin keluar?")) {
        // clear only session (kehilangan "logged in" status)
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("currentUser");
        // DO NOT remove savedUsername/savedPassword here so "Remember me" persists across sessions.
        // If you want a "Forget me" button, implement separate logic for that.
        window.location.href = "login.html";
    }
}

// ==========================
// === NAVBAR ===
// ==========================
function initNavbar() {
    const hamburger = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links a");

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener("click", function () {
        const expanded = hamburger.getAttribute("aria-expanded") === "true";
        hamburger.setAttribute("aria-expanded", (!expanded).toString());
        navMenu.classList.toggle("show");
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", function (event) {
            hamburger.setAttribute("aria-expanded", "false");
            navMenu.classList.remove("show");
            navLinks.forEach((item) => item.classList.remove("active"));
            this.classList.add("active");

            const href = this.getAttribute("href");
            if (href.startsWith("#")) {
                event.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}


// ==========================
// === WHATSAPP BUTTON ===
// ==========================
function initWhatsAppButtons() {
    const waButtons = document.querySelectorAll(".wa-btn");
    waButtons.forEach((btn) => {
        const phoneNumber = btn.getAttribute("data-number");
        if (phoneNumber && phoneNumber !== "+62") {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                const clean = phoneNumber.replace(/\D/g, "");
                window.open(`https://wa.me/${clean}`, "_blank");
            });
        } else {
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
        }
    });
}

// ==========================
// === LIQUID MORPH ===
// ==========================
function initLiquidMorph() {
    document.querySelectorAll(".liquid-morph-element").forEach((el) => {
        el.tabIndex = 0;
        el.setAttribute("role", "button");

        el.addEventListener("click", function () {
            let link = this.getAttribute("onclick");
            if (!link) {
                const child = this.querySelector("[onclick]");
                link = child ? child.getAttribute("onclick") : null;
            }
            if (link) {
                const match = link.match(/'([^']+)'/);
                if (match) window.location.href = match[1];
            }
        });
    });
}

// ==========================
// === SISTEM GALERI ===
// ==========================
function initGallery() {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) return;

    const user = JSON.parse(userData);
    const currentUserRole = user.username === "admin" ? "admin" : "user";
    const currentUserName = user.username;

    let db;
    const request = indexedDB.open("GalleryDB", 6);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains("photos")) {
            const store = db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
            store.createIndex("name", "name", { unique: false });
            store.createIndex("uploader", "uploader", { unique: false });
            store.createIndex("date", "date", { unique: false });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadGallery();
    };

    request.onerror = () => showNotification("Gagal membuka database", "error");

    // === Elemen DOM ===
    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");
    const previewContainer = document.getElementById("previewContainer");
    const previewSection = document.getElementById("previewSection");
    const uploadBtn = document.getElementById("uploadBtn");
    const galleryContainer = document.getElementById("galleryContainer");

    // Tambah input nama pengunggah otomatis
    if (uploadArea) {
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Nama pengunggah...";
        nameInput.value = currentUserName;
        nameInput.disabled = true;
        nameInput.className = "form-control uploader-name";
        nameInput.style =
            "display:block;margin:10px 0 20px;padding:10px;width:100%;max-width:300px;border:1px solid #ccc;border-radius:5px;background:#f7f7f7;";
        uploadArea.insertAdjacentElement("afterend", nameInput);
    }

    let selectedFiles = [];

    // === Upload dan Preview ===
    if (uploadArea && fileInput) {
        uploadArea.addEventListener("click", () => fileInput.click());
        uploadArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = "#eef3ff";
        });
        uploadArea.addEventListener("dragleave", () => (uploadArea.style.backgroundColor = ""));
        uploadArea.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = "";
            handleFiles(e.dataTransfer.files);
        });
        fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
    }

    function handleFiles(files) {
        selectedFiles = Array.from(files).filter((f) => f.size <= 5 * 1024 * 1024);
        if (!selectedFiles.length) return showNotification("File kosong atau terlalu besar", "error");

        previewContainer.innerHTML = "";
        selectedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement("div");
                item.className = "preview-item";
                item.innerHTML = `
          <img src="${e.target.result}" class="preview-img" />
          <div class="preview-info">
            <div class="preview-name">${file.name}</div>
            <div class="preview-size">${(file.size / 1024).toFixed(1)} KB</div>
          </div>`;
                previewContainer.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
        previewSection.style.display = "block";
        uploadBtn.disabled = false;
    }

    // === Simpan ke IndexedDB ===
    if (uploadBtn) {
        uploadBtn.addEventListener("click", () => {
            if (!selectedFiles.length) return alert("Pilih foto terlebih dahulu!");

            const tx = db.transaction("photos", "readwrite");
            const store = tx.objectStore("photos");

            selectedFiles.forEach((file) => {
                const now = new Date();
                const dateStr = now.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });
                store.add({
                    name: file.name,
                    photo: file,
                    uploader: currentUserName,
                    date: dateStr,
                });
            });

            tx.oncomplete = () => {
                selectedFiles = [];
                previewSection.style.display = "none";
                uploadBtn.disabled = true;
                fileInput.value = "";
                showNotification("Foto berhasil disimpan", "success");
                loadGallery();
            };
        });
    }

    // === Tampilkan Galeri ===
    function loadGallery() {
        const tx = db.transaction("photos", "readonly");
        const store = tx.objectStore("photos");
        const request = store.getAll();

        request.onsuccess = (e) => {
            const data = e.target.result;
            galleryContainer.innerHTML = "";

            if (!data.length) {
                galleryContainer.innerHTML = `
          <div class="empty-gallery"><i>🖼️</i><p>Belum ada foto diunggah</p></div>`;
                return;
            }

            data.reverse().forEach((item) => {
                const imgURL = URL.createObjectURL(item.photo);
                const div = document.createElement("div");
                div.className = "gallery-item";
                div.innerHTML = `
          <img src="${imgURL}" class="gallery-img" />
          <div class="gallery-info">
            <div class="gallery-name">${item.name}</div>
            <div class="gallery-date">oleh: ${item.uploader || "-"} – ${item.date || "-"}</div>
            ${currentUserRole === "admin"
                        ? `<button class="btn btn-secondary" onclick="deletePhoto(${item.id})">Hapus</button>`
                        : ""
                    }
          </div>`;
                galleryContainer.appendChild(div);
            });
        };
    }

    // === Hapus foto (khusus admin) ===
    window.deletePhoto = function (id) {
        if (currentUserRole !== "admin") return alert("Hanya admin yang dapat menghapus foto.");
        if (!confirm("Yakin hapus foto ini?")) return;

        const tx = db.transaction("photos", "readwrite");
        tx.objectStore("photos").delete(id);
        tx.oncomplete = () => {
            showNotification("Foto dihapus", "success");
            loadGallery();
        };
    };

    // === Notifikasi kecil ===
    function showNotification(msg, type) {
        const notif = document.getElementById("notification");
        if (!notif) return alert(msg);
        notif.textContent = msg;
        notif.className = `notification show ${type}`;
        setTimeout(() => notif.classList.remove("show"), 2500);
    }
}