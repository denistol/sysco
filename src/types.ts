export type SyscoSearchResponse = {
  metaInfo: {
    originalQuery: {
      facets: {
        id: string;
        value: string | null;
        size: number;
      }[];
      facetSize: number;
      uniqueClicksBoost: number;
      firstWordBoost: number;
      sort: string;
      start: number;
      num: number;
    };
    totalResults: number;
    correlationId: string;
    responseTimeInMills: number;
    searchTemplateName: string;
    hasDefaultedToGuest: boolean;
    queryId: string;
    searchId: string;
    algorithmType: string;
    originalSearchTermType: string;
    favoritesFetched: boolean;
  };
  facets: {
    id: string;
    displayName: string;
    values: {
      id: string;
      name: string;
      records: number;
      values: any[] | null;
    }[];
  }[];
  results: Array<{
    name: string;
    materialId: string;
    brand: string;
    description: string;
    lineDescription: string;
    averageWeightPerCase: number;
    packSize: {
      pack: string;
      size: string;
      unitOfMeasure: string;
    };
    isSoldAs: {
      case: boolean;
      split: boolean;
    };
    split: {
      min: number;
      max: number;
    };
    isCatchWeight: boolean;
    storageFlag: string;
    category: {
      completeCategoryId: string;
      mainCategoryId: string;
    };
    images: string[];
    image: string;
    hasImage: boolean;
    isAvailable: boolean;
    flags: boolean;
    isSyscoBrand: boolean;
    replacementMaterialId: string | null;
    isOrderable: boolean;
    stockType: string;
    stockTypeCode: string;
    thirdLineDescription: string | null;
    isLeavingSoon: boolean;
    isPhasedOut: boolean;
    productSpecialist: string;
    productSpecialistName: string | null;
    brokerId: string | null;
    brokerName: string | null;
    sourceVendor: string;
    sourceVendorType: string | null;
    trueVendor: string;
    trueVendorShipPtNumber: string;
    gtin: number;
    manufacturerUPC: string;
    splitDetail: string;
    demandStatus: string;
    stockStatus: string;
    isExpandedAssortment: boolean;
    supplyAvailability: {
      isSupplyDisrupted: boolean;
      disruptionStartDate: string | null;
      disruptionEndDate: string | null;
    };
    productDemandStatus: string | null;
    availableStockStatus: number;
    nextReceiveDate: string | null;
    isSameDayDeliveryEligible: boolean | null;
    nextFulfillmentDate: string | null;
    sameDayDeliveryDate: string | null;
    isRemoteRemoteProduct: boolean;
    fulfillmentSource: string | null;
    isBestSeller: boolean;
    isFavorite: boolean;
  }>;
};

export type GraingerProduct = {
    id: number,
    category: string,
    sku: string,
    description: string,
    image: string,
    url: string,
    status: string
    attributeValues: string,
    priceType: string
    price: number
    formattedPrice: string
    uomLabel: string
    source: string
}

export type GraingerRawProduct = {
    id: number;
    merchandisingCategoryId: number;
    sku: string;
    description: string;
    manufacturerPartNumber: string;
    isGroup: boolean;
    images: {
        url: string;
    }[];
    productDetailUrl: string;
    isMerchandisingCategoryPrimary: boolean;
    isBrowsable: boolean;
    status: string;
    complianceMessages: {
        Green_Message?: string;
        [key: string]: string | undefined;
    };
    sellInfo: string;
    attributeValues: (number | string)[][];
    priceData: {
        type: string;
        sell: {
            price: number;
            formattedPrice: string;
            label: string;
        };
        uomLabel: string;
        source: string;
    };
};