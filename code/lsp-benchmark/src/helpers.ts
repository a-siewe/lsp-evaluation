import * as fs from "fs";
import * as path from "path";
import { ExecutionDuration } from "./types";

export const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

export const getFiles = (dir, fileExtension) => {
  return walkSync(dir).filter(file => {
    return path.extname(file) === fileExtension;
  });
};

export function writeFile(filePath: string, content: string) {
  let p = new Promise(function(resolve, reject) {
    let dirname = path.dirname(filePath);

    if (!isDirectory(dirname)) {
      mkdirp(dirname, err => {
        if (err) {
          return reject(err);
        }
        fs.writeFile(filePath, content, { flag: "w+" }, err => {
          if (err) {
            return reject(err);
          }
          return resolve();
        });
      });
    } else {
      fs.writeFile(filePath, content, { flag: "w+" }, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    }
  });

  return p;
}

/**
 * create a directory recursively
 * note: use this since the recursive option of mkdirSync is not working
 * @param dir
 */
export function mkdirp(dir: string, cb?) {
  if (fs.existsSync(dir)) {
    return true;
  }
  const dirname = path.dirname(dir);
  mkdirp(dirname, cb);
  fs.mkdir(dir, cb);
}

/**
 * Returns true if the filepath exists and is a directory
 */
export function isDirectory(filepath) {
  try {
    return fs.statSync(filepath).isDirectory();
  } catch (err) {
    // Ignore error
  }
  return false;
}

export const getMeanExecutionDuration = (durations: ExecutionDuration) => {};
