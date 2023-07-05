import csv from "csvtojson";
import { getCatUrl, getDataFromHtml, scrapCatList } from "./lib/catscraplib.js";
import { productScrap } from "./lib/scrap.js";
// import { writeToJson } from "./lib/write.js";
import pMap from "p-map";
import * as fs from "fs";
import jsonrawtoxlsx from "jsonrawtoxlsx";
import { byCategory } from "./task.js";
import { writeJsonFileSync } from "write-json-file";
import { getCatListPy } from "./lib/pythonscript.js";

const main = async () => {
  const arg = process.argv[2];
  const json = await csv().fromFile("./data/catmapping.csv");
  const catlist = await getCatListPy();

  // If an argument is provided, only run for that category
  const categories = arg ? { [arg]: byCategory[arg] } : byCategory;

  // Loop over each category in byCategory object or a specific category
  for (let item in categories) {
    let itemName = categories[item].name;
    let fileToMerge = {
      files: [],
    };
    if (!fs.existsSync(`./export/bycat/${itemName}`)) fs.mkdirSync(`./export/bycat/${itemName}`);

    // filter the JSON entries (from catmapping.csv) based on the current category
    let filteredJson = json.filter((row) => {
      return categories[item].lis_category
        .map((category) => category.toLowerCase())
        .includes(row[categories[item].cat].toLowerCase());
    });

    const mapper = async (idx) => {
      await scrapCategories(
        { ...filteredJson[idx], name: categories[item].name },
        catlist,
        fileToMerge
      );
    };

    // Use pMap to handle concurrency
    await pMap(Object.keys(filteredJson), mapper, { concurrency: 3 });

    // merge json
    console.log("Start merge file", itemName);
    const jsons = [];
    for (const idx in fileToMerge.files) {
      const data = fs.readFileSync(fileToMerge.files[idx], "utf8");
      const newData = JSON.parse(data);
      jsons.push(...newData);
    }

    if (!fs.existsSync(`./export/bycat/res`)) fs.mkdirSync(`./export/bycat/res`);
    const fileJson = `./export/bycat/res/${itemName}.json`;
    const fileExcel = `./export/bycat/res/${itemName}.xlsx`;

    writeJsonFileSync(fileJson, jsons);
    const bufferExcel = jsonrawtoxlsx(jsons);
    fs.writeFileSync(fileExcel, bufferExcel, "binary");
    console.log("End merge file", itemName);
    // const date = new Date();
    // const fileName = `./export/byCat/${
    //   categories[item].name
    // }/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byCat.json`;
    // const fileNameX = `./export/byCat/${
    //   categories[item].name
    // }/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byCat.xlsx`;
    // console.log("write excel");
    // fs.readFile(fileName, "utf8", (err, data) => {
    //   if (err) throw err;
    //   const json = JSON.parse(data);
    //   const bufferExcel = jsonrawtoxlsx(json);
    //   fs.writeFileSync(fileNameX, bufferExcel, "binary");
    // });
  }
};

const scrapCategories = (catObj, catlist, fileToMerge) => {
  const cat = [catObj.cat1_id, catObj.cat2_id, catObj.cat3_id];
  const catSlug = [catObj.cat1, catObj.cat2, catObj.cat3].join("-");
  const date = new Date();

  const catFolder = `./export/bycat/${catObj.name}/${catSlug}`;
  if (!fs.existsSync(catFolder)) fs.mkdirSync(catFolder);

  return new Promise(async (resolve) => {
    const catUrl = await getCatUrl(catlist, cat);
    let i = 1;
    while (true) {
      const allresult = [];
      try {
        const allCardsProduct = await getDataFromHtml(catUrl + `?page=${i}`);
        console.log(`${catSlug} page ${i} ${allCardsProduct.length} products`);
        if (allCardsProduct.length == 0) break;

        const mapper = async (product) => {
          const result = await scrapCategory(product, i);
          if (result) allresult.push(result);
        };
        await pMap(allCardsProduct, mapper, {
          concurrency: allCardsProduct.length,
        });

        //clear console and print progress
        // process.stdout.write("\x1B[2J\x1B[0f");
        console.log(`${catSlug} page ${i} done` + " ");
        const fileNameSuccess = `${catFolder}/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword_page${i}_success.json`;
        writeJsonFileSync(fileNameSuccess, allresult);
        fileToMerge.files.push(fileNameSuccess);
        i++;
      } catch (err) {
        const fileNameError = `${catFolder}/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword_page${i}_error.json`;
        writeJsonFileSync(fileNameError, allresult);
        console.log(`Error on ${catSlug} page ${i}`);
      }
    }
    resolve([]);
  });
};

const scrapCategory = async (product, page) => {
  return new Promise(async (resolve, reject) => {
    try {
      const gaKey = product.ga_key;
      const routes = gaKey.split("/");
      let productSlug = routes[routes.length - 1];
      let shopDomain = routes[routes.length - 2];
      const newData = await productScrap(productSlug, shopDomain);
      console.log(page, newData.product_link);
      resolve(newData);
    } catch (err) {
      console.log("Error on page ", page, ":", err);
      reject([]);
    }
  });
};

await main();
