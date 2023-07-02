import axios from "axios"
import { randomUserAgent, searchKeyValue } from "./utils.js";
import axiosRetry from "axios-retry";

const getDataFromHtml = async (url) => {
  const response = await axios.get(url);
  const html = response.data;

  const regex = /window\.__cache=({.*?});/s;
  const match = html.match(regex);
  const wcache = match[1]
  const variableValue = JSON.parse(wcache)

  const pattern = /^AceSearchProduct\d+$/;
  const filteredKeys = Object.keys(variableValue).filter(key => pattern.test(key));

  const selectedObjects = []
  for (const idx in filteredKeys) {
    selectedObjects.push(variableValue[filteredKeys[idx]])
  }

  return selectedObjects
}

const getShopInfoFromHtml = async (url) => {

  axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
      return retryCount * 1000;
    },
    onRetry: (retryCount, err, _) => {
      console.log("Retry request ", retryCount)
    }

  })

  const response = await axios.get(url);
  const html = response.data;

  const regex = /window\.__cache=({.*?});/s;
  const match = html.match(regex);
  const wcache = match[1]
  const variableValue = JSON.parse(wcache)

  let location = searchKeyValue(variableValue, "location")
  let isOfficial = searchKeyValue(variableValue, "isOfficial") == "0" ? false : true
  return {
    location,
    isOfficial
  }
}

const getCatUrl = async (catlist, cat) => {
  const level1 = catlist.filter(obj => obj.id == cat[0])
  const level2 = level1[0].children.filter(obj => obj.id == cat[1])
  const level3 = level2[0].children.filter(obj => obj.id == cat[2])
  return level3[0].url
}

const scrapCatList = async () => {
  let data = JSON.stringify([
    {
      "operationName": "headerMainData",
      "variables": {},
      "query": "query headerMainData {\n  dynamicHomeIcon {\n    categoryGroup {\n      id\n      title\n      desc\n      categoryRows {\n        id\n        name\n        url\n        imageUrl\n        type\n        categoryId\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  categoryAllListLite {\n    categories {\n      id\n      name\n      url\n      iconImageUrl\n      isCrawlable\n      children {\n        id\n        name\n        url\n        isCrawlable\n        children {\n          id\n          name\n          url\n          isCrawlable\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
    }
  ]);

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://gql.tokopedia.com/graphql/headerMainData',
    headers: {
      'User-Agent': randomUserAgent(),
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.tokopedia.com/',
      'X-Tkpd-Lite-Service': 'zeus',
      'X-Version': 'a61214f',
      'content-type': 'application/json',
      'x-device': 'desktop-0.0',
      'X-Source': 'tokopedia-lite',
      'Origin': 'https://www.tokopedia.com',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'TE': 'trailers'
    },
    data: data
  };

  const res = await axios.request(config)
  if (!res.data[0].data.categoryAllListLite.categories) {
    console.log("Error when get cat list")
    return []
  }
  return res.data[0].data.categoryAllListLite.categories
}

export {
  getDataFromHtml,
  getCatUrl,
  scrapCatList,
  getShopInfoFromHtml
}
