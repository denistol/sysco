## 🧾 Description
This test project is a web scraper that uses Puppeteer to obtain cookies and sends raw GraphQL-style POST requests to Sysco's internal API to collect product and category data.

It:
- Parses paginated product listings from the Sysco BFF API.

- Stores product details (name, brand, image, availability, etc.).

- Extracts and deduplicates categories.

- Saves results into local JSON files (```data/products, data/categories, data/brands```).

## ⚙️ How It Works — Algorithm

### 1. Dependencies and Utilities
`getCookies`: Uses Puppeteer to retrieve a fresh cookie string for authenticated API access.
`write`: Utility to save data to disk.
`uniqBy`: From Lodash, used to deduplicate categories.

### 2. ENV Constants
`PER_PAGE = 50`: Number of products per API request.
`PARSE_PAGES = 600`: Total number of pages to parse.
`CHROME_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` - Path to chrome executable

### 3. Core Functionality

3.1 `fetchPageWithRetry`

- Sends a raw POST request to `https://web-bff.shop.sysco.com/api/v1/productsSearch`.
- Includes hardcoded headers (with cookie and user-agent).
- Retries the request (default 1 retry, max 3) if it fails.

- Fetches:
    - List of product results
    - Facets (like categories)

3.2 `fetchProducts`

- Gets initial cookie via `getCookies()`.
- Prepares pagination offsets: [0, 50, 100, ..., 29950].
- Iterates over each page:
    - Calls fetchPageWithRetry with retries and cookie handling.
    - Extracts category facet and stores category id, name, records.
    - Maps each product to a simplified Product object:
        `materialId, brand, name, category, image, availability, etc.`

- Applies a 10ms delay between requests (rudimentary rate-limiting).
- In case of failure:
    - Saves current progress to data/products and data/categories.


## 📁 Output
- Saves (CSV and JSON):
    - Raw brands data to `data/brands`
    - Parsed product data to `data/products`
    - Unique category list to `data/categories`

## 🚀 Run
1. Set relevant `CHROME_EXECUTABLE_PATH` to `.env`
2. `pnpm install && pnpm run build && pnpm run start`