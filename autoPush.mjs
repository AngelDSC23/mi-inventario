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

// Detectar si es Windows
const isWindows = process.platform === "win32";

// Función para comprobar si un path está ignorado
function isIgnored(filePath) {
  return ignoreList.some(ignored => filePath.includes(ignored));
}

// Función para comprobar si el cambio requiere deploy
function shouldDeploy(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return deployExtensions.includes(ext) && (filePath.includes(`${path.sep}src${path.sep}`) || filePath.includes(`${path.sep}components${path.sep}`));
}

// Función que hace commit y push a main
function pushChanges(filePath) {
  const repoRoot = process.cwd();

  // En Windows, revisar longitud de la ruta
  if (isWindows && repoRoot.length > 50) { // Ajustable según conveniencia
    console.warn("⚠️ Ruta del proyecto larga en Windows, deploy a gh-pages puede fallar (ENAMETOOLONG). Considera moverlo a una ruta más corta.");
  }

  exec("git status --porcelain", { cwd: repoRoot }, (err, stdout, stderr) => {
    if (err) {
      console.error("Error revisando git:", err, stderr);
      return;
    }

    if (!stdout) {
      console.log("No hay cambios para subir a GitHub.");
      return;
    }

    console.log("Archivos detectados por git:\n", stdout);

    const commitMessage = `auto-update: ${new Date().toLocaleTimeString()}`;
    exec(`git add . && git commit -m "${commitMessage}" && git push origin main`, { cwd: repoRoot }, (err, out, errOut) => {
      if (err) {
        console.error("Error haciendo push:", err, errOut);
      } else {
        console.log("Cambios subidos a GitHub correctamente ✅");

        if (shouldDeploy(filePath)) {
          if (isWindows && repoRoot.length > 50) {
            console.log("Cambio detectado en archivo crítico, pero deploy se omite en Windows por ruta larga ⚠️");
          } else {
            console.log("Archivo crítico detectado, iniciando build + deploy...");
            buildAndDeploy();
          }
        } else {
          console.log("Cambio detectado, pero no requiere build/deploy ✨");
        }
      }
    });
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

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      pushChanges(fullPath);
    }, DEBOUNCE_TIME);
  });
});
