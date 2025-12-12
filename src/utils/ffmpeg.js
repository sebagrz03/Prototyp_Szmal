import { execFile } from "child_process";

export function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile("ffmpeg", args, (err, stdout, stderr) => {
      if (err) {
        console.error("[FFMPEG ERROR]", stderr);
        return reject(err);
      }
      resolve({ stdout, stderr });
    });
  });
}
