import { exec } from "child_process";

exec('git add . && git commit -m "test commit" && git push origin main', (err, stdout, stderr) => {
  console.log("STDOUT:", stdout);
  console.log("STDERR:", stderr);
  console.log("ERR:", err);
});
