import { keywordScrapAllPage, productScrap } from "./lib/scrap.js";
import { toInt } from "./lib/utils.js";
import { writeToJson } from "./lib/write.js";
import csv from "csvtojson"

const main = async () => {
  const json = await csv()
    .fromFile('./data/keywordtoscrap.csv')
  const keywords = json.map((obj) => obj.keyword)
  const concurrencyLimit = 5

  for (let i = 0; i < keywords.length; i += concurrencyLimit) {
    const batchKeywords = keywords.slice(i, i + concurrencyLimit);
    const promises = batchKeywords.map(keyword => scrapProductbyKeyword(keyword));
    await Promise.all(promises);
  }

}

const scrapProductbyKeyword = async (keyword) => {
  return new Promise(async (resolve) => {
    const products = await keywordScrapAllPage(keyword)
    const scrapResult = []

    for (const idx in products) {
      const product = products[idx]
      const gaKey = product.gaKey;
      const routes = gaKey.split("/");
      let productSlug = routes[routes.length - 1];
      let shopDomain = routes[routes.length - 2];
      const shopId = product.shop.shopId.toString();
      const pdRes = await productScrap(productSlug, shopDomain);
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

      console.log(newData);
      scrapResult.push(newData);
    };

    writeToJson(`./export/result.json`, scrapResult)
    resolve(scrapResult)
  })

}

await main()
