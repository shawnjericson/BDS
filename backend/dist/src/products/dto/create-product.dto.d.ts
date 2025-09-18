export declare class CreateProductDto {
    name: string;
    description?: string;
    images?: string;
    basePrice?: number;
    commissionPct: number;
    providerDesiredPct: number;
    ownerUserId?: number;
}
