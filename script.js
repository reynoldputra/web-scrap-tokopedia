import p from "puppeteer";
import * as c from "cheerio"

const main = async () => {
  const keyword = "soflens pinkrabbit"
  try {
    const browser = await p.launch({
      args: ['--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36'],
      headless : "new"
    })

    const page = await browser.newPage()
    await page.goto(`https://www.tokopedia.com/search?st=&q=${keyword}&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource=`)
    console.log("success go to website")

    await scrollToBottom(page)

    const pageData = await page.evaluate(() => {
      return {
        html : document.documentElement.innerHTML
      }
    })

    const $ = c.load(pageData.html)

    let cards = $('.css-llwpbs')

    cards.each((idx, element) => {
      console.log($(element).text())
    })

    await browser.close()
  } catch (err) {
    console.error(err)
    return 0
  }
}



const scrollToBottom = async (page) => {
   await page.evaluate(async () => {
      await new Promise((resolve) => {
        const distance = 100; // Distance to scroll in each step
        const delay = 100; // Delay between each scroll step

        const scrollHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxScroll = Math.ceil(scrollHeight / windowHeight);

        let count = 0;

        function scroll() {
          if (count >= maxScroll) {
            resolve();
            return;
          }

          window.scrollTo(0, distance * count);
          count++;

          setTimeout(scroll, delay);
        }

        scroll();
        console.log(count)
      });
    });

}


await main()
