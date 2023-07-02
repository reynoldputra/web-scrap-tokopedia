import * as fs from "fs"
import { writeJsonFileSync } from "write-json-file";


const writeToJson = (filePath, newData) => {
  console.log("Writing to json")
  if (!fs.existsSync(filePath)) {
    const emptyData = [];
    writeJsonFileSync(filePath, emptyData)
  }
  fs.readFile(filePath, 'utf8', (err, data) => {
    const jsonData = JSON.parse(data);
    writeJsonFileSync(filePath, [...jsonData, ...newData])
  });
  console.log("Success writing")
}

export {
  writeToJson
}
