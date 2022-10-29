# Plain Text and Image URL extractor

Extract plain text and image URL's from any website by providing URL

## API Endpoint Parameters

---

- `url` The url (both plain & encoded are supported) of website to be scraped. **Required**
- `maxCharacter` Maximum number of characters returned. **Optional**

## Start

---

`npm start` or `node index.js`

## Tests

---

`/api?url=https://example.com` returns

> `{ "isError":false, "extractedText":"Example Domain\n\nThis domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.\n\nMore information...", "timeElapsed":1.837511, "errorMessage":"" }`

- `isError` if there's any error processing the request
- `extractedText` The texts extracted from the websites, trimmed if maxCharacter parameter given
- `timeElapsed` Time elapsed for the browser process to extract the texts
- `errorMessage` Error message if there's any
