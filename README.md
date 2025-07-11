### 🧾 Description
This test project is a web scraper that uses Puppeteer to obtain cookies and sends raw GraphQL-style POST requests to internal API to collect product and category data.

It:
- Parses paginated product listings from the Sysco or Grainger api.

- Stores product details (name, brand, image, availability, etc.).

- Extracts and deduplicates categories.

- Saves results into local JSON files (```data/sysco/products, data/sysco/categories, data/sysco/brands, data/grainger/products```).

### Dependencies and Utilities
`getCookies`: Uses Puppeteer to retrieve a fresh cookies and additional data for authenticated API access.
`write`: Utility to save data to disk.
`uniqBy`: From Lodash, used to deduplicate categories.

### ENV Constants
`CHROME_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` - Path to chrome executable


### Output
- Saves (CSV and JSON):
    - Raw brands data to `data/sysco/brands`
    - Parsed product data to `data/sysco/products or data/grainger/products`
    - Unique category list to `data/sysco/categories`

### Run
1. Set relevant `CHROME_EXECUTABLE_PATH` to `.env`
2. `pnpm install`
3. `pnpm run build`
4. Start parsing: `pnpm run start grainger` or `pnpm run start sysco`