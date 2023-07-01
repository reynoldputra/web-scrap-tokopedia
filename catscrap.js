import csv from "csvtojson"
import { getCatUrl, getDataFromHtml, getShopInfoFromHtml, scrapCatList } from "./lib/catscraplib.js"
import { productScrap } from "./lib/scrap.js"

const main = async () => {
  const json = await csv()
    .fromFile('./data/catmapping.csv')

  const concurrencyLimit = 5

  for (let i = 0; i < json.length; i += concurrencyLimit) {
    const batchJson = json.slice(i, i + concurrencyLimit);
    const promises = batchJson.map(catObj => scrapCategories(catObj));
    await Promise.all(promises);
  }

}

const scrapCategories = (catObj) => {
  const cat = [catObj.cat1_id, catObj.cat2_id, catObj.cat3_id]
  return new Promise(async (resolve) => {
    const catlist = await scrapCatList()
    const catUrl = await getCatUrl(catlist, cat)

    let i = 1;
    while (true) {
      const allCardsProduct = await getDataFromHtml(catUrl + `?page=${i}`)
      if(allCardsProduct.length == 0) break
      i++;
      const scrapResult = []
      for (const idx in allCardsProduct) {
        const product = allCardsProduct[idx]
        const gaKey = product.ga_key;
        const routes = gaKey.split("/");
        let productSlug = routes[routes.length - 1];
        let shopDomain = routes[routes.length - 2];
        const pdRes = await productScrap(productSlug, shopDomain);
        const productInfo = pdRes.basicInfo;
        let catSlug = `${productInfo.category.detail[0].name}-${productInfo.category.detail[1].name}-${productInfo.category.detail[2].name}`;

        let shopUrl = product.url.split("/").slice(0, 3).join("/")

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

        console.log(newData)
        scrapResult.push(newData)
      }
    }
    resolve(scrapResult)
  })

}

await main()
