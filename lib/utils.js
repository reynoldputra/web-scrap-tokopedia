import axios from "axios";

const toInt = (str) => {
  const numericString = str.replace(/\D/g, '');
  const amount = parseInt(numericString, 10);
  return amount
}

const searchKeyValue = (obj, variable) => {
  for (var key in obj) {
    if (typeof obj[key] == 'object') {
      var result = searchKeyValue(obj[key], variable);
      if (result) {
        return result;
      }
    } else if (key == variable) {
      return obj[key].toString();
    }
  }
  return null;
}
const searchKeyValueDouble = (obj, variable, scdVar) => {
  for (var key in obj) {
    if (typeof obj[key] == 'object') {
      var result = searchKeyValueDouble(obj[key], variable, scdVar);
      if (result) {
        return result;
      }
    } else if (key == variable && obj[scdVar] != undefined) {
      return obj[key].toString();
    }
  }
  return null;
}

const searchKeyValueObj = (obj, variable) => {
  for (var key in obj) {
    if (key == variable) {
      return obj[key];
    }
    if (typeof obj[key] == 'object') {
      var result = searchKeyValueObj(obj[key], variable);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
const searchKeyValueRgx = (obj, regex) => {
  for (var key in obj) {
    if (key.match(regex) != null) {
      return obj[key];
    }
    if (typeof obj[key] == 'object') {
      var result = searchKeyValue(obj[key], regex);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

const randomUserAgent = () => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15"
  ];
  var randomIndex = Math.floor(Math.random() * userAgents.length);

  return userAgents[randomIndex]

}


const requestAutoTo = async (config, retryCount) => {
  if (retryCount > 3) return {}
  try {
    const res = await axios.request(config)
    return res
  } catch (err) {
    console.log("request timout, retry count", retryCount + 1)
    return await requestAutoTo(config, retryCount++)
  }
}

export { toInt, searchKeyValue, randomUserAgent, requestAutoTo, searchKeyValueRgx, searchKeyValueObj, searchKeyValueDouble }
