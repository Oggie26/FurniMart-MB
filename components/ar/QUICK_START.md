# 🚀 Quick Start - AR Feature

## Bước 1: Chạy Demo AR

```bash
# Khởi động Expo
npm start

# hoặc
npx expo start
```

Sau đó navigate đến `/ar-demo` để xem demo đầy đủ.

## Bước 2: Sử dụng trong Product Detail

AR button đã được tích hợp vào trang chi tiết sản phẩm (`app/(product)/[id].tsx`).

Khi sản phẩm có `models3D` với `modelUrl`, nút "XEM TRONG PHÒNG" sẽ tự động hiển thị.

### Cấu trúc dữ liệu cần thiết:

```typescript
{
  productColors: [
    {
      id: "color-id",
      models3D: [
        {
          modelUrl: "https://example.com/model.glb",
          previewImage: "https://example.com/preview.jpg" // optional
        }
      ]
    }
  ]
}
```

## Bước 3: Test AR

### Trên Thiết Bị Thật (Khuyến Nghị)

1. Cài Expo Go app
2. Scan QR code từ terminal
3. Navigate đến trang sản phẩm có 3D model
4. Nhấn "XEM TRONG PHÒNG"
5. Nhấn "Xem AR" để vào chế độ AR

### Trên Emulator/Simulator

- AR mode sẽ không hoạt động
- Nhưng vẫn có thể xem và tương tác với mô hình 3D

## Bước 4: Thêm Mô Hình 3D Của Bạn

### Option 1: Sử dụng URL Online

```typescript
<ARButton 
  modelUrl="https://your-domain.com/models/chair.glb"
  buttonText="XEM TRONG PHÒNG"
/>
```

### Option 2: Upload lên Cloudinary

1. Đăng ký tài khoản miễn phí tại [cloudinary.com](https://cloudinary.com)
2. Upload file .glb
3. Copy URL
4. Sử dụng URL trong app

### Option 3: GitHub Pages (Miễn Phí)

1. Tạo repo mới trên GitHub
2. Upload file .glb vào thư mục `models/`
3. Enable GitHub Pages
4. URL sẽ là: `https://username.github.io/repo-name/models/chair.glb`

## Bước 5: Tối Ưu Mô Hình 3D

### Giảm kích thước file:

```bash
# Cài đặt gltf-pipeline
npm install -g gltf-pipeline

# Nén file .glb
gltf-pipeline -i input.glb -o output.glb -d
```

### Khuyến nghị:
- Kích thước file: < 10MB
- Polygon count: < 100K
- Texture size: < 2048x2048

## Bước 6: Tùy Chỉnh

### Thay đổi màu sắc gradient:

Trong `ARButton.tsx`, tìm và thay đổi:

```typescript
colors={['#667eea', '#764ba2']}  // Thay đổi màu ở đây
```

### Thay đổi text:

```typescript
<ARButton 
  buttonText="Thử Ngay AR"  // Tùy chỉnh text
  size="large"
  variant="gradient"
/>
```

## 🎯 Các Tính Năng Có Sẵn

✅ Xoay mô hình (drag)
✅ Phóng to/thu nhỏ (pinch)
✅ Auto-rotation
✅ AR mode (đặt vào không gian thật)
✅ Reset camera
✅ Tắt/bật auto-rotation

## 📱 Yêu Cầu Thiết Bị

### iOS
- iOS 12 trở lên
- Hỗ trợ ARKit

### Android
- Android 7.0 trở lên
- Hỗ trợ ARCore (tùy thiết bị)

## 🐛 Troubleshooting

### Mô hình không load?
1. Kiểm tra URL có đúng không
2. Kiểm tra CORS (nếu tự host)
3. Kiểm tra kết nối internet
4. Xem console log

### AR mode không hoạt động?
1. Chỉ test trên thiết bị thật
2. Cấp quyền camera cho app
3. Kiểm tra thiết bị có hỗ trợ AR không

### WebView trắng?
1. Restart app
2. Clear cache
3. Kiểm tra console errors

## 📚 Tài Liệu Chi Tiết

Xem file `components/ar/README.md` để biết thêm chi tiết.

## 💡 Tips

1. **Test trên thiết bị thật** - AR chỉ hoạt động trên thiết bị thật
2. **Sử dụng mô hình nhẹ** - Để tải nhanh hơn
3. **Host online** - Tránh làm tăng kích thước app
4. **Tối ưu textures** - Giảm kích thước texture

## 🎨 Ví Dụ Sử Dụng

### Trong Product Detail Page:

```typescript
import ARButton from '@/components/ar/ARButton';

// Gradient button (mặc định)
<ARButton 
  modelUrl={product.modelUrl}
  buttonText="XEM TRONG PHÒNG"
  size="large"
  variant="gradient"
/>

// Outline button
<ARButton 
  modelUrl={product.modelUrl}
  buttonText="Xem AR"
  size="medium"
  variant="outline"
/>

// Solid button
<ARButton 
  modelUrl={product.modelUrl}
  buttonText="AR View"
  size="small"
  variant="solid"
/>
```

### Sử dụng ARViewer trực tiếp:

```typescript
import { useState } from 'react';
import { Modal } from 'react-native';
import ARViewer from '@/components/ar/ARViewer';

function MyComponent() {
  const [showAR, setShowAR] = useState(false);

  return (
    <>
      <Button onPress={() => setShowAR(true)}>
        Open AR
      </Button>

      <Modal visible={showAR} presentationStyle="fullScreen">
        <ARViewer 
          modelUrl="https://example.com/model.glb"
          onClose={() => setShowAR(false)}
        />
      </Modal>
    </>
  );
}
```

---

**Chúc bạn thành công! 🎉**

Nếu có vấn đề gì, hãy kiểm tra console log hoặc xem file README.md chi tiết.
