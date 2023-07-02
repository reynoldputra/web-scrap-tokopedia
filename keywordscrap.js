import { keywordScrap, productScrap } from "./lib/scrap.js";
import csv from "csvtojson"
import pMap from "p-map";
import { writeToJson } from "./lib/write.js";
import * as fs from "fs"
import jsonrawtoxlsx from "jsonrawtoxlsx"

const main = async () => {
  const json = await csv()
    .fromFile('./data/keywordtoscrap.csv')
  const keywords = json.map((obj) => obj.keyword)

  for (const idx in keywords) {
    await scrapProductbyKeyword(keywords[idx])
  }
  const date = new Date()

  const fileName = `./export/bykeyword/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword.json`
  const fileNameX = `./export/bykeyword/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword.xlsx`
  console.log("write excel")
  fs.readFile(fileName, 'utf8', (err, data) => {
    const json = JSON.parse(data)
    const bufferExcel = jsonrawtoxlsx(json)
    fs.writeFileSync(fileNameX, bufferExcel, 'binary')
  })
}

const scrapProductbyKeyword = async (keyword) => {
  const date = new Date()
  const fileName = `./export/bykeyword/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byKeyword.json`
  return new Promise(async (resolve) => {
    let i = 1
    while (true) {
      try {
        const kwRes = await keywordScrap(keyword, i)
        const kwScrapData = kwRes.data["ace_search_product_v4"]
        if (kwScrapData.header.totalData == 0) {

          resolve([])
        }

        const products = kwScrapData.data.products

        const allresult = []
        const mapper = async product => {
          const result = await scrapProduct(product, keyword, i)
          allresult.push(result)
        }
        await pMap(products, mapper, { concurrency: 100 })
        writeToJson(fileName, allresult)



      } catch (err) {
        console.log("Error : ", err)
      }
      i++;
    }
  })

}

const scrapProduct = (product, keyword, page) => {
  return new Promise(async (resolve) => {
    const gaKey = product.gaKey;
    const routes = gaKey.split("/");
    let productSlug = routes[routes.length - 1];
    let shopDomain = routes[routes.length - 2];
    const newData = await productScrap(productSlug, shopDomain, keyword);
    console.log(page, newData);
    resolve(newData)
  })
}

await main()
