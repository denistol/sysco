import { SearchResponse } from 'types';
import { getCookies } from './getCookie';
import { write } from './write';
import { uniqBy } from 'lodash';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

type Product = {
    materialId: string
    brand: string,
    name: string,
    lineDescription: string, // lineDescription
    packSize: {
        pack: string
        size: string
        unitOfMeasure: string
    }
    image: string
    category: string
    isAvailable: boolean
    isOrderable: boolean
    isLeavingSoon: boolean
}
type Category = {
    id: string,
    name: string,
    records: number,
}
const PER_PAGE = 50
const PARSE_PAGES = 200

console.log('Products to parse: ', PER_PAGE * PARSE_PAGES)

const fetchPageWithRetry = async (
    startPage: number,
    getNewCookies: () => Promise<{ cookieString: string }>,
    currentCookie: string,
    maxRetries = 1
): Promise<SearchResponse> => {
    let retries = 0;
    let cookie = currentCookie;

    while (retries <= maxRetries) {
        try {
            const body = {
                facets: [
                    {
                        id: "BUSINESS_CENTER_ID",
                        value: null,
                        size: 1000
                    },
                    {
                        id: "ITEM_GROUP_ID",
                        value: null,
                        size: 1000
                    },
                    {
                        id: "ATTRIBUTE_GROUP_ID",
                        value: null,
                        size: 1000
                    },
                    {
                        id: "SELLER_GROUP",
                        value: null,
                        size: 1000
                    },
                    {
                        id: "BRAND",
                        value: null,
                        size: 1000
                    },
                    {
                        id: "PRODUCT_TYPE",
                        value: null,
                        size: 1000
                    },
                    {
                        id: "SUSTAINABILITY",
                        value: null,
                        size: 1000
                    },
                    {
                        id: "OPOT",
                        value: null,
                        size: 1000
                    },
                    {
                        id: "STOCK_TYPE",
                        value: "S"
                    },
                    {
                        id: "PREFERENCES",
                        value: null,
                        size: 1000
                    }
                ],
                isShowRestrictedItems: false,
                start: startPage,
                num: PER_PAGE,
                sort: {
                    type: "BEST_MATCH",
                    order: "DESC"
                }
            };
            const headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
                "Accept": "application/json",
                "Accept-Language": "en-US",
                "content-type": "application/json",
                "syy-correlation-id": "cmcwmsrwb00052e72tlznoopr",
                "syy-credit-card-flow": "false",
                "syy-requested-at": "1752106209851",
                "syy-requested-by": "null",
                "syy-same-day-delivery-allowed": "undefined",
                "syy-pricing-version": "1",
                "syy-visitor-id": "null",
                "syy-authorization": "Bearer 052|881661",
                "traceparent": "00-0000000000000000e5c0037c7a5f886e-78e336fa1de7263f-01",
                "tracestate": "dd=s:1;o:rum",
                "x-datadog-origin": "rum",
                "x-datadog-parent-id": "8710866552136083007",
                "x-datadog-sampling-priority": "1",
                "x-datadog-trace-id": "16555236063377852526",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-site",
                "Priority": "u=4",
                "Cookie": cookie,
            }

            const res = await fetch("https://web-bff.shop.sysco.com/api/v1/productsSearch", {
                credentials: "include",
                referrer: "https://shop.sysco.com/",
                body: JSON.stringify(body),
                headers,
                method: "POST",
                mode: "cors",
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json() as SearchResponse;
            return data;

        } catch (err) {
            console.log(`Error on page ${startPage} attempt ${retries + 1}:`, err);
            if (retries < maxRetries) {
                console.log("Getting new cookies and retrying...");
                cookie = (await getNewCookies()).cookieString;
                retries++;
            } else {
                throw err;
            }
        }
    }
};

const fetchProducts = async () => {

    const currentCookie = await getCookies()
    const pages = new Array(PARSE_PAGES).fill(null).map((el, index) => index * PER_PAGE)
    let products: Product[] = []
    let categoryList: Category[] = []

    await write('data/brands', currentCookie.brands.map((brand, index) => ({index, brand})))

    try {
        for (const startPage of pages) {
            const out = await fetchPageWithRetry(startPage, getCookies, currentCookie.cookieString, 3);
            const hasProducts = out?.results?.length > 0
            const categoryFacet = out.facets.find(f => f.displayName === "Category")
            const categories = categoryFacet.values

            categories.forEach(c => {
                categoryList.push({
                    id: c.id,
                    name: c.name,
                    records: c.records
                })
            })

            const getCategoryName = (id: string) => {
                const found = categories.find(c => c.id === id)
                return found?.name || ""
            }

            if (hasProducts) {
                out.results.forEach(prod => {
                    products.push({
                        brand: prod.brand,
                        name: prod.name,
                        materialId: prod.materialId,
                        category: getCategoryName(prod.category.mainCategoryId),
                        image: prod.image,
                        isAvailable: prod.isAvailable,
                        isLeavingSoon: prod.isLeavingSoon,
                        isOrderable: prod.isOrderable,
                        lineDescription: prod.lineDescription,
                        packSize: prod.packSize
                    })
                })
            }
            await delay(10);
            console.log('Products parsed: ', products.length)
        }
    } catch (err) {
        console.log('Fetching error: ', err)
        
        await write('data/products', products)
        await write('data/categories', uniqBy(categoryList, 'id') as object[])
    }

    await write('data/products', products)
    await write('data/categories', uniqBy(categoryList, 'id') as object[])

}

fetchProducts()