import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Carpeta(s) a vigilar
const watchFolders = ["src", "public"]; 

// Archivos o carpetas a ignorar
const ignoreList = ["node_modules", "dist", ".env", ".git"];

console.log("Auto-push watcher mejorado iniciado...");

// Función para comprobar si un path está ignorado
function isIgnored(filePath) {
  return ignoreList.some(ignored => filePath.includes(ignored));
}

// Vigilar todas las carpetas
watchFolders.forEach(folder => {
  const folderPath = path.join(process.cwd(), folder);

  fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (isIgnored(filename)) return;

    console.log(`Cambio detectado en ${filename}`);

    // Comprobar si hay cambios git
    exec("git status --porcelain", (err, stdout) => {
      if (err) {
        console.error("Error revisando git:", err);
        return;
      }

      if (stdout) {
        // Hacer commit limpio
        const commitMessage = `auto-update: ${new Date().toLocaleTimeString()}`;
        exec(`git add . && git commit -m "${commitMessage}" && git push origin main`, (err, out) => {
          if (err) {
            console.error("Error haciendo push:", err);
          } else {
            console.log("Cambios subidos a GitHub correctamente ✅");
          }
        });
      }
    });
  });
});
