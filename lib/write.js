import * as fs from "fs"


const writeToJson = (filePath, newData) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const emptyData = [];
        emptyData.push(newData);
        const jsonContent = JSON.stringify(emptyData, null, 2);

        fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
          if (err) {
            console.error('An error occurred while creating the file:', err);
          } else {
            console.log('New file has been created with empty JSON.');
          }
        });
      } else {
        console.error('An error occurred while reading the file:', err);
      }
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
