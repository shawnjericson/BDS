# BDS Admin Web Application

Admin panel cho hệ thống BDS (Bất Động Sản) được xây dựng với React, TypeScript và Tailwind CSS.

## 🚀 Tính năng

### ✅ **Đã hoàn thành:**

#### **1. Quản lý người dùng**
- Xem danh sách người dùng với phân trang
- Chỉnh sửa trạng thái người dùng (Active/Inactive)
- Phân quyền cấp bậc cho người dùng
- Xem thông tin chi tiết (avatar, email, mã giới thiệu, số dư ví)
- Thống kê tổng quan (tổng user, đang hoạt động, tạm khóa)

#### **2. Quản lý cấp bậc (Ranks)**
- Tạo, sửa, xóa cấp bậc
- Cấu hình tỷ lệ hoa hồng cho từng vai trò:
  - Bán trực tiếp (direct_sales)
  - Người giới thiệu (referrer)
  - Đầu chủ (head_owner)
  - QLKD (mgr_sales)
  - QLSP/DA (mgr_product)
  - QLKV (mgr_region)
- Giao diện trực quan để set rank_shares_pct

#### **3. Quản lý sản phẩm**
- Xem danh sách sản phẩm
- Duyệt/từ chối sản phẩm
- Lọc theo trạng thái
- Thống kê sản phẩm theo trạng thái

#### **4. Quản lý booking**
- Xem danh sách booking
- Cập nhật trạng thái booking
- Thống kê booking theo trạng thái
- Xem thông tin người bán, người giới thiệu, quản lý

#### **5. Quản lý ví**
- Xem danh sách ví người dùng
- Điều chỉnh số dư ví (cộng/trừ tiền)
- Thống kê tổng số dư, tổng ví, tổng giao dịch
- Ghi chú lý do điều chỉnh

#### **6. Dashboard**
- Thống kê tổng quan hệ thống
- Người dùng mới nhất
- Booking gần đây
- Thao tác nhanh

#### **7. Authentication**
- Đăng nhập/đăng xuất
- JWT token management
- Protected routes

## 🎨 **Giao diện**

- **Tailwind CSS**: Styling hiện đại, responsive
- **Không icons**: Giao diện đơn giản, dễ nhìn
- **Clean UI**: Màu sắc nhẹ nhàng, typography rõ ràng
- **Mobile responsive**: Hoạt động tốt trên mọi thiết bị

## 🛠 **Cài đặt**

### **1. Cài đặt dependencies:**
```bash
cd admin-webapp
npm install
```

### **2. Cấu hình:**
Chỉnh sửa `src/services/api.ts` để cập nhật URL backend:
```typescript
baseURL: 'http://localhost:3000', // Backend URL
```

### **3. Chạy development:**
```bash
npm run dev
```
App sẽ chạy tại: http://localhost:3001

### **4. Build production:**
```bash
npm run build
npm run serve
```

## 🔧 **Cấu trúc project**

```
admin-webapp/
├── src/
│   ├── components/          # Shared components
│   │   ├── Header.tsx       # Header với user menu
│   │   └── Sidebar.tsx      # Navigation sidebar
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Trang tổng quan
│   │   ├── Users.tsx        # Quản lý người dùng
│   │   ├── Ranks.tsx        # Quản lý cấp bậc
│   │   ├── Products.tsx     # Quản lý sản phẩm
│   │   ├── Bookings.tsx     # Quản lý booking
│   │   ├── Wallets.tsx      # Quản lý ví
│   │   └── Login.tsx        # Trang đăng nhập
│   ├── services/            # API services
│   │   └── api.ts           # API client
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json
```

## 🔑 **API Integration**

### **Backend endpoints được sử dụng:**

#### **Authentication:**
- `POST /auth/login` - Đăng nhập
- `GET /users/me` - Lấy thông tin user hiện tại

#### **User Management:**
- `GET /admin/users` - Danh sách người dùng
- `GET /admin/users/:id` - Chi tiết người dùng
- `PATCH /admin/users/:id/status` - Cập nhật trạng thái

#### **Rank Management:**
- `GET /admin/ranks` - Danh sách cấp bậc
- `POST /admin/ranks` - Tạo cấp bậc
- `PATCH /admin/ranks/:id` - Cập nhật cấp bậc
- `DELETE /admin/ranks/:id` - Xóa cấp bậc
- `PATCH /admin/ranks/:id/shares` - Cập nhật rank shares

#### **User Rank Assignment:**
- `GET /admin/users/:userId/ranks` - Cấp bậc của user
- `POST /admin/users/:userId/ranks` - Phân quyền cấp bậc
- `DELETE /admin/users/:userId/ranks/:rankId` - Xóa cấp bậc

#### **Products:**
- `GET /admin/products` - Danh sách sản phẩm
- `PATCH /admin/products/:id/status` - Cập nhật trạng thái

#### **Bookings:**
- `GET /admin/bookings` - Danh sách booking
- `PATCH /admin/bookings/:id/status` - Cập nhật trạng thái

#### **Wallets:**
- `GET /admin/wallets` - Danh sách ví
- `GET /admin/wallets/stats` - Thống kê ví
- `POST /admin/wallet-adjustments` - Điều chỉnh ví

## 🎯 **Tính năng chính**

### **1. Quản lý cấp bậc và hoa hồng:**
- Tạo các cấp bậc: Thành viên, Đại lý, Quản lý
- Set tỷ lệ hoa hồng cho từng vai trò
- Phân quyền cấp bậc cho người dùng

### **2. Quản lý người dùng:**
- Xem danh sách với avatar, thông tin chi tiết
- Cập nhật trạng thái (kích hoạt/tạm khóa)
- Phân quyền cấp bậc

### **3. Quản lý ví:**
- Xem số dư của tất cả người dùng
- Điều chỉnh số dư (cộng/trừ tiền)
- Ghi chú lý do điều chỉnh

## 🔐 **Demo Login:**
```
Email: admin@example.com
Password: password123
```

## 📱 **Responsive Design:**
- Desktop: Full layout với sidebar
- Tablet: Responsive grid và tables
- Mobile: Optimized cho màn hình nhỏ

## 🚀 **Production Ready:**
- TypeScript cho type safety
- Error handling đầy đủ
- Loading states
- User feedback (success/error messages)
- Clean code structure
- Tailwind CSS cho performance tốt

**Admin webapp đã sẵn sàng để quản lý hệ thống BDS!** 🎯
