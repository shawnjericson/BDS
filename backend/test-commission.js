/**
 * Test Commission Calculation - Option A (Priority)
 * Theo flow_phan_bổ_hoa_hồng_giao_dịch_thanh_cong.md
 */

// Simulate commission calculation function
function calculateCommission(dto) {
  const {
    gross_value,
    commission_pool_rate,
    rates,
    policy = 'priority',
    rounding_unit = 1000,
    user_ids = {}
  } = dto;

  // 1. Tính commission pool
  const commission_pool = gross_value * commission_pool_rate;

  // 2. Tính hoa hồng đề xuất cho từng vai trò
  const proposed = {
    direct_sales: gross_value * rates.rate_direct_sales,
    referrer: gross_value * rates.rate_referrer,
    head_owner: gross_value * rates.rate_head_owner,
    mgr_sales: gross_value * rates.rate_mgr_sales,
    mgr_product: gross_value * rates.rate_mgr_product,
    mgr_region: gross_value * rates.rate_mgr_region,
  };

  // 3. Loại bỏ vai trò không có user_id (set = 0)
  if (!user_ids.direct_sales_user_id) proposed.direct_sales = 0;
  if (!user_ids.referrer_user_id) proposed.referrer = 0;
  if (!user_ids.head_owner_user_id) proposed.head_owner = 0;
  if (!user_ids.mgr_sales_user_id) proposed.mgr_sales = 0;
  if (!user_ids.mgr_product_user_id) proposed.mgr_product = 0;
  if (!user_ids.mgr_region_user_id) proposed.mgr_region = 0;

  const commission_proposed_total = Object.values(proposed).reduce((sum, val) => sum + val, 0);

  let allocations = { ...proposed };
  let k_factor;

  // 4. Kiểm tra vượt quỹ và áp dụng policy
  if (commission_proposed_total > commission_pool) {
    if (policy === 'priority') {
      // Option A: Theo thứ tự ưu tiên
      allocations = allocateByPriority(proposed, commission_pool);
    } else {
      // Option B: Co giãn tỉ lệ (prorate)
      k_factor = commission_pool / commission_proposed_total;
      allocations = {
        direct_sales: proposed.direct_sales * k_factor,
        referrer: proposed.referrer * k_factor,
        head_owner: proposed.head_owner * k_factor,
        mgr_sales: proposed.mgr_sales * k_factor,
        mgr_product: proposed.mgr_product * k_factor,
        mgr_region: proposed.mgr_region * k_factor,
      };
    }
  }

  // 5. Áp dụng làm tròn
  allocations = applyRounding(allocations, rounding_unit);

  // 6. Tính tổng đã chi và còn lại
  const commission_paid_total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const commission_remaining = commission_pool - commission_paid_total;

  return {
    commission_pool,
    commission_proposed_total,
    commission_paid_total,
    commission_remaining,
    allocations,
    k_factor,
    policy_used: policy,
  };
}

/**
 * Option A: Phân bổ theo thứ tự ưu tiên
 * Thứ tự: direct_sales → referrer → head_owner → mgr_sales → mgr_product → mgr_region
 */
function allocateByPriority(proposed, available_pool) {
  const priority_order = [
    'direct_sales',
    'referrer', 
    'head_owner',
    'mgr_sales',
    'mgr_product',
    'mgr_region'
  ];

  const allocations = {
    direct_sales: 0,
    referrer: 0,
    head_owner: 0,
    mgr_sales: 0,
    mgr_product: 0,
    mgr_region: 0,
  };

  let remaining_pool = available_pool;

  for (const role of priority_order) {
    if (remaining_pool <= 0) break;
    
    const proposed_amount = proposed[role] || 0;
    const allocated_amount = Math.min(proposed_amount, remaining_pool);
    
    allocations[role] = allocated_amount;
    remaining_pool -= allocated_amount;
  }

  return allocations;
}

/**
 * Áp dụng làm tròn theo rounding_unit
 */
function applyRounding(allocations, rounding_unit) {
  const rounded = {};

  for (const [role, amount] of Object.entries(allocations)) {
    rounded[role] = Math.round(amount / rounding_unit) * rounding_unit;
  }

  return rounded;
}

// Test cases
console.log('=== COMMISSION CALCULATION TEST ===\n');

// Test 1: Dữ liệu mẫu từ file flow (không vượt quỹ)
console.log('TEST 1: Dữ liệu mẫu từ file flow (không vượt quỹ)');
const test1 = {
  gross_value: 1000000000, // 1 tỷ VND
  commission_pool_rate: 0.05, // 5%
  rates: {
    rate_direct_sales: 0.015, // 1.5%
    rate_referrer: 0.01, // 1%
    rate_head_owner: 0.005, // 0.5%
    rate_mgr_sales: 0.005, // 0.5%
    rate_mgr_product: 0.005, // 0.5%
    rate_mgr_region: 0.005, // 0.5%
  },
  policy: 'priority',
  user_ids: {
    direct_sales_user_id: 1,
    referrer_user_id: 2,
    head_owner_user_id: 3,
    mgr_sales_user_id: 4,
    mgr_product_user_id: 5,
    mgr_region_user_id: 6,
  }
};

const result1 = calculateCommission(test1);
console.log('Input:', test1);
console.log('Result:', result1);
console.log('Expected: commission_pool = 50,000,000, paid_total = 45,000,000, remaining = 5,000,000\n');

// Test 2: Vượt quỹ - Option A (Priority)
console.log('TEST 2: Vượt quỹ - Option A (Priority)');
const test2 = {
  gross_value: 1000000000, // 1 tỷ VND
  commission_pool_rate: 0.03, // 3% (quỹ nhỏ hơn)
  rates: {
    rate_direct_sales: 0.015, // 1.5%
    rate_referrer: 0.01, // 1%
    rate_head_owner: 0.005, // 0.5%
    rate_mgr_sales: 0.005, // 0.5%
    rate_mgr_product: 0.005, // 0.5%
    rate_mgr_region: 0.005, // 0.5%
  },
  policy: 'priority',
  user_ids: {
    direct_sales_user_id: 1,
    referrer_user_id: 2,
    head_owner_user_id: 3,
    mgr_sales_user_id: 4,
    mgr_product_user_id: 5,
    mgr_region_user_id: 6,
  }
};

const result2 = calculateCommission(test2);
console.log('Input:', test2);
console.log('Result:', result2);
console.log('Expected: commission_pool = 30,000,000, proposed_total = 45,000,000 (vượt quỹ)');
console.log('Priority allocation: direct_sales = 15M, referrer = 10M, head_owner = 5M, others = 0\n');

// Test 3: Vượt quỹ - Option B (Prorate)
console.log('TEST 3: Vượt quỹ - Option B (Prorate)');
const test3 = { ...test2, policy: 'prorate' };

const result3 = calculateCommission(test3);
console.log('Input:', test3);
console.log('Result:', result3);
console.log('Expected: k_factor = 30/45 = 0.6667, all amounts scaled by k_factor\n');

// Test 4: Thiếu vai trò
console.log('TEST 4: Thiếu vai trò (không có referrer và manager)');
const test4 = {
  gross_value: 1000000000,
  commission_pool_rate: 0.05,
  rates: {
    rate_direct_sales: 0.015,
    rate_referrer: 0.01,
    rate_head_owner: 0.005,
    rate_mgr_sales: 0.005,
    rate_mgr_product: 0.005,
    rate_mgr_region: 0.005,
  },
  policy: 'priority',
  user_ids: {
    direct_sales_user_id: 1,
    // referrer_user_id: null, // Không có
    head_owner_user_id: 3,
    // mgr_sales_user_id: null, // Không có
    // mgr_product_user_id: null, // Không có
    // mgr_region_user_id: null, // Không có
  }
};

const result4 = calculateCommission(test4);
console.log('Input:', test4);
console.log('Result:', result4);
console.log('Expected: Chỉ direct_sales và head_owner được nhận commission\n');

console.log('=== TEST COMPLETED ===');
