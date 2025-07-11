import * as cheerio from 'cheerio';
import { delay, stripQueryParams, write } from './utils';
import { GraingerProduct, GraingerRawProduct } from './types';
import { getCookies } from './getCookie';

const BASE_URL = 'https://www.grainger.com'
const INITIAL_CATEGORY = '/category/cleaning-and-janitorial'

const referrer = 'https://www.grainger.com/category/cleaning-and-janitorial'
const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Priority": "u=0, i",
    "Cookie": '',
}

const formatRawProduct = (raw: GraingerRawProduct, category: string): GraingerProduct => {
    const attributeValues = raw.attributeValues.map(el => el.length >= 2 ? el[1] : '').join(', ')
    return {
        id: raw.id,
        sku: raw.sku,
        category,
        description: raw.description,
        formattedPrice: raw.priceData.sell.formattedPrice,
        image: raw.images?.[0].url || '',
        priceType: raw.priceData.type,
        price: raw.priceData.sell.price,
        status: raw.status,
        url: `${BASE_URL}${raw.productDetailUrl}`,
        attributeValues,
        uomLabel: raw.priceData.uomLabel,
        source: raw.priceData.source
    }
}

const visited = new Set();
const parsedProducts: GraingerProduct[] = []

const fetchProductPage = async (productId, categoryString) => {
    const url = `https://www.grainger.com/experience/pub/api/products/collection/${productId}?categoryId=1`
    const response = await fetch(url, {
        headers,
        referrer,
        credentials: "include",
        method: "GET",
        mode: "cors"
    });

    const pageProducts = await response.json() as GraingerRawProduct[]
    const products = pageProducts.map(el => formatRawProduct(el, categoryString))
    products.forEach(p => {
        parsedProducts.push(p)
    })
    return products
}

const travelCategory = async (categoryPath: string) => {
    console.log('Parsed products count: ', parsedProducts.length)
    const url = new URL(categoryPath, BASE_URL).toString();

    if (visited.has(url)) {
        console.log('Already visited: ', url);
        return;
    }
    visited.add(url);

    console.log('🔥 Navigate to: ', url);

    const res = await fetch(url, {
        headers,
        credentials: "include",
        method: "GET",
        mode: "cors"
    });

    const text = await res.text();
    const $ = cheerio.load(text);

    const isProducts = $('colgroup').length > 0;
    if (isProducts) {
        const match = text.match(/data-testid="collection-header-(\d+)"/);
        const productId = match ? Number(match[1]) : null;
        console.log('Product page found: ', url);
        if (productId) {
            const categoryString = $('ol li a')
                .map((_, el) => $(el).text().trim())
                .get()
                .slice(1)
                .join(' / ');

            await fetchProductPage(productId, categoryString)
        }
        return;
    }

    const links = $('[data-testid="branch-view-list"] a');
    if (links.length === 0) {
        console.log('No subcategories:', url);
        return;
    }

    const rawLinks: string[] = [];
    links.each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
            rawLinks.push(stripQueryParams(href));
        }
    });

    for (const l of rawLinks) {
        await delay(300);
        await travelCategory(l);
    }
};

export const load = async () => {
    const { cookieString } = await getCookies.grainger()
    headers.Cookie = cookieString;

    try {
        await travelCategory(INITIAL_CATEGORY);
    } catch {
        console.log('Unhandled error!')
    }
    console.log('Parsed products count: ', parsedProducts.length)
    await write('data/grainger/products', parsedProducts)
};
