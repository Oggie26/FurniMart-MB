# 🎨 Mô Hình 3D Mẫu Miễn Phí

## Model Viewer Sample Models (Google)

Đây là các mô hình 3D miễn phí từ Google Model Viewer, đã được tối ưu cho WebAR:

### 1. Astronaut (Phi Hành Gia)
```
https://modelviewer.dev/shared-assets/models/Astronaut.glb
```
- Size: ~4MB
- Polygons: ~50K
- Animated: Yes
- Textures: PBR

### 2. Robot Expressive (Robot Biểu Cảm)
```
https://modelviewer.dev/shared-assets/models/RobotExpressive.glb
```
- Size: ~5MB
- Polygons: ~60K
- Animated: Yes (multiple animations)
- Textures: PBR

### 3. Neil Armstrong
```
https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb
```
- Size: ~3MB
- Polygons: ~40K
- Animated: No
- Textures: PBR

### 4. Damaged Helmet
```
https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb
```
- Size: ~2MB
- Polygons: ~15K
- Animated: No
- Textures: PBR (Metallic)

## Khronos glTF Sample Models

### 5. Avocado (Quả Bơ)
```
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb
```
- Size: ~1MB
- Polygons: ~10K
- Perfect for testing

### 6. Lantern (Đèn Lồng)
```
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb
```
- Size: ~2MB
- Polygons: ~20K
- Good for furniture testing

### 7. Chair (Ghế)
```
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ABeautifulGame/glTF-Binary/ABeautifulGame.glb
```
- Size: ~3MB
- Polygons: ~30K

## Poly Pizza (Low-Poly Models)

### 8. Modern Chair
```
https://poly.pizza/m/8cXqLbQKqnO
```
Download và host trên GitHub Pages

### 9. Coffee Table
```
https://poly.pizza/m/1jQkqLbQKqnO
```
Download và host trên GitHub Pages

### 10. Sofa
```
https://poly.pizza/m/2kXqLbQKqnO
```
Download và host trên GitHub Pages

## Furniture-Specific Models

### 11. Sofa (từ Sketchfab)
```
https://sketchfab.com/3d-models/sofa-free-download
```
Cần download và re-host

### 12. Dining Table
```
https://sketchfab.com/3d-models/dining-table-free
```
Cần download và re-host

## 🎯 Cách Sử Dụng

### Trong AR Demo:

```typescript
const SAMPLE_MODELS = [
  {
    id: '1',
    name: 'Ghế Sofa Hiện Đại',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  },
  {
    id: '2',
    name: 'Bàn Cafe',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb',
  },
];
```

### Trong Product Detail:

```typescript
<ARButton 
  modelUrl="https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
  buttonText="XEM TRONG PHÒNG"
/>
```

## 📥 Download và Host Riêng

### Bước 1: Download

```bash
# Tạo thư mục
mkdir sample-models
cd sample-models

# Download models
curl -o astronaut.glb https://modelviewer.dev/shared-assets/models/Astronaut.glb
curl -o robot.glb https://modelviewer.dev/shared-assets/models/RobotExpressive.glb
curl -o helmet.glb https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb
```

### Bước 2: Host trên GitHub Pages

```bash
# Tạo repo
mkdir furnimart-models
cd furnimart-models
git init

# Copy models
mkdir models
cp ../sample-models/*.glb models/

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>FurniMart 3D Models</title>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <style>
    body { font-family: Arial; padding: 20px; }
    model-viewer { width: 400px; height: 400px; margin: 20px; }
    .model-card { display: inline-block; margin: 20px; }
  </style>
</head>
<body>
  <h1>FurniMart 3D Models Gallery</h1>
  
  <div class="model-card">
    <h3>Astronaut</h3>
    <model-viewer src="models/astronaut.glb" camera-controls auto-rotate></model-viewer>
  </div>
  
  <div class="model-card">
    <h3>Robot</h3>
    <model-viewer src="models/robot.glb" camera-controls auto-rotate></model-viewer>
  </div>
  
  <div class="model-card">
    <h3>Helmet</h3>
    <model-viewer src="models/helmet.glb" camera-controls auto-rotate></model-viewer>
  </div>
</body>
</html>
EOF

# Push to GitHub
git add .
git commit -m "Add 3D models"
git remote add origin https://github.com/YOUR_USERNAME/furnimart-models.git
git push -u origin main
```

### Bước 3: Enable GitHub Pages

1. Vào repo Settings
2. Pages > Source: main branch
3. Save

URL: `https://YOUR_USERNAME.github.io/furnimart-models/models/astronaut.glb`

## 🔍 Tìm Mô Hình Nội Thất Miễn Phí

### Sketchfab
```
https://sketchfab.com/search?features=downloadable&q=furniture&sort_by=-likeCount&type=models
```
Filter: Free Download

### Poly Pizza
```
https://poly.pizza/search?q=furniture
```
All models are free

### TurboSquid Free
```
https://www.turbosquid.com/Search/3D-Models/free/furniture
```
Free section

### CGTrader Free
```
https://www.cgtrader.com/free-3d-models/furniture
```
Free furniture models

### Free3D
```
https://free3d.com/3d-models/furniture
```
Free downloads

## 🛠️ Convert Models

### Từ .obj sang .glb

```bash
# Cài đặt obj2gltf
npm install -g obj2gltf

# Convert
obj2gltf -i model.obj -o model.glb
```

### Từ .fbx sang .glb

```bash
# Sử dụng Blender
blender --background --python convert.py

# convert.py
import bpy
bpy.ops.import_scene.fbx(filepath="model.fbx")
bpy.ops.export_scene.gltf(filepath="model.glb", export_format='GLB')
```

### Online Converters

1. **glTF Viewer** - https://gltf-viewer.donmccurdy.com/
2. **Blackthread** - https://products.aspose.app/3d/conversion/fbx-to-glb
3. **AnyConv** - https://anyconv.com/fbx-to-glb-converter/

## 📊 Model Specifications

### Khuyến Nghị cho Mobile AR:

| Aspect | Recommended | Maximum |
|--------|-------------|---------|
| File Size | < 5MB | < 10MB |
| Polygons | < 50K | < 100K |
| Textures | 1024x1024 | 2048x2048 |
| Materials | 1-3 | 5 |
| Animations | 0-2 | 5 |

## 🎨 Tối Ưu Models

### Giảm Polygons (Blender)

```python
# Blender Python Script
import bpy

# Select object
obj = bpy.context.active_object

# Add Decimate modifier
mod = obj.modifiers.new(name="Decimate", type='DECIMATE')
mod.ratio = 0.5  # Giảm 50% polygons

# Apply modifier
bpy.ops.object.modifier_apply(modifier="Decimate")
```

### Compress Textures

```bash
# Sử dụng ImageMagick
convert input.png -resize 1024x1024 -quality 85 output.jpg
```

### Optimize .glb

```bash
# gltf-pipeline
gltf-pipeline -i input.glb -o output.glb -d

# Options:
# -d : Draco compression
# -t : Separate textures
```

## 💡 Tips

1. **Test nhiều models** - Mỗi model có đặc điểm riêng
2. **Optimize trước khi host** - Giảm loading time
3. **Sử dụng CDN** - Faster delivery
4. **Cache models** - Reduce bandwidth
5. **Fallback images** - Show while loading

## 🔗 Useful Links

- [Model Viewer Examples](https://modelviewer.dev/examples/)
- [glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)
- [Poly Pizza](https://poly.pizza/)
- [Sketchfab](https://sketchfab.com/)
- [glTF Validator](https://github.khronos.org/glTF-Validator/)

---

**Happy Modeling! 🎨**
