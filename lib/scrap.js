import axios from "axios";
import { randomUserAgent, searchKeyValue, searchKeyValueDouble, searchKeyValueObj, searchKeyValueRgx } from "./utils.js";
import { getShopInfoFromHtml } from "./catscraplib.js";


const keywordScrap = async (keyword, page) => {
  let data = JSON.stringify({
    "operationName": "SearchProductQueryV4",
    "query": "query SearchProductQueryV4($params: String!) {\n  ace_search_product_v4(params: $params) {\n    header {\n      totalData\n      totalDataText\n      processTime\n      responseCode\n      errorMessage\n      additionalParams\n      keywordProcess\n      componentId\n      __typename\n    }\n    data {\n      banner {\n        position\n        text\n        imageUrl\n        url\n        componentId\n        trackingOption\n        __typename\n      }\n      backendFilters\n      isQuerySafe\n      ticker {\n        text\n        query\n        typeId\n        componentId\n        trackingOption\n        __typename\n      }\n      redirection {\n        redirectUrl\n        departmentId\n        __typename\n      }\n      related {\n        position\n        trackingOption\n        relatedKeyword\n        otherRelated {\n          keyword\n          url\n          product {\n            id\n            name\n            price\n            imageUrl\n            rating\n            countReview\n            url\n            priceStr\n            wishlist\n            shop {\n              city\n              isOfficial\n              isPowerBadge\n              __typename\n            }\n            ads {\n              adsId: id\n              productClickUrl\n              productWishlistUrl\n              shopClickUrl\n              productViewUrl\n              __typename\n            }\n            badges {\n              title\n              imageUrl\n              show\n              __typename\n            }\n            ratingAverage\n            labelGroups {\n              position\n              type\n              title\n              url\n              __typename\n            }\n            componentId\n            __typename\n          }\n          componentId\n          __typename\n        }\n        __typename\n      }\n      suggestion {\n        currentKeyword\n        suggestion\n        suggestionCount\n        instead\n        insteadCount\n        query\n        text\n        componentId\n        trackingOption\n        __typename\n      }\n      products {\n        id\n        name\n        ads {\n          adsId: id\n          productClickUrl\n          productWishlistUrl\n          productViewUrl\n          __typename\n        }\n        badges {\n          title\n          imageUrl\n          show\n          __typename\n        }\n        category: departmentId\n        categoryBreadcrumb\n        categoryId\n        categoryName\n        countReview\n        customVideoURL\n        discountPercentage\n        gaKey\n        imageUrl\n        labelGroups {\n          position\n          title\n          type\n          url\n          __typename\n        }\n        originalPrice\n        price\n        priceRange\n        rating\n        ratingAverage\n        shop {\n          shopId: id\n          name\n          url\n          city\n          isOfficial\n          isPowerBadge\n          __typename\n        }\n        url\n        wishlist\n        sourceEngine: source_engine\n        __typename\n      }\n      violation {\n        headerText\n        descriptionText\n        imageURL\n        ctaURL\n        ctaApplink\n        buttonText\n        buttonType\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
    "variables": {
      "params": `device=desktop&navsource=&ob=23&page=${page}&q=${encodeURI(keyword)}&related=true&rows=200&safe_search=false&scheme=https&shipping=&show_adult=false&source=search&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&st=product&start=0&topads_bucket=true&unique_id=197e744d0985e2c43232c573e1f2cd5e&user_addressId=&user_cityId=176&user_districtId=2274&user_id=&user_lat=&user_long=&user_postCode=&user_warehouseId=12210375&variants=&warehouses=`
    }
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://gql.tokopedia.com/graphql/SearchProductQueryV4',
    headers: {
      'User-Agent': randomUserAgent(),
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.tokopedia.com/search?st=&q=soflen&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource=',
      'X-Tkpd-Lite-Service': 'zeus',
      'X-Version': 'a61214f',
      'content-type': 'application/json',
      'x-device': 'desktop-0.0',
      'Tkpd-UserId': '0',
      'X-Source': 'tokopedia-lite',
      'Origin': 'https://www.tokopedia.com',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'TE': 'trailers'
    },
    data: data
  };

  try {
    const res = await axios.request(config)
    return res.data
  } catch (err) {
    console.log("error keyword scrap")
  }
}

const productScrap = async (productKey, shopDomain, keyword = null) => {
  try {
    const url = ["https://www.tokopedia.com", shopDomain, productKey].join("/")
    const response = await axios.get(url);
    const html = response.data;

    const regex = /window\.__cache=({.*?});/s;
    const match = html.match(regex);
    const wcache = match[1]
    const json = JSON.parse(wcache)
    const regexCat = /pdpCategory\d+/g;

    let shopUrl = url.split("/").slice(0, 4).join("/")

    const shopInfo = await getShopInfoFromHtml(shopUrl)
    let catObj = searchKeyValueRgx(json, regexCat)
    let cat1 = searchKeyValueObj(json, catObj.detail[0].id)
    let cat2= searchKeyValueObj(json, catObj.detail[1].id)
    let cat3 = searchKeyValueObj(json, catObj.detail[2].id)
    let catSlug = `${cat1.name}-${cat2.name}-${cat3.name}`;


    const date = new Date()
    let data =  {
      date: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      marketplace : "tokopedia",
      itemid : searchKeyValue(json, "productID"),
      shopid : searchKeyValue(json, "shopID"),
      product_title : searchKeyValueDouble(json, "name", "isTradeIn"),
      product_link : url,
      brand : null,
      store_type: shopInfo.isOfficial,
      store_location: shopInfo.location,
      store_link : shopUrl,
      store_name : searchKeyValue(json, "shopName"),
      price : parseInt(searchKeyValueDouble(json, "value", "currency")),
      rating : parseInt(searchKeyValue(json, "rating")),
      historical_sold : parseInt(searchKeyValue(json, "countSold")),
      review_count : parseInt(searchKeyValue(json, "countReview")),
      view_count : parseFloat(searchKeyValue(json, "countView"))
    }
    if(keyword) {
      data["keyword"] =  keyword
    } else {
      data["cat_slug"] =  catSlug
    }

    return data
  } catch (err) {
    console.log("Error product scrap : ", err)
  }
}

export { productScrap, keywordScrap }
