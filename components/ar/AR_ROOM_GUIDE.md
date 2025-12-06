# 🏠 AR Room - Hướng Dẫn Đầy Đủ

## 🎯 Tổng Quan

**AR Room** là tính năng cho phép người dùng đặt **nhiều sản phẩm** vào không gian thật, giống như **IKEA Place**.

### ✨ Tính Năng Chính

- ✅ Bật camera AR tự động
- ✅ Nhận diện bề mặt (surface detection)
- ✅ Đặt vô hạn sản phẩm
- ✅ Chọn từ danh sách sản phẩm
- ✅ Xóa tất cả và làm lại
- ✅ Đếm số sản phẩm đã đặt

---

## 📦 Files Đã Tạo

### 1. **components/ar/ARRoomViewer.tsx**
Component chính cho AR Room:
- WebView với Three.js + WebXR
- Surface detection
- Hit testing
- Product list UI
- Message passing giữa RN ↔ WebAR

### 2. **app/ar-room.tsx**
Màn hình demo AR Room:
- Giới thiệu tính năng
- Hướng dẫn sử dụng
- Sample products
- Start button

---

## 🚀 Cách Sử Dụng

### **Basic Usage:**

```typescript
import ARRoomViewer from '@/components/ar/ARRoomViewer';

const products = [
  {
    id: '1',
    name: 'Ghế Sofa',
    modelUrl: 'https://example.com/sofa.glb',
    thumbnailImage: 'https://example.com/sofa.jpg',
    price: 12500000,
  },
  // ... more products
];

<ARRoomViewer
  products={products}
  onClose={() => setShowAR(false)}
/>
```

### **Navigate to Demo:**

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/ar-room');
```

---

## 🎮 Luồng Hoạt Động

```
1. User mở AR Room
   ↓
2. WebAR khởi động
   - Bật camera
   - Request AR session
   - Enable hit-test
   ↓
3. Surface detection
   - Quét bề mặt
   - Hiện reticle (vòng tròn xanh)
   ↓
4. User chọn sản phẩm từ list
   - React Native gửi message → WebView
   - WebAR nhận modelUrl
   ↓
5. User nhấn vào màn hình
   - Hit test tìm vị trí
   - Load model 3D
   - Đặt model vào vị trí
   ↓
6. Lặp lại bước 4-5
   - Chọn sản phẩm khác
   - Đặt thêm vào không gian
   ↓
7. Xóa tất cả (optional)
   - Nhấn nút "Xóa tất cả"
   - Clear scene
   - Bắt đầu lại
```

---

## 💬 Message Passing

### **React Native → WebView:**

```typescript
// Add product
webViewRef.current?.postMessage(JSON.stringify({
  type: 'ADD_PRODUCT',
  data: {
    id: '123',
    name: 'Ghế Sofa',
    modelUrl: 'https://example.com/sofa.glb',
  },
}));

// Clear all
webViewRef.current?.postMessage(JSON.stringify({
  type: 'CLEAR_ALL',
}));
```

### **WebView → React Native:**

```javascript
// In WebView HTML
window.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'ADD_PRODUCT') {
    currentModelUrl = message.data.modelUrl;
    // Update instructions
  } else if (message.type === 'CLEAR_ALL') {
    clearAllModels();
  }
});
```

---

## 🎨 UI Components

### **1. Product List (Bottom Sheet)**

```
┌─────────────────────────────────┐
│ Chọn sản phẩm để đặt    [🗑️]   │
├─────────────────────────────────┤
│ [Product 1] [Product 2] [...]   │
│   + Image                        │
│   + Name                         │
│   + Price                        │
│   + Add button                   │
└─────────────────────────────────┘
```

### **2. AR View (Full Screen)**

```
┌─────────────────────────────────┐
│ [X]                             │  ← Close button
│                                  │
│   Nhấn vào màn hình để đặt      │  ← Instructions
│                                  │
│                                  │
│        [Camera View]             │
│        + Reticle (⭕)            │
│                                  │
│                    Sản phẩm: 3   │  ← Count badge
│                                  │
│                                  │
│         [🗑️ Xóa tất cả]         │  ← Controls
│                                  │
│  [⬇️ Ẩn danh sách]              │  ← Toggle
└─────────────────────────────────┘
```

---

## 🔧 Customization

### **Change Reticle Color:**

```javascript
// In ARRoomViewer.tsx HTML
const material = new THREE.MeshBasicMaterial({ 
  color: 0x2f855a  // Change this
});
```

### **Change Model Scale:**

```javascript
model.scale.set(0.5, 0.5, 0.5);  // Adjust scale
```

### **Change Light Intensity:**

```javascript
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);  // Last param
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);  // Last param
```

### **Custom Product List UI:**

Edit styles in `ARRoomViewer.tsx`:
```typescript
productListContainer: {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',  // Change background
  borderTopLeftRadius: 20,  // Change radius
  // ...
}
```

---

## 📱 Platform Support

| Platform | AR Support | Requirements |
|----------|------------|--------------|
| **iOS** | ✅ ARKit | iOS 12+, ARKit-capable device |
| **Android** | ✅ ARCore | Android 7.0+, ARCore-supported device |
| **Emulator** | ❌ | AR requires real device |

---

## 🐛 Troubleshooting

### **AR không khởi động?**

```
✅ Check device AR support
✅ Grant camera permission
✅ Test on real device (not emulator)
✅ Check console logs
```

### **Model không load?**

```
✅ Verify modelUrl is valid
✅ Check CORS headers
✅ Ensure file size < 10MB
✅ Test URL in browser
```

### **Reticle không hiện?**

```
✅ Move device around
✅ Ensure good lighting
✅ Point at flat surface
✅ Wait for surface detection
```

### **WebView trắng?**

```
✅ Check javaScriptEnabled={true}
✅ Check domStorageEnabled={true}
✅ View WebView console
✅ Restart app
```

---

## 🎓 Advanced Usage

### **Integrate with Favourites:**

```typescript
import { useEffect, useState } from 'react';
import { getFavoriteProducts } from '@/service/product/favorites';
import { getProductById } from '@/service/product';
import ARRoomViewer from '@/components/ar/ARRoomViewer';

function FavouritesARRoom() {
  const [products, setProducts] = useState([]);
  const [showAR, setShowAR] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      const response = await getFavoriteProducts();
      const favoriteItems = response.data.data || [];
      
      // Fetch full product details
      const productsPromises = favoriteItems.map(async (fav) => {
        const productResponse = await getProductById(fav.productId);
        if (productResponse?.status === 200) {
          const product = productResponse.data.data;
          return {
            id: product.id,
            name: product.name,
            modelUrl: product.productColors[0]?.models3D[0]?.modelUrl,
            thumbnailImage: product.thumbnailImage,
            price: product.price,
          };
        }
        return null;
      });

      const validProducts = (await Promise.all(productsPromises))
        .filter(p => p !== null && p.modelUrl);
      
      setProducts(validProducts);
    }

    loadFavorites();
  }, []);

  return (
    <>
      <Button onPress={() => setShowAR(true)}>
        Open AR Room with Favourites
      </Button>

      {showAR && (
        <ARRoomViewer
          products={products}
          onClose={() => setShowAR(false)}
        />
      )}
    </>
  );
}
```

### **Custom Product Selection:**

```typescript
// Filter products by category
const furnitureProducts = allProducts.filter(p => 
  p.categoryName === 'Nội thất phòng khách'
);

<ARRoomViewer
  products={furnitureProducts}
  onClose={() => setShowAR(false)}
/>
```

---

## 📊 Performance Tips

### **1. Optimize Models:**

```bash
# Use gltf-pipeline to compress
gltf-pipeline -i input.glb -o output.glb -d

# Recommendations:
- File size: < 5MB (ideal < 2MB)
- Polygons: < 50K
- Textures: < 1024x1024
```

### **2. Lazy Load Models:**

Models are loaded on-demand when user selects them, not all at once.

### **3. Limit Product Count:**

```typescript
// Show only products with 3D models
const productsWithModels = allProducts.filter(p => 
  p.productColors?.[0]?.models3D?.length > 0
);

// Limit to 10 products
const limitedProducts = productsWithModels.slice(0, 10);
```

---

## 🎯 Best Practices

### **1. Product Data Structure:**

```typescript
interface Product {
  id: string;
  name: string;
  modelUrl: string;          // Required for AR
  thumbnailImage: string;    // For product list
  price?: number;            // Optional
}
```

### **2. Error Handling:**

```typescript
try {
  const response = await getProductById(productId);
  if (response?.status === 200) {
    const product = response.data.data;
    
    // Validate model URL
    if (!product.productColors?.[0]?.models3D?.[0]?.modelUrl) {
      console.warn('Product has no 3D model');
      return null;
    }
    
    return product;
  }
} catch (error) {
  console.error('Error loading product:', error);
  return null;
}
```

### **3. User Instructions:**

Always show clear instructions:
- "Nhấn vào màn hình để đặt sản phẩm"
- "Đã chọn: [Product Name]"
- "Sản phẩm đã được đặt!"

---

## 🚀 Next Steps

### **Có thể thêm:**

- [ ] Rotate/scale models after placement
- [ ] Delete individual models
- [ ] Save AR scene
- [ ] Share AR screenshot
- [ ] Measure distances
- [ ] Change model materials/colors
- [ ] Undo/redo functionality
- [ ] AR scene templates

---

## 📝 Quick Reference

### **Import:**
```typescript
import ARRoomViewer from '@/components/ar/ARRoomViewer';
```

### **Basic Usage:**
```typescript
<ARRoomViewer
  products={products}
  onClose={() => setShowAR(false)}
/>
```

### **Navigate to Demo:**
```typescript
router.push('/ar-room');
```

---

## 🎉 Kết Luận

Bạn đã có:
- ✅ AR Room viewer hoàn chỉnh
- ✅ Multi-product placement
- ✅ Surface detection
- ✅ Product list UI
- ✅ Demo screen
- ✅ Full documentation

**Giống IKEA Place! 🏠🎨**

---

**Created**: 2025-12-05
**Version**: 1.0.0
**Status**: ✅ Production Ready
