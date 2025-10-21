export interface Vehicle {
    title: string;
    price: string;
    mileage: string;
    link: string;
    image: string | undefined;
}
export declare function scrapeFord({ writeHtml, }?: {
    writeHtml?: boolean;
}): Promise<Vehicle[]>;
//# sourceMappingURL=ford.d.ts.map