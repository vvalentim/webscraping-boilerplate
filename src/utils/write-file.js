import { createWriteStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Readable } from "node:stream";

const writeToFile = (absolutePath, data, encoding = "utf8") => {
  return new Promise((resolve) => {
    const dir = dirname(absolutePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (data instanceof Readable) {
      const ws = createWriteStream(absolutePath, encoding);

      data.pipe(ws);
      data.on("end", () => {
        resolve();
      });
    } else {
      writeFileSync(absolutePath, data);
      resolve();
    }
  });
};

export default writeToFile;
