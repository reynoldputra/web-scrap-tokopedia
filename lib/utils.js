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

export { toInt, searchKeyValue }
