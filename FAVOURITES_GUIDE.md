# 💝 Favourites Feature - Hướng Dẫn Sử Dụng

## 🎯 Tổng Quan

Tính năng Favourites cho phép người dùng:
- ✅ Thêm/xóa sản phẩm yêu thích
- ✅ Xem danh sách sản phẩm yêu thích
- ✅ Sử dụng AR trực tiếp từ màn hình favourites
- ✅ Xem chi tiết sản phẩm

---

## 📦 Files Đã Tạo/Sửa

### 1. **app/favourites.tsx** (MỚI)
Màn hình hiển thị danh sách sản phẩm yêu thích với:
- Grid layout đẹp
- AR button cho mỗi sản phẩm
- Remove favorite button
- Empty state
- Pull to refresh

### 2. **app/(product)/[id].tsx** (ĐÃ SỬA)
Thêm:
- Nút favorite trong header (heart icon)
- Toggle favorite functionality
- Check favorite status khi load

### 3. **service/product/index.js** (ĐÃ SỬA)
Thêm API functions:
- `addFavoriteProduct(productId)`
- `removeFavoriteProduct(productId)`
- `getFavoriteProducts()`
- `checkFavoriteProduct(productId)`

---

## 🚀 Cách Sử Dụng

### 1. Thêm Sản Phẩm Vào Favourites

**Từ Product Detail:**
```typescript
// Trong app/(product)/[id].tsx
// Nhấn icon heart ở góc phải header
<TouchableOpacity onPress={handleToggleFavorite}>
  <Ionicons 
    name={isFavorite ? "heart" : "heart-outline"} 
    size={26} 
    color={isFavorite ? "#e74c3c" : "#333"} 
  />
</TouchableOpacity>
```

### 2. Xem Danh Sách Favourites

**Navigate đến màn hình:**
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/favourites');
```

### 3. Sử dụng AR Từ Favourites

Trong màn hình favourites, mỗi sản phẩm có 3D model sẽ có:
- Badge "AR" ở góc trái ảnh
- Nút "XEM AR" dưới thông tin sản phẩm

```typescript
{hasModel && modelUrl && (
  <ARButton
    modelUrl={modelUrl}
    buttonText="XEM AR"
    size="small"
    variant="gradient"
  />
)}
```

---

## 🎨 UI Components

### Favourite Button (Product Detail)
```typescript
// Icon thay đổi dựa trên state
isFavorite ? "heart" : "heart-outline"

// Màu thay đổi
isFavorite ? "#e74c3c" : "#333"
```

### Favourite Card (Favourites Screen)
```
┌─────────────────────────────────┐
│  [AR Badge]        [Heart Icon] │
│                                  │
│      Product Image               │
│                                  │
├─────────────────────────────────┤
│  Product Name                    │
│  Category                        │
│  Price                           │
│  [XEM AR Button] (if has model)  │
│  [Xem chi tiết Button]          │
└─────────────────────────────────┘
```

---

## 📱 API Endpoints

### 1. Add Favorite
```javascript
POST /favorites
Body: { productId: "123" }
Response: { status: 200, data: {...} }
```

### 2. Remove Favorite
```javascript
DELETE /favorites/{productId}
Response: { status: 200 }
```

### 3. Get All Favorites
```javascript
GET /favorites
Response: { 
  status: 200, 
  data: [
    {
      id: "123",
      name: "Product Name",
      price: 1000000,
      thumbnailImage: "url",
      productColors: [...]
    }
  ]
}
```

### 4. Check Favorite Status
```javascript
GET /favorites/check?productId=123
Response: { 
  status: 200, 
  data: true/false 
}
```

---

## 🔧 Customization

### Thay Đổi Màu Heart Icon

**File**: `app/(product)/[id].tsx`
```typescript
// Line ~267
color={isFavorite ? "#e74c3c" : "#333"}
// Thay "#e74c3c" thành màu bạn muốn
```

### Thay Đổi Layout Favourites

**File**: `app/favourites.tsx`
```typescript
// Thay đổi card style
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,  // Thay đổi border radius
    marginBottom: 16,  // Thay đổi spacing
    // ...
  }
});
```

### Thay Đổi AR Button Size

```typescript
<ARButton
  modelUrl={modelUrl}
  buttonText="XEM AR"
  size="medium"  // small, medium, large
  variant="outline"  // gradient, outline, solid
/>
```

---

## 🎯 Features

### ✅ Product Detail Page
- [x] Heart icon trong header
- [x] Toggle favorite on/off
- [x] Check favorite status on load
- [x] Toast notifications
- [x] Icon animation (filled/outline)
- [x] Color change (red when favorited)

### ✅ Favourites Screen
- [x] Grid layout
- [x] Product images
- [x] Product info (name, category, price)
- [x] AR badge cho products có 3D model
- [x] AR button (small size)
- [x] Remove favorite button
- [x] View detail button
- [x] Empty state
- [x] Pull to refresh
- [x] Loading state
- [x] Count badge trong header

---

## 🎨 Empty State

Khi chưa có sản phẩm yêu thích:
```
     ♡ (large heart icon)
     
  Chưa có sản phẩm yêu thích
  
  Thêm sản phẩm vào danh sách
  yêu thích để xem lại sau
  
  [Khám phá sản phẩm]
```

---

## 💡 Usage Examples

### Navigate to Favourites
```typescript
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  return (
    <TouchableOpacity onPress={() => router.push('/favourites')}>
      <Text>Xem yêu thích</Text>
    </TouchableOpacity>
  );
}
```

### Add to Favorites Programmatically
```typescript
import { addFavoriteProduct } from '@/service/product';

async function addToFav(productId) {
  try {
    await addFavoriteProduct(productId);
    Toast.show({
      type: 'success',
      text1: 'Đã thêm vào yêu thích',
    });
  } catch (error) {
    console.error(error);
  }
}
```

### Check if Product is Favorited
```typescript
import { checkFavoriteProduct } from '@/service/product';

async function checkFav(productId) {
  try {
    const response = await checkFavoriteProduct(productId);
    const isFav = response.data.data;
    console.log('Is favorited:', isFav);
  } catch (error) {
    console.error(error);
  }
}
```

---

## 🐛 Troubleshooting

### Favorite không save?
1. ✅ Check API endpoint
2. ✅ Check authentication token
3. ✅ Check network request
4. ✅ View console logs

### Icon không đổi màu?
1. ✅ Check `isFavorite` state
2. ✅ Check `handleToggleFavorite` function
3. ✅ Verify API response

### AR button không hiện?
1. ✅ Check `hasModel` condition
2. ✅ Verify `productColors[0].models3D` exists
3. ✅ Check `modelUrl` is valid

### Empty state không hiện?
1. ✅ Check `favorites` array length
2. ✅ Verify `ListEmptyComponent` prop
3. ✅ Check data fetch

---

## 📊 Data Structure

### Product Object (from API)
```typescript
{
  id: string,
  name: string,
  price: number,
  categoryName: string,
  thumbnailImage: string,
  image: string,
  productColors: [
    {
      id: string,
      images: [
        { image: string }
      ],
      models3D: [
        {
          modelUrl: string,
          previewImage: string
        }
      ]
    }
  ]
}
```

---

## 🎓 Best Practices

### 1. Error Handling
```typescript
try {
  await addFavoriteProduct(id);
  // Success handling
} catch (error) {
  console.error(error);
  Toast.show({
    type: 'error',
    text1: 'Có lỗi xảy ra',
  });
}
```

### 2. Loading States
```typescript
const [loading, setLoading] = useState(true);

// Show loading
if (loading) {
  return <ActivityIndicator />;
}
```

### 3. Optimistic Updates
```typescript
// Update UI immediately
setIsFavorite(true);

// Then call API
try {
  await addFavoriteProduct(id);
} catch (error) {
  // Revert on error
  setIsFavorite(false);
}
```

---

## 🚀 Next Steps

### Có thể thêm:
- [ ] Favorite categories
- [ ] Share favorites
- [ ] Favorite collections
- [ ] Sort/filter favorites
- [ ] Sync across devices
- [ ] Favorite notifications
- [ ] Favorite analytics

---

## 📝 Quick Reference

### Import
```typescript
import { 
  addFavoriteProduct,
  removeFavoriteProduct,
  getFavoriteProducts,
  checkFavoriteProduct
} from '@/service/product';
```

### Navigate
```typescript
router.push('/favourites');
```

### Toggle Favorite
```typescript
await addFavoriteProduct(productId);
await removeFavoriteProduct(productId);
```

### Check Status
```typescript
const response = await checkFavoriteProduct(productId);
const isFav = response.data.data;
```

---

## 🎉 Kết Luận

Bạn đã có:
- ✅ Favorite functionality trong product detail
- ✅ Màn hình favourites riêng
- ✅ AR integration trong favourites
- ✅ Beautiful UI/UX
- ✅ Complete API integration

**Happy Coding! 💝**

---

**Created**: 2025-12-05
**Version**: 1.0.0
