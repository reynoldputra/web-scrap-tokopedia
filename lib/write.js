import * as fs from "fs";

const writeToJson = async (filePath, newData) => {
  console.log("Writing to json");
  if (!fs.existsSync(filePath)) {
    const emptyData = [];
    fs.writeFileSync(filePath, JSON.stringify(emptyData, null, 2), "utf8");
  }
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const jsonData = JSON.parse(data);
    const oldDataLength = jsonData.length;
    const filteredNewData = newData.filter(
      (item) => Object.keys(item).length !== 0
    );
    const newDataLength = filteredNewData.length;
    fs.writeFileSync(
      filePath,
      JSON.stringify([...jsonData, ...filteredNewData], null, 2),
      "utf8"
    );
    console.log(
      "Success writing" + " " + (oldDataLength + newDataLength) + " " + "data"
    );
  });
};

export { writeToJson };
