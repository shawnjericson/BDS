# 📄 Software Requirement Specification (SRS)
**Project:** React Native App + Web Admin (Quản lý Doanh thu & Ví hoa hồng)  
**Version:** 0.1 (Draft)

---

## 1. Giới thiệu

### 1.1 Mục tiêu  
Xây dựng hệ thống **mobile app (React Native)** cho user và **web admin** cho quản trị viên.  
Ứng dụng tập trung vào:
- Quản lý **tài khoản** qua mã giới thiệu.
- Quản lý **sản phẩm & booking**.
- Quản lý **doanh thu** và **ví hoa hồng**.
- Đảm bảo tính **tách bạch** giữa doanh thu (booking/order) và ví (ledger).

### 1.2 Phạm vi
- **User (App):** đăng ký bằng mã giới thiệu, thêm sản phẩm (cần duyệt), booking sản phẩm, xem doanh thu, quản lý ví hoa hồng.
- **Admin (Web):** tạo & quản lý tài khoản, cấu hình rank, duyệt sản phẩm, quản lý booking, điều chỉnh ví hoa hồng.

---

## 2. Yêu cầu chức năng

### 2.1 Tài khoản & Giới thiệu
- **Admin:**
  - Tạo tài khoản → sinh mã giới thiệu.
  - Danh sách tài khoản (hiển thị mã giới thiệu, rank, trạng thái).
  - Config rank (tạo/sửa/xoá).
- **User:**
  - Đăng ký trên app qua **mã giới thiệu** (bắt buộc).
  - Mỗi user có 1 mã giới thiệu riêng để mời người khác.

---

### 2.2 Sản phẩm
- **User:**
  - Thêm sản phẩm (*tên, mô tả, hình ảnh, giá, hoa hồng, hoa hồng muốn nhận*).
  - Trạng thái mặc định: `SUBMITTED`.
- **Admin:**
  - Duyệt hoặc từ chối sản phẩm (`APPROVED` / `REJECTED`).
  - Có thể thêm sản phẩm trực tiếp.
- **User khác:**
  - Booking sản phẩm từ listing (chỉ sp đã duyệt).

---

### 2.3 Doanh thu (Booking)
- **User:**
  - Xem danh sách booking của mình + hoa hồng dự kiến.
- **Admin:**
  - Quản lý tất cả booking.
  - Đổi trạng thái:
    - `COMPLETED` → ghi nhận hoa hồng vào ví.
    - `CANCELED` → không ghi nhận.

---

### 2.4 Ví hoa hồng
- **User:**
  - Xem số dư ví.
  - Xem lịch sử giao dịch (hoa hồng trực tiếp, giới thiệu, điều chỉnh…).
- **Admin:**
  - Có thể cộng/trừ tiền ví (ghi reason + log audit).
- **Nguyên tắc:**
  - Ví được quản lý qua **ledger (wallet transactions)**.
  - Không thay đổi số dư trực tiếp → chỉ thay đổi qua giao dịch.

---

## 3. Luồng nghiệp vụ chính

### 3.1 Đăng ký qua mã giới thiệu
1. User nhập mã giới thiệu.
2. Hệ thống kiểm tra → nếu hợp lệ thì tạo tài khoản.
3. Sinh mã giới thiệu mới cho user đó.

### 3.2 Tạo & duyệt sản phẩm
1. User thêm sản phẩm.
2. Admin duyệt/từ chối.
3. Nếu duyệt → xuất hiện trong listing.

### 3.3 Booking & hoa hồng
1. User booking sản phẩm.
2. Admin đổi trạng thái booking.
3. Nếu `COMPLETED` → hoa hồng chuyển sang ví (ghi ledger).
4. Nếu `CANCELED` → không tạo hoa hồng.

---

## 4. Mô hình dữ liệu (Draft)

### Users
- id, name, email/phone, referralCode, referredBy, rankId, status

### Ranks
- id, name, description, rule(json)

### Products
- id, ownerUserId, name, desc, images[], price, commission, desiredCommission, status

### Bookings
- id, userId, productId, qty, priceSnapshot, commissionSnapshot, status, completedAt, canceledAt

### Wallets
- id, userId, balance

### WalletTransactions (Ledger)
- id, walletId, amount(+/-), type, refId, description, balanceAfter, createdBy, createdAt

---

## 5. Quy tắc & trạng thái

### Trạng thái sản phẩm
- `SUBMITTED` → `APPROVED` / `REJECTED`

### Trạng thái booking
- `PENDING` → `COMPLETED` / `CANCELED`

### Loại giao dịch ví
- `COMMISSION_DIRECT`
- `COMMISSION_REFERRAL`
- `ADJUSTMENT_CREDIT`
- `ADJUSTMENT_DEBIT`

---

## 6. API gợi ý

- `POST /auth/register` (có referralCode)
- `GET /admin/users`
- `POST /admin/users`
- `POST /products`
- `PATCH /admin/products/:id/approve|reject`
- `POST /bookings`
- `PATCH /admin/bookings/:id/status`
- `GET /wallets/me/summary`
- `GET /wallets/me/transactions`
- `POST /admin/wallet-adjustments`

---

## 7. Acceptance Criteria (ví dụ)

- Khi booking `COMPLETED` → tạo ít nhất 1 giao dịch ví + cập nhật số dư.
- Khi booking `CANCELED` → không tạo giao dịch ví.
- Khi admin `+/- ví` → bắt buộc có lý do + log audit.
- Đăng ký user mà không có mã giới thiệu hợp lệ → từ chối.

---

## 8. Roadmap phát triển

- **MVP:** Đăng ký referral, sản phẩm (submit/duyệt), booking, ví hoa hồng, admin +/- ví.
- **Next:** Rank ảnh hưởng hoa hồng, báo cáo, xuất CSV, rút tiền, thông báo đẩy/email, đa tầng referral.
