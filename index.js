const { hrtime } = require("node:process");
const express = require("express");
const app = express();
const puppeteer = require("puppeteer-extra");
const port = process.env.PORT || 3000;

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
puppeteer.use(require("puppeteer-extra-plugin-anonymize-ua")());

//serve static files
app.use(express.static("public"));

const extractTextAndImage = async (url) => {
  //start the timer
  const start = hrtime.bigint();

  if (!url) {
    return {
      isError: true,
      extractedText: "",
      errorMessage: "No url provided",
      timeElapsed: NaN,
    };
  }

  //if url has no protocol, insert http
  if (!url.startsWith("http")) {
    url = "http://" + url;
  }

  let browser;
  let page;

  try {
    browser = await puppeteer.launch();
    page = (await browser.pages())[0];

    await page.evaluateOnNewDocument(() => {
      delete navigator.__proto__.webdriver;
    });

    await page.goto(url, { waitUntil: "load", timeout: 60000 });

    //convert all img tags to anchor tags with their source and return text from the body
    let text = await page.evaluate(() => {
      let imgs = document.querySelectorAll("img");
      imgs.forEach((img) => {
        if (img.src.startsWith("data:image") || img.src.endsWith(".svg")) {
          img.remove();
          return;
        }
        let anchor = document.createElement("a");
        anchor.innerText = img.src;
        anchor.href = img.src;
        img.parentNode.replaceChild(anchor, img);
      });
      return document.body.innerText;
    });

    //close the browser
    await page.close();
    await browser.close();

    //end the timer
    const end = hrtime.bigint();
    //calculate how many seconds it took
    const timeElapsed = parseFloat((Number(end - start) / 1e9).toFixed(6));
    let data = {
      extractedText: text,
      timeElapsed,
    };
    return {
      isError: false,
      extractedText: text,
      timeElapsed,
      errorMessage: "",
    };
  } catch (error) {
    if (browser) {
      browser.close();
    }
    return {
      isError: true,
      extractedText: "",
      errorMessage: error.message,
      timeElapsed: NaN,
    };
  }
};

app.get("/api", async (req, res) => {
  let url = req.query.url;
  let maxCharacter = req.query.maxCharacter;
  if (!url) {
    return res.status(400).send("No URL Provided");
  }
  let data = await extractTextAndImage(url);
  //if maxCharacter specified
  if (maxCharacter && !isNaN(maxCharacter)) {
    data.extractedText = data.extractedText.slice(0, parseInt(maxCharacter));
  }
  if (data.isError) {
    console.log(data.errorMessage);
    res.statusMessage = data.errorMessage;
    res.status(500).end();
    return;
  }
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
