import { keywordScrap, productScrap } from "./lib/scrap.js";
// import csv from "csvtojson";
import pMap from "p-map";
import * as fs from "fs";
// import { writeToJson } from "./lib/write.js";
import jsonrawtoxlsx from "jsonrawtoxlsx";
import { byKeyword } from "./task.js";
import { writeJsonFileSync } from "write-json-file";
import { getProductPy } from "./lib/pythonscript.js";

const main = async () => {
  const arg = process.argv[2];

  // If an argument is provided, only run for that keyword
  const tasks = arg ? { [arg]: byKeyword[arg] } : byKeyword;

  // Loop over each item in the tasks object
  for (let item in tasks) {
    let fileToMerge = {
      files: [],
    };
    if (!fs.existsSync(`./export/bykeyword/${tasks[item].name}`))
      fs.mkdirSync(`./export/bykeyword/${tasks[item].name}`);
    // Loop over each keyword in the current item's list_keywords array
    for (let keyword of tasks[item].list_keywords) {
      console.log("new keyword")
      if (!fs.existsSync(`./export/bykeyword/${tasks[item].name}/${keyword}`))
        fs.mkdirSync(`./export/bykeyword/${tasks[item].name}/${keyword}`);
      await scrapProductbyKeyword(keyword, tasks[item].name, fileToMerge); // Note the second argument here
    }

    // merge json
    console.log("Start merge file", tasks[item].name);
    const jsons = [];
    for (const idx in fileToMerge.files) {
      const data = fs.readFileSync(fileToMerge.files[idx], "utf8");
      const newdata = JSON.parse(data);
      jsons.push(...newdata);
    }

    if (!fs.existsSync(`./export/bykeyword/res`)) fs.mkdirSync(`./export/bykeyword/res`);
    const fileJson = `./export/bykeyword/res/${tasks[item].name}.json`;
    const fileExcel = `./export/bykeyword/res/${tasks[item].name}.xlsx`;

    writeJsonFileSync(fileJson, jsons);
    const bufferExcel = jsonrawtoxlsx(jsons);
    fs.writeFileSync(fileExcel, bufferExcel, "binary");
    console.log("End merge file", tasks[item].name);

    // const date = new Date();
    // const fileName = `./export/bykeyword/${
    //   tasks[item].name
    // }/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword.json`;
    // const fileNameX = `./export/bykeyword/${
    //   tasks[item].name
    // }/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword.xlsx`;
    // console.log("write excel");
    // fs.readFile(fileName, "utf8", (err, data) => {
    //   if (err) throw err;
    //   const json = JSON.parse(data);
    //   const bufferExcel = jsonrawtoxlsx(json);
    //   fs.writeFileSync(fileNameX, bufferExcel, "binary");
    // });
  }
};

const scrapProductbyKeyword = async (keyword, taskName, fileToMerge) => {
  const date = new Date();
  return new Promise(async (resolve) => {
    let i = 1;
    while (true) {
      const allresult = [];
      try {
        const kwRes = await getProductPy(keyword, i);
        const kwScrapData = kwRes.data["ace_search_product_v4"];
        if (kwScrapData.header.totalData == 0) {
          resolve([]);
          break;
        }

        const products = kwScrapData.data.products;
        const mapper = async (product) => {
          const result = await scrapProduct(product, keyword, i);
          allresult.push(result);
        };

        await pMap(products, mapper, { concurrency: 100 });

        const fileNameSuccess = `./export/bykeyword/${taskName}/${keyword}/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword_page${i}_success.json`;
        writeJsonFileSync(fileNameSuccess, allresult);
        fileToMerge.files.push(fileNameSuccess);
        console.log(`Page ${i} keyword ${keyword} done`);
        i++;
      } catch (err) {
        const fileNameError = `./export/bykeyword/${taskName}/${keyword}/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword_page${i}_error.json`;
        writeJsonFileSync(fileNameError, allresult);
        console.log("Error : ", err);
      }
    }
    resolve([]);
  });
};

const scrapProduct = (product, keyword, page) => {
  return new Promise(async (resolve) => {
    const gaKey = product.gaKey;
    const routes = gaKey.split("/");
    let productSlug = routes[routes.length - 1];
    let shopDomain = routes[routes.length - 2];
    const newData = await productScrap(productSlug, shopDomain, keyword);
    console.log(page, newData.product_title);
    resolve(newData);
  });
};

await main();
