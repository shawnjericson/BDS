export declare enum CommissionPolicy {
    PRIORITY = "priority",
    PRORATE = "prorate"
}
export declare class CommissionRatesDto {
    rate_direct_sales: number;
    rate_referrer: number;
    rate_head_owner: number;
    rate_mgr_sales: number;
    rate_mgr_product: number;
    rate_mgr_region: number;
}
export declare class CalculateCommissionDto {
    gross_value: number;
    commission_pool_rate: number;
    rates: CommissionRatesDto;
    policy?: CommissionPolicy;
    rounding_unit?: number;
    direct_sales_user_id?: number;
    referrer_user_id?: number;
    head_owner_user_id?: number;
    mgr_sales_user_id?: number;
    mgr_product_user_id?: number;
    mgr_region_user_id?: number;
}
export interface CommissionResult {
    commission_pool: number;
    commission_paid_total: number;
    commission_remaining: number;
    allocations: {
        direct_sales: number;
        referrer: number;
        head_owner: number;
        mgr_sales: number;
        mgr_product: number;
        mgr_region: number;
    };
    k_factor?: number;
    policy_used: CommissionPolicy;
}
