import { keywordScrap, productScrap } from "./lib/scrap.js";
import { toInt } from "./lib/utils.js";
import csv from "csvtojson"
import { writeToJson } from "./lib/write.js";
import pMap from "p-map";

const main = async () => {
  const json = await csv()
    .fromFile('./data/keywordtoscrap.csv')
  const keywords = json.map((obj) => obj.keyword)

  for (const idx in keywords) {
    await scrapProductbyKeyword(keywords[idx])
  }

}

const scrapProductbyKeyword = async (keyword) => {
  return new Promise(async (resolve) => {
    let i = 1
    while (true) {
      const kwRes = await keywordScrap(keyword, i)
      const kwScrapData = kwRes.data["ace_search_product_v4"]
      if (kwScrapData.header.totalData == 0) {
        resolve(products)
      }

      const products = kwScrapData.data.products

      const allresult = []
      try {
        const mapper = async product => {
          const result = await scrapProduct(product, keyword)
          allresult.push(result)
        }
        await pMap(products, mapper, { concurrency: 50 })
        writeToJson(`./export/bykeyword/${keyword}.json`, allresult)
      } catch (err) {
        console.log("Error : ", err)
      }
      i++;
    }
  })

}

const scrapProduct = (product, keyword) => {
  return new Promise(async (resolve, reject) => {
    const gaKey = product.gaKey;
    const routes = gaKey.split("/");
    let productSlug = routes[routes.length - 1];
    let shopDomain = routes[routes.length - 2];
    const shopId = product.shop.shopId.toString();
    const pdRes = await productScrap(productSlug, shopDomain);
    if (!pdRes) {
      console.log(pdRes)
      console.log("Skipped")
      reject([])
      return
    }
    const productInfo = pdRes.basicInfo;

    let catSlug = `${productInfo.category.detail[0].name}-${productInfo.category.detail[1].name}-${productInfo.category.detail[2].name}`;

    const newData = {
      keyword,
      cat_slug: catSlug,
      itemid: product.id.toString(),
      shopid: shopId,
      product_title: product.name,
      product_link: product.url,
      brand: null,
      store_type: product.shop.isOfficial,
      store_name: product.shop.name,
      store_link: product.shop.url,
      store_location: product.shop.city,
      price: toInt(product.price),
      rating: productInfo.stats.rating,
      historical_sold: parseInt(productInfo.txStats.countSold),
      review_count: parseInt(productInfo.stats.countReview),
      view_count: parseInt(productInfo.stats.countView)
    };

    console.log(product.name);
    resolve(newData)
  })
}

await main()
