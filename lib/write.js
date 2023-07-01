import * as fs from "fs"


const writeToJson = (filePath, newData) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('An error occurred while reading the file:', err);
      return;
    }

    const jsonData = JSON.parse(data);

    jsonData.push(newData);
    const updatedJsonData = JSON.stringify(jsonData, null, 2);

    fs.writeFile(filePath, updatedJsonData, 'utf8', (err) => {
      if (err) {
        console.error('An error occurred while writing to the file:', err);
      } else {
        console.log('New object has been added to the file successfully.');
      }
    });
  });
}

export {
  writeToJson
}
