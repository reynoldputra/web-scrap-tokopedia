import csv from "csvtojson"
import { getCatUrl, getDataFromHtml, getShopInfoFromHtml, scrapCatList } from "./lib/catscraplib.js"
import { productScrap } from "./lib/scrap.js"
import { writeToJson } from "./lib/write.js"
import pMap from "p-map"

const main = async () => {
  const json = await csv()
    .fromFile('./data/catmapping.csv')

  const catlist = await scrapCatList()

  for(const idx in json) {
    await scrapCategories(json[idx], catlist)
  }

}

const scrapCategories = (catObj, catlist) => {
  const cat = [catObj.cat1_id, catObj.cat2_id, catObj.cat3_id]
  const catSlug = cat.join("-")
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
        writeToJson(`./export/bycat/${catSlug}.json`, allresult)
        console.log(`${catUrl} page ${i} done`)
        i++;
      } catch (err) {
        console.log("Error : ", err)
      }
    }
    resolve(scrapResult)
  })

}

const scrapCategory = async (product) => {
  return new Promise(async (resolve, reject) => {
    try {
      const gaKey = product.ga_key;
      const routes = gaKey.split("/");
      let productSlug = routes[routes.length - 1];
      let shopDomain = routes[routes.length - 2];
      const pdRes = await productScrap(productSlug, shopDomain);
      if (!pdRes) {
        console.log("Skipped")
        reject([])
      }

      const productInfo = pdRes.basicInfo;
      let catSlug = `${productInfo.category.detail[0].name}-${productInfo.category.detail[1].name}-${productInfo.category.detail[2].name}`;

      let shopUrl = product.url.split("/").slice(0, 4).join("/")

      let shopInfoAdd = await getShopInfoFromHtml(shopUrl)

      const newData = {
        cat_slug: catSlug,
        itemid: product.id.toString(),
        shopid: productInfo.shopID,
        product_title: product.name,
        product_link: product.url,
        brand: null,
        store_type: shopInfoAdd.isOfficial,
        store_name: productInfo.shopName,
        store_link: shopUrl,
        store_location: shopInfoAdd.location,
        price: product.price_int,
        rating: productInfo.stats.rating,
        historical_sold: parseInt(productInfo.txStats.countSold),
        review_count: parseInt(productInfo.stats.countReview),
        view_count: parseInt(productInfo.stats.countView)
      };

      console.log(product.name)
      resolve(newData)
    } catch (err) {
      console.log("Error: ", err)
      reject([])
    }
  })
}

await main()
