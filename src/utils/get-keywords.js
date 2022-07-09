import { readFileSync } from "node:fs";
import { EOL } from "node:os";

const getKeywords = (absolutePath, encoding = "utf8") => {
  return readFileSync(absolutePath, encoding).split(EOL);
};

export default getKeywords;
