const toInt = (str) => {
  const numericString = str.replace(/\D/g, '');
  const amount = parseInt(numericString, 10);
  return amount
}

export { toInt }
