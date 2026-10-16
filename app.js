"use strict";

(() => {
  const frame = document.getElementById("osis-frame");
  const launch = document.getElementById("launch-screen");
  const status = document.getElementById("status-card");
  const statusTitle = document.getElementById("status-title");
  const statusCopy = document.getElementById("status-copy");
  const direct = document.getElementById("direct-link");
  const installButton = document.getElementById("install-button");
  const target = new URL(frame.dataset.appUrl);
  const page = new URLSearchParams(window.location.search).get("page");

  if (["home", "website", "login", "register", "dashboard"].includes(page)) {
    target.searchParams.set("page", page);
  }
  direct.href = target.href;

  let timeoutId;
  let attempted = false;
  let loadEventSeen = false;
  let slow = false;
  let frameError = false;
  let deferredInstallPrompt = null;

  function updateStatus() {
    if (!navigator.onLine) {
      statusTitle.textContent = "Anda sedang luring";
      statusCopy.textContent = "Hubungkan ke internet untuk membuka konten OSIS.";
    } else if (frameError) {
      statusTitle.textContent = "Halaman belum dapat dibuka";
      statusCopy.textContent = "Coba muat ulang atau pilih “Buka langsung” di kanan atas.";
    } else if (slow) {
      statusTitle.textContent = "Halaman masih dimuat";
      statusCopy.textContent = "Jika halaman tetap kosong, pilih “Buka langsung” di kanan atas.";
    } else {
      status.hidden = true;
      return;
    }
    status.hidden = false;
  }

  function loadApp() {
    window.clearTimeout(timeoutId);
    slow = false;
    frameError = false;
    loadEventSeen = false;
    updateStatus();
    launch.hidden = !navigator.onLine;

    // Pertahankan tampilan yang sudah ada saat koneksi terputus.
    if (!navigator.onLine) return;

    attempted = true;
    frame.src = target.href;
    timeoutId = window.setTimeout(() => {
      slow = true;
      launch.hidden = true;
      updateStatus();
    }, 15000);
  }

  frame.addEventListener("load", () => {
    if (!attempted) return;
    window.clearTimeout(timeoutId);
    loadEventSeen = true;
    slow = false;
    frameError = false;
    launch.hidden = true;
    // Event load juga bisa terjadi untuk halaman kesalahan Google.
    // Isi iframe lintas domain tidak dapat diperiksa dari halaman ini.
    updateStatus();
  });

  frame.addEventListener("error", () => {
    if (!attempted) return;
    window.clearTimeout(timeoutId);
    frameError = true;
    launch.hidden = true;
    updateStatus();
  });

  document.getElementById("reload-button").addEventListener("click", loadApp);
  document.getElementById("skip-link").addEventListener("click", event => {
    event.preventDefault();
    frame.focus();
  });

  window.addEventListener("offline", () => {
    window.clearTimeout(timeoutId);
    launch.hidden = true;
    updateStatus();
  });

  window.addEventListener("online", () => {
    // Jangan mengganggu formulir yang sudah terbuka ketika koneksi pulih.
    if (!loadEventSeen || frameError) loadApp();
    else updateStatus();
  });

  const displayMode = window.matchMedia("(display-mode: standalone)");
  function isInstalled() {
    return displayMode.matches || navigator.standalone === true;
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    if (isInstalled()) return;
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    const prompt = deferredInstallPrompt;
    deferredInstallPrompt = null;
    installButton.hidden = true;
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      // Setiap event hanya dapat dipakai sekali. Tunggu event berikutnya.
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  displayMode.addEventListener("change", () => {
    if (isInstalled()) {
      deferredInstallPrompt = null;
      installButton.hidden = true;
    }
  });

  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Akses website tetap berjalan jika mode PWA tidak tersedia.
    });
  }

  loadApp();
})();
