import { exec } from "child_process";
import fs from "fs";
import path from "path";
import ghpages from "gh-pages";

// Carpetas a vigilar
const watchFolders = ["src", "public"];

// Archivos o carpetas a ignorar
const ignoreList = ["node_modules", "dist", ".env", ".git"];

// Extensiones que disparan deploy automático
const deployExtensions = [".ts", ".tsx", ".js", ".jsx", ".css", ".json"];

// Debounce en milisegundos
const DEBOUNCE_TIME = 3000; // 3 segundos

let timeoutId = null;

console.log("Auto-push watcher con debounce iniciado...");

// Función para comprobar si un path está ignorado
function isIgnored(filePath) {
  return ignoreList.some(ignored => filePath.includes(ignored));
}

// Función para comprobar si el cambio requiere deploy
function shouldDeploy(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  // Solo desplegar si es archivo de código y está en src o components
  return deployExtensions.includes(ext) && (filePath.includes("/src/") || filePath.includes("/components/"));
}

// Función que hace commit y push a main
function pushChanges(filePath) {
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

          // Después del push a main, ejecutar build + deploy si aplica
          if (shouldDeploy(filePath)) {
            buildAndDeploy();
          } else {
            console.log("Cambio detectado, pero no requiere build/deploy ✨");
          }
        }
      });
    }
  });
}

// Función para build + deploy a gh-pages
function buildAndDeploy() {
  console.log("Generando build...");
  exec("npm run build", (err, stdout, stderr) => {
    if (err) {
      console.error("Error en build:", stderr);
      return;
    }
    console.log(stdout);

    console.log("Publicando en gh-pages...");
    ghpages.publish("dist", { message: `auto-deploy: ${new Date().toLocaleTimeString()}` }, (err) => {
      if (err) console.error("Error al publicar en gh-pages:", err);
      else console.log("Deploy completado correctamente ✅");
    });
  });
}

// Vigilar todas las carpetas
watchFolders.forEach(folder => {
  const folderPath = path.join(process.cwd(), folder);

  fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (isIgnored(filename)) return;

    const fullPath = path.join(folderPath, filename);

    console.log(`Cambio detectado en ${filename}`);

    // Reiniciar el timer de debounce
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      pushChanges(fullPath);
    }, DEBOUNCE_TIME);
  });
});
