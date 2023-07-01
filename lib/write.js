import * as fs from "fs"


const writeToJson = (filename, data) => {
  const jsonData = JSON.stringify(data, null, 2); // Convert data to JSON string with 2-space indentation

  fs.writeFile(filename, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Data has been written to file successfully.');
    }
  });
}

export {
  writeToJson
}
