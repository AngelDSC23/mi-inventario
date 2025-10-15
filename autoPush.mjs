import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Carpetas a vigilar
const watchFolders = ["src", "public"];

// Archivos o carpetas a ignorar
const ignoreList = ["node_modules", "dist", ".env", ".git"];

// Debounce en milisegundos (tiempo mínimo entre commits)
const DEBOUNCE_TIME = 3000; // 3 segundos

let timeoutId = null;

console.log("Auto-push watcher iniciado (solo commit/push a main)...");

// Función para comprobar si un path está ignorado
function isIgnored(filePath) {
  return ignoreList.some(ignored => filePath.includes(ignored));
}

// Función que hace commit y push
function pushChanges() {
  exec("git status --porcelain", (err, stdout) => {
    if (err) {
      console.error("Error revisando git:", err);
      return;
    }

    if (stdout) {
      const commitMessage = `auto-update: ${new Date().toLocaleTimeString()}`;
      exec(`git add . && git commit -m "${commitMessage}" && git push origin main`, (err, out) => {
        if (err) {
          console.error("Error haciendo push:", err);
        } else {
          console.log("Cambios subidos a GitHub correctamente ✅");
          console.log("⚡ El deploy de la web se realiza automáticamente en GitHub Actions.");
        }
      });
    } else {
      console.log("No hay cambios pendientes para subir.");
    }
  });
}

// Vigilar todas las carpetas
watchFolders.forEach(folder => {
  const folderPath = path.join(process.cwd(), folder);

  fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (isIgnored(filename)) return;

    console.log(`Cambio detectado en ${filename}`);

    // Reiniciar el timer de debounce
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      pushChanges();
    }, DEBOUNCE_TIME);
  });
});
