import * as fs from "fs"


const writeToJson = (filename, data) => {
  const jsonData = JSON.stringify(data, null, 2);

  fs.writeFile(filename, jsonData, { flag: 'a' }, (err) => {
    if (err) {
      console.error('Error appending to file:', err);
    } else {
      console.log('Data has been appended to file successfully.');
    }
  });
}

export {
  writeToJson
}
