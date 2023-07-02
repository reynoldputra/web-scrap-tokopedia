import csv from "csvtojson"
import { getCatUrl, getDataFromHtml, scrapCatList } from "./lib/catscraplib.js"
import { productScrap } from "./lib/scrap.js"
import { writeToJson } from "./lib/write.js"
import pMap from "p-map"
import * as fs from "fs"
import jsonrawtoxlsx from "jsonrawtoxlsx"

const main = async () => {
  const json = await csv()
    .fromFile('./data/catmapping.csv')

  const catlist = await scrapCatList()

  for (const idx in json) {
    await scrapCategories(json[idx], catlist)
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

const scrapCategories = (catObj, catlist) => {
  const cat = [catObj.cat1_id, catObj.cat2_id, catObj.cat3_id]
  const date = new Date()
  const fileName = `./export/bycat/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}byCat.json`
  return new Promise(async (resolve) => {
    const catUrl = await getCatUrl(catlist, cat)
    let i = 1;
    while (true) {
      try {
        const allCardsProduct = await getDataFromHtml(catUrl + `?page=${i}`)
        if (allCardsProduct.length == 0) break

        const allresult = []
        const mapper = async product => {
          const result = await scrapCategory(product)
          if (result)
            allresult.push(result)
        }
        await pMap(allCardsProduct, mapper, { concurrency: allCardsProduct.length })
        writeToJson(fileName, allresult)
        console.log(`${catUrl} page ${i} done`)
        i++;
      } catch (err) {
        console.log("Error : ", err)
      }
    }
    resolve([])
  })

}

const scrapCategory = async (product) => {
  return new Promise(async (resolve, reject) => {
    try {
      const gaKey = product.ga_key;
      const routes = gaKey.split("/");
      let productSlug = routes[routes.length - 1];
      let shopDomain = routes[routes.length - 2];
      const newData = await productScrap(productSlug, shopDomain);
      console.log(newData);
      resolve(newData)
    } catch (err) {
      console.log("Error: ", err)
      reject([])
    }
  })
}

await main()
