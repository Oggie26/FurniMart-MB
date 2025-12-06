# 🌐 Hướng Dẫn Host Mô Hình 3D Miễn Phí

## 1. GitHub Pages (Khuyến Nghị - Hoàn Toàn Miễn Phí)

### Ưu điểm:
- ✅ Hoàn toàn miễn phí
- ✅ Không giới hạn băng thông
- ✅ HTTPS mặc định
- ✅ Dễ quản lý với Git

### Cách làm:

#### Bước 1: Tạo Repository

```bash
# Tạo thư mục mới
mkdir furnimart-3d-models
cd furnimart-3d-models

# Khởi tạo git
git init

# Tạo thư mục models
mkdir models
```

#### Bước 2: Thêm File .glb

```bash
# Copy file .glb vào thư mục models
cp /path/to/your/model.glb models/

# Tạo file index.html (để test)
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>FurniMart 3D Models</title>
</head>
<body>
  <h1>FurniMart 3D Models Repository</h1>
  <p>This repository hosts 3D models for FurniMart AR app.</p>
</body>
</html>
EOF
```

#### Bước 3: Push lên GitHub

```bash
# Add files
git add .
git commit -m "Add 3D models"

# Tạo repo trên GitHub (qua web interface)
# Sau đó:
git remote add origin https://github.com/YOUR_USERNAME/furnimart-3d-models.git
git branch -M main
git push -u origin main
```

#### Bước 4: Enable GitHub Pages

1. Vào Settings của repo
2. Chọn Pages (sidebar trái)
3. Source: Deploy from a branch
4. Branch: main / root
5. Save

#### Bước 5: Sử dụng URL

URL của bạn sẽ là:
```
https://YOUR_USERNAME.github.io/furnimart-3d-models/models/chair.glb
```

Sử dụng trong app:
```typescript
<ARButton 
  modelUrl="https://YOUR_USERNAME.github.io/furnimart-3d-models/models/chair.glb"
/>
```

---

## 2. Cloudinary (Miễn Phí 25GB)

### Ưu điểm:
- ✅ 25GB storage miễn phí
- ✅ CDN toàn cầu
- ✅ Upload dễ dàng
- ✅ Transformation API

### Cách làm:

#### Bước 1: Đăng Ký

1. Truy cập https://cloudinary.com
2. Sign up (miễn phí)
3. Xác nhận email

#### Bước 2: Upload File

1. Vào Media Library
2. Click Upload
3. Chọn file .glb
4. Upload

#### Bước 3: Lấy URL

1. Click vào file đã upload
2. Copy URL
3. URL sẽ có dạng:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/v1234567890/model.glb
```

#### Bước 4: Sử dụng

```typescript
<ARButton 
  modelUrl="https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/v1234567890/chair.glb"
/>
```

---

## 3. Firebase Storage (Miễn Phí 5GB)

### Ưu điểm:
- ✅ 5GB storage miễn phí
- ✅ Tích hợp tốt với app
- ✅ Bảo mật tốt
- ✅ Download URL dễ dàng

### Cách làm:

#### Bước 1: Setup Firebase

```bash
npm install firebase
```

#### Bước 2: Config Firebase

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
```

#### Bước 3: Upload File (qua Console hoặc Code)

**Via Firebase Console:**
1. Vào Firebase Console
2. Storage
3. Upload Files
4. Upload file .glb

**Via Code:**
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase.config';

async function uploadModel(file: File) {
  const storageRef = ref(storage, `models/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
```

#### Bước 4: Lấy URL

```typescript
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase.config';

async function getModelUrl(filename: string) {
  const modelRef = ref(storage, `models/${filename}`);
  const url = await getDownloadURL(modelRef);
  return url;
}

// Sử dụng
const modelUrl = await getModelUrl('chair.glb');
```

---

## 4. Vercel Blob (Miễn Phí 500MB)

### Ưu điểm:
- ✅ 500MB miễn phí
- ✅ Edge network
- ✅ Tốc độ cao
- ✅ Dễ tích hợp

### Cách làm:

```bash
npm install @vercel/blob
```

```typescript
import { put } from '@vercel/blob';

async function uploadToVercel(file: File) {
  const blob = await put(file.name, file, {
    access: 'public',
  });
  return blob.url;
}
```

---

## 5. Google Drive (Miễn Phí 15GB)

### ⚠️ Lưu ý: Cần setup direct link

### Cách làm:

#### Bước 1: Upload File

1. Upload file .glb lên Google Drive
2. Right click > Share
3. Change to "Anyone with the link"
4. Copy link

#### Bước 2: Convert sang Direct Link

Link gốc:
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

Direct link:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

#### Bước 3: Sử dụng

```typescript
<ARButton 
  modelUrl="https://drive.google.com/uc?export=download&id=FILE_ID"
/>
```

---

## 6. Netlify (Miễn Phí 100GB Bandwidth/tháng)

### Cách làm:

#### Bước 1: Tạo Project

```bash
mkdir furnimart-models
cd furnimart-models
mkdir models
# Copy files vào models/
```

#### Bước 2: Deploy

```bash
# Cài Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

#### Bước 3: URL

```
https://YOUR_SITE.netlify.app/models/chair.glb
```

---

## 📊 So Sánh

| Service | Storage | Bandwidth | Tốc độ | Dễ dùng | Khuyến nghị |
|---------|---------|-----------|--------|---------|-------------|
| GitHub Pages | Unlimited | Unlimited | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Best |
| Cloudinary | 25GB | 25GB/tháng | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Good |
| Firebase | 5GB | 1GB/ngày | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Good |
| Vercel Blob | 500MB | Unlimited | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ Limited |
| Google Drive | 15GB | Limited | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ Slow |
| Netlify | 100GB | 100GB/tháng | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Good |

---

## 🎯 Khuyến Nghị

### Cho Development:
- **GitHub Pages** - Dễ nhất, miễn phí hoàn toàn

### Cho Production:
- **Cloudinary** - CDN tốt, nhiều tính năng
- **Firebase Storage** - Tích hợp tốt với app
- **Netlify** - Nhanh và dễ dùng

### Cho Testing:
- **GitHub Pages** - Setup nhanh nhất

---

## 🔧 Script Tự Động Upload

### Upload lên GitHub Pages

```bash
#!/bin/bash
# upload-models.sh

# Config
REPO_PATH="./furnimart-3d-models"
MODELS_DIR="./models"

# Create repo if not exists
if [ ! -d "$REPO_PATH" ]; then
  mkdir -p $REPO_PATH
  cd $REPO_PATH
  git init
  mkdir models
else
  cd $REPO_PATH
fi

# Copy new models
cp -r $MODELS_DIR/* ./models/

# Commit and push
git add .
git commit -m "Update 3D models $(date)"
git push origin main

echo "✅ Models uploaded successfully!"
echo "URL: https://YOUR_USERNAME.github.io/furnimart-3d-models/models/"
```

Sử dụng:
```bash
chmod +x upload-models.sh
./upload-models.sh
```

---

## 📝 Checklist

Trước khi host:

- [ ] File .glb đã được tối ưu (< 10MB)
- [ ] Test file trên local
- [ ] Chọn hosting service
- [ ] Upload file
- [ ] Test URL trong browser
- [ ] Test trong app
- [ ] Kiểm tra CORS (nếu cần)
- [ ] Backup file gốc

---

## 🐛 Troubleshooting

### CORS Error?

Thêm headers (nếu tự host):
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

### File không load?

1. Kiểm tra URL có đúng không
2. Test URL trong browser
3. Kiểm tra file size
4. Kiểm tra network tab

### Slow loading?

1. Tối ưu file .glb
2. Sử dụng CDN
3. Enable compression
4. Preload models

---

**Happy Hosting! 🚀**
