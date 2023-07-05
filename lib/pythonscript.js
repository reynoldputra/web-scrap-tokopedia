import { PythonShell } from "python-shell";

export const getProductPy = async (keyword, page) => {
  const res = await PythonShell.run("./lib/reqProduct.py", {
    args: [keyword, page],
  });

  let str = res[0];
  str = str.substring(1);
  str = str.slice(0, -1);
  const resjson = JSON.parse(str);
  return resjson
};

export const getCatListPy = async () => {
  const res = await PythonShell.run("./lib/reqCategory.py", null);

  let str = res[0];
  str = str.substring(1);
  str = str.slice(0, -1);
  const resjson = JSON.parse(str);
  return resjson.data.categoryAllListLite.categories
};

export const pythonReqGet = async (url) => {
const res = await PythonShell.run("./lib/reqGet.py", {
    args: [url],
  });

  return res
}
