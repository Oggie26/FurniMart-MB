# Hướng Dẫn Sử Dụng AR trong FurniMart Mobile App

## 📋 Tổng Quan

Demo AR này cho phép người dùng xem mô hình 3D nội thất trong không gian thực tế sử dụng công nghệ WebAR với `<model-viewer>` của Google.

## 🎯 Tính Năng

- ✅ Xem mô hình 3D trong WebView
- ✅ Xoay, phóng to/thu nhỏ mô hình
- ✅ Chế độ AR (đặt mô hình vào không gian thật)
- ✅ Auto-rotation
- ✅ Camera controls
- ✅ Hoạt động trên cả iOS và Android
- ✅ Không cần eject Expo
- ✅ Hoàn toàn miễn phí

## 📁 Cấu Trúc Files

```
furnimart-mobile-app/
├── components/
│   └── ar/
│       ├── ARViewer.tsx       # Component WebView AR chính
│       └── ARButton.tsx       # Button component để mở AR
├── app/
│   └── ar-demo.tsx           # Màn hình demo AR
└── assets/
    └── models/               # Thư mục chứa file .glb (tùy chọn)
```

## 🚀 Cách Sử Dụng

### 1. Xem Demo AR

Chạy app và navigate đến màn hình demo:

```typescript
// Trong navigation hoặc link
import { router } from 'expo-router';

router.push('/ar-demo');
```

### 2. Tích Hợp Vào Trang Chi Tiết Sản Phẩm

#### Cách 1: Sử dụng ARButton Component

```typescript
import ARButton from '@/components/ar/ARButton';

// Trong component của bạn
<ARButton 
  modelUrl="https://your-model-url.com/model.glb"
  buttonText="XEM TRONG PHÒNG"
  size="medium"
  variant="gradient"
/>
```

#### Cách 2: Sử dụng ARViewer trực tiếp

```typescript
import { useState } from 'react';
import { Modal, TouchableOpacity, Text } from 'react-native';
import ARViewer from '@/components/ar/ARViewer';

function ProductDetail() {
  const [showAR, setShowAR] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowAR(true)}>
        <Text>XEM TRONG PHÒNG</Text>
      </TouchableOpacity>

      <Modal visible={showAR} presentationStyle="fullScreen">
        <ARViewer 
          modelUrl="https://your-model.glb"
          onClose={() => setShowAR(false)}
        />
      </Modal>
    </>
  );
}
```

## 📦 Cách Lưu Trữ File .GLB

### Option 1: Host Online (Khuyến Nghị)

Upload file .glb lên các dịch vụ miễn phí:

1. **GitHub Pages** (Miễn phí, không giới hạn)
   ```
   https://username.github.io/repo-name/models/chair.glb
   ```

2. **Cloudinary** (Miễn phí 25GB)
   - Upload file .glb
   - Copy URL
   - Sử dụng trong app

3. **Google Drive** (Cần public link)
   - Upload file
   - Share > Anyone with link
   - Lấy direct download link

4. **Firebase Storage** (Miễn phí 5GB)
   ```typescript
   import { getStorage, ref, getDownloadURL } from 'firebase/storage';
   
   const storage = getStorage();
   const modelRef = ref(storage, 'models/chair.glb');
   const url = await getDownloadURL(modelRef);
   ```

### Option 2: Lưu Trong Assets (Cho Development)

```bash
# Tạo thư mục models
mkdir -p assets/models

# Copy file .glb vào
cp your-model.glb assets/models/
```

Sau đó sử dụng:

```typescript
import { Asset } from 'expo-asset';

// Load asset
const asset = Asset.fromModule(require('../assets/models/chair.glb'));
await asset.downloadAsync();

// Sử dụng URI
<ARViewer modelUrl={asset.uri} onClose={...} />
```

**⚠️ Lưu ý**: File .glb trong assets sẽ làm tăng kích thước app. Nên host online cho production.

## 🎨 Tùy Chỉnh ARButton

### Sizes
```typescript
<ARButton size="small" />   // Nhỏ
<ARButton size="medium" />  // Trung bình (mặc định)
<ARButton size="large" />   // Lớn
```

### Variants
```typescript
<ARButton variant="gradient" />  // Gradient (mặc định)
<ARButton variant="outline" />   // Viền
<ARButton variant="solid" />     // Màu đặc
```

### Custom Text
```typescript
<ARButton buttonText="Xem AR" />
<ARButton buttonText="Thử Trong Phòng" />
```

## 🔧 Cấu Hình Model-Viewer

Trong `ARViewer.tsx`, bạn có thể tùy chỉnh các thuộc tính:

```html
<model-viewer
  src="${modelUrl}"
  ar                              <!-- Bật chế độ AR -->
  ar-modes="webxr scene-viewer"   <!-- Chế độ AR hỗ trợ -->
  camera-controls                 <!-- Cho phép điều khiển camera -->
  auto-rotate                     <!-- Tự động xoay -->
  auto-rotate-delay="3000"        <!-- Delay trước khi xoay (ms) -->
  rotation-per-second="30deg"     <!-- Tốc độ xoay -->
  shadow-intensity="1"            <!-- Độ đậm bóng -->
  exposure="1"                    <!-- Độ sáng -->
  min-camera-orbit="auto auto 5%"
  max-camera-orbit="auto auto 100%"
  min-field-of-view="10deg"
  max-field-of-view="90deg"
>
</model-viewer>
```

## 📱 Hỗ Trợ Nền Tảng

### iOS
- ✅ iOS 12+ (AR Quick Look)
- ✅ Hỗ trợ .glb, .usdz
- ✅ ARKit cho AR mode

### Android
- ✅ Android 7.0+ (Scene Viewer)
- ✅ Hỗ trợ .glb
- ✅ ARCore cho AR mode (nếu thiết bị hỗ trợ)

## 🎯 Tìm Mô Hình 3D Miễn Phí

1. **Sketchfab** - https://sketchfab.com/
   - Hàng triệu mô hình miễn phí
   - Download định dạng .glb

2. **Poly Pizza** - https://poly.pizza/
   - Mô hình low-poly miễn phí
   - Tối ưu cho mobile

3. **Google Poly Archive** - https://poly.google.com/
   - Archive mô hình Google Poly

4. **TurboSquid Free** - https://www.turbosquid.com/Search/3D-Models/free
   - Mô hình miễn phí chất lượng cao

5. **CGTrader Free** - https://www.cgtrader.com/free-3d-models
   - Nhiều mô hình nội thất miễn phí

## 🛠️ Tối Ưu Hóa

### 1. Giảm Kích Thước File .GLB

```bash
# Sử dụng gltf-pipeline
npm install -g gltf-pipeline

# Nén file
gltf-pipeline -i input.glb -o output.glb -d
```

### 2. Lazy Loading

```typescript
// Chỉ load AR khi cần
const [ARViewerComponent, setARViewerComponent] = useState(null);

useEffect(() => {
  if (showAR) {
    import('@/components/ar/ARViewer').then(module => {
      setARViewerComponent(() => module.default);
    });
  }
}, [showAR]);
```

### 3. Preload Models

```typescript
// Preload model khi vào trang sản phẩm
useEffect(() => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'fetch';
  link.href = modelUrl;
  document.head.appendChild(link);
}, [modelUrl]);
```

## 🐛 Troubleshooting

### Lỗi: Model không load

1. Kiểm tra URL có đúng không
2. Kiểm tra CORS headers (nếu host riêng)
3. Kiểm tra file .glb có hợp lệ không
4. Xem console log trong WebView

### Lỗi: AR mode không hoạt động

1. Kiểm tra thiết bị có hỗ trợ AR không
2. Cấp quyền camera cho app
3. Kiểm tra kết nối internet
4. Thử trên thiết bị thật (không phải simulator)

### Lỗi: WebView trắng

1. Kiểm tra `javaScriptEnabled={true}`
2. Kiểm tra `domStorageEnabled={true}`
3. Xem error trong WebView console
4. Kiểm tra network requests

## 📚 Tài Liệu Tham Khảo

- [Model Viewer Documentation](https://modelviewer.dev/)
- [WebXR Device API](https://www.w3.org/TR/webxr/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [Expo WebView](https://docs.expo.dev/versions/latest/sdk/webview/)

## 💡 Tips

1. **Kích thước file**: Giữ file .glb dưới 10MB để load nhanh
2. **Polygon count**: Nên dưới 100K polygons cho mobile
3. **Textures**: Sử dụng textures dưới 2048x2048
4. **Testing**: Test trên thiết bị thật, không phải emulator
5. **Network**: Cache models để tránh download lại

## 🔐 Bảo Mật

Nếu muốn bảo vệ models:

1. Sử dụng signed URLs (Firebase, AWS S3)
2. Implement token authentication
3. Watermark models
4. DRM protection (nâng cao)

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Console logs
2. Network requests
3. Device compatibility
4. Model file integrity

---

**Tạo bởi**: FurniMart Development Team
**Cập nhật**: 2025-12-05
