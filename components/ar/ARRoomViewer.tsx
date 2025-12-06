// import { Ionicons } from '@expo/vector-icons';
// import React, { useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { WebView } from 'react-native-webview';

// interface Product {
//   id: string;
//   name: string;
//   modelUrl: string;
//   thumbnailImage: string;
//   price?: number;
// }

// interface ARRoomViewerProps {
//   products: Product[];
//   onClose: () => void;
// }

// export default function ARRoomViewer({ products, onClose }: ARRoomViewerProps) {
//   const webViewRef = useRef<WebView>(null);
//   const [loading, setLoading] = useState(true);
//   const [showProductList, setShowProductList] = useState(true);

//   const handleAddProduct = (product: Product) => {
//     // Send message to WebView to add product
//     const message = JSON.stringify({
//       type: 'ADD_PRODUCT',
//       data: {
//         id: product.id,
//         name: product.name,
//         modelUrl: product.modelUrl,
//       },
//     });

//     webViewRef.current?.postMessage(message);

//     // Hide product list after selection (optional)
//     // setShowProductList(false);
//   };

//   const handleClearAll = () => {
//     webViewRef.current?.postMessage(JSON.stringify({ type: 'CLEAR_ALL' }));
//   };

//   const htmlContent = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
//   <title>AR Room</title>
//   <style>
//     * {
//       margin: 0;
//       padding: 0;
//       box-sizing: border-box;
//     }

//     body {
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//       overflow: hidden;
//       background: #000;
//     }

//     #ar-container {
//       width: 100vw;
//       height: 100vh;
//       position: relative;
//     }

//     #instructions {
//       position: absolute;
//       top: 20px;
//       left: 50%;
//       transform: translateX(-50%);
//       background: rgba(0, 0, 0, 0.8);
//       color: white;
//       padding: 12px 20px;
//       border-radius: 20px;
//       font-size: 14px;
//       z-index: 100;
//       text-align: center;
//       backdrop-filter: blur(10px);
//     }

//     #controls {
//       position: absolute;
//       bottom: 20px;
//       left: 50%;
//       transform: translateX(-50%);
//       display: flex;
//       gap: 10px;
//       z-index: 100;
//     }

//     .control-btn {
//       background: rgba(255, 255, 255, 0.9);
//       border: none;
//       padding: 12px 20px;
//       border-radius: 25px;
//       font-size: 14px;
//       font-weight: 600;
//       cursor: pointer;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//       display: flex;
//       align-items: center;
//       gap: 8px;
//     }

//     .control-btn:active {
//       transform: scale(0.95);
//     }

//     #model-count {
//       position: absolute;
//       top: 80px;
//       right: 20px;
//       background: rgba(47, 133, 90, 0.9);
//       color: white;
//       padding: 8px 16px;
//       border-radius: 15px;
//       font-size: 13px;
//       font-weight: bold;
//       z-index: 100;
//     }

//     .loading {
//       position: absolute;
//       top: 50%;
//       left: 50%;
//       transform: translate(-50%, -50%);
//       color: white;
//       font-size: 16px;
//       z-index: 1000;
//     }
//   </style>
// </head>
// <body>
//   <div id="ar-container"></div>
//   <div id="instructions">Nhấn vào màn hình để đặt sản phẩm</div>
//   <div id="model-count">Sản phẩm: 0</div>
//   <div id="controls">
//     <button class="control-btn" onclick="clearAllModels()">
//       🗑️ Xóa tất cả
//     </button>
//   </div>
//   <div class="loading" id="loading">Đang khởi động AR...</div>

//   <script type="module">
//     import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
//     import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

//     let scene, camera, renderer, reticle, hitTestSource, hitTestSourceRequested = false;
//     let placedModels = [];
//     let currentModelUrl = null;
//     let loader = new GLTFLoader();

//     // Initialize Three.js scene
//     function init() {
//       const container = document.getElementById('ar-container');

//       scene = new THREE.Scene();

//       camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

//       const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
//       light.position.set(0.5, 1, 0.25);
//       scene.add(light);

//       const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
//       directionalLight.position.set(0, 5, 5);
//       scene.add(directionalLight);

//       renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//       renderer.setPixelRatio(window.devicePixelRatio);
//       renderer.setSize(window.innerWidth, window.innerHeight);
//       renderer.xr.enabled = true;
//       container.appendChild(renderer.domElement);

//       // Reticle (placement indicator)
//       const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
//       const material = new THREE.MeshBasicMaterial({ color: 0x2f855a });
//       reticle = new THREE.Mesh(geometry, material);
//       reticle.matrixAutoUpdate = false;
//       reticle.visible = false;
//       scene.add(reticle);

//       // Start AR session
//       startAR();

//       window.addEventListener('resize', onWindowResize);
//     }

//     async function startAR() {
//       try {
//         const session = await navigator.xr.requestSession('immersive-ar', {
//           requiredFeatures: ['hit-test'],
//           optionalFeatures: ['dom-overlay'],
//           domOverlay: { root: document.body }
//         });

//         renderer.xr.setReferenceSpaceType('local');
//         await renderer.xr.setSession(session);

//         session.addEventListener('select', onSelect);

//         document.getElementById('loading').style.display = 'none';

//         renderer.setAnimationLoop(render);
//       } catch (error) {
//         console.error('AR not supported:', error);
//         document.getElementById('loading').textContent = 'AR không được hỗ trợ trên thiết bị này';
//       }
//     }

//     function onSelect() {
//       if (!currentModelUrl) {
//         document.getElementById('instructions').textContent = 'Vui lòng chọn sản phẩm từ danh sách';
//         return;
//       }

//       if (reticle.visible) {
//         placeModel(currentModelUrl, reticle.matrix);
//       }
//     }

//     function placeModel(modelUrl, matrix) {
//       loader.load(
//         modelUrl,
//         (gltf) => {
//           const model = gltf.scene;
//           model.scale.set(0.5, 0.5, 0.5);
//           model.applyMatrix4(matrix);
//           scene.add(model);
//           placedModels.push(model);
//           updateModelCount();

//           document.getElementById('instructions').textContent = 
//             'Sản phẩm đã được đặt! Chọn sản phẩm khác hoặc nhấn để đặt tiếp';
//         },
//         undefined,
//         (error) => {
//           console.error('Error loading model:', error);
//           document.getElementById('instructions').textContent = 'Lỗi khi tải mô hình';
//         }
//       );
//     }

//     function clearAllModels() {
//       placedModels.forEach(model => {
//         scene.remove(model);
//       });
//       placedModels = [];
//       updateModelCount();
//       document.getElementById('instructions').textContent = 'Đã xóa tất cả. Chọn sản phẩm để đặt mới';
//     }

//     function updateModelCount() {
//       document.getElementById('model-count').textContent = 
//         \`Sản phẩm: \${placedModels.length}\`;
//     }

//     function render(timestamp, frame) {
//       if (frame) {
//         const referenceSpace = renderer.xr.getReferenceSpace();
//         const session = renderer.xr.getSession();

//         if (hitTestSourceRequested === false) {
//           session.requestReferenceSpace('viewer').then((referenceSpace) => {
//             session.requestHitTestSource({ space: referenceSpace }).then((source) => {
//               hitTestSource = source;
//             });
//           });

//           session.addEventListener('end', () => {
//             hitTestSourceRequested = false;
//             hitTestSource = null;
//           });

//           hitTestSourceRequested = true;
//         }

//         if (hitTestSource) {
//           const hitTestResults = frame.getHitTestResults(hitTestSource);

//           if (hitTestResults.length) {
//             const hit = hitTestResults[0];
//             reticle.visible = true;
//             reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
//           } else {
//             reticle.visible = false;
//           }
//         }
//       }

//       renderer.render(scene, camera);
//     }

//     function onWindowResize() {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     }

//     // Listen for messages from React Native
//     window.addEventListener('message', (event) => {
//       try {
//         const message = JSON.parse(event.data);

//         if (message.type === 'ADD_PRODUCT') {
//           currentModelUrl = message.data.modelUrl;
//           document.getElementById('instructions').textContent = 
//             \`Đã chọn: \${message.data.name}. Nhấn vào màn hình để đặt\`;
//         } else if (message.type === 'CLEAR_ALL') {
//           clearAllModels();
//         }
//       } catch (error) {
//         console.error('Error parsing message:', error);
//       }
//     });

//     // Make functions global
//     window.clearAllModels = clearAllModels;

//     // Initialize
//     init();
//   </script>
// </body>
// </html>
//   `;

//   const renderProductItem = ({ item }: { item: Product }) => (
//     <TouchableOpacity
//       style={styles.productCard}
//       onPress={() => handleAddProduct(item)}
//     >
//       <Image
//         source={{ uri: item.thumbnailImage }}
//         style={styles.productImage}
//         resizeMode="cover"
//       />
//       <View style={styles.productInfo}>
//         <Text style={styles.productName} numberOfLines={2}>
//           {item.name}
//         </Text>
//         {item.price && (
//           <Text style={styles.productPrice}>
//             {item.price.toLocaleString()} ₫
//           </Text>
//         )}
//       </View>
//       <View style={styles.addButton}>
//         <Ionicons name="add-circle" size={32} color="#2f855a" />
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Close Button */}
//       <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//         <Ionicons name="close" size={28} color="#fff" />
//       </TouchableOpacity>

//       {/* WebView */}
//       <WebView
//         ref={webViewRef}
//         source={{ html: htmlContent }}
//         style={styles.webview}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         allowsInlineMediaPlayback={true}
//         mediaPlaybackRequiresUserAction={false}
//         originWhitelist={['*']}
//         mediaCapturePermissionGrantType="grant" // Crucial for Android Camera
//         androidLayerType="hardware"
//         mixedContentMode="always"
//         onLoadEnd={() => setLoading(false)}
//         onError={(syntheticEvent) => {
//           const { nativeEvent } = syntheticEvent;
//           console.warn('WebView error: ', nativeEvent);
//         }}
//       />

//       {/* Loading Indicator */}
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#2f855a" />
//           <Text style={styles.loadingText}>Đang tải AR Room...</Text>
//         </View>
//       )}

//       {/* Product List Toggle Button */}
//       <TouchableOpacity
//         style={styles.toggleButton}
//         onPress={() => setShowProductList(!showProductList)}
//       >
//         <Ionicons
//           name={showProductList ? 'chevron-down' : 'chevron-up'}
//           size={24}
//           color="#fff"
//         />
//         <Text style={styles.toggleButtonText}>
//           {showProductList ? 'Ẩn' : 'Hiện'} danh sách
//         </Text>
//       </TouchableOpacity>

//       {/* Product List */}
//       {showProductList && (
//         <View style={styles.productListContainer}>
//           <View style={styles.productListHeader}>
//             <Text style={styles.productListTitle}>Chọn sản phẩm để đặt</Text>
//             <TouchableOpacity onPress={handleClearAll}>
//               <Ionicons name="trash-outline" size={24} color="#e74c3c" />
//             </TouchableOpacity>
//           </View>
//           <FlatList
//             data={products}
//             renderItem={renderProductItem}
//             keyExtractor={(item) => item.id}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.productList}
//           />
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   webview: {
//     flex: 1,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 999,
//   },
//   loadingText: {
//     color: '#fff',
//     marginTop: 12,
//     fontSize: 16,
//   },
//   toggleButton: {
//     position: 'absolute',
//     bottom: 220,
//     right: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(47, 133, 90, 0.9)',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     gap: 8,
//     zIndex: 100,
//   },
//   toggleButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   productListContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 16,
//     paddingBottom: 30,
//     zIndex: 100,
//   },
//   productListHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     marginBottom: 12,
//   },
//   productListTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#212529',
//   },
//   productList: {
//     paddingHorizontal: 16,
//   },
//   productCard: {
//     width: 140,
//     marginRight: 12,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#e9ecef',
//   },
//   productImage: {
//     width: '100%',
//     height: 100,
//     backgroundColor: '#f0f0f0',
//   },
//   productInfo: {
//     padding: 8,
//   },
//   productName: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#212529',
//     marginBottom: 4,
//   },
//   productPrice: {
//     fontSize: 12,
//     color: '#2f855a',
//     fontWeight: 'bold',
//   },
//   addButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 16,
//   },
// });
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface Product {
  id: string;
  name: string;
  modelUrl: string;
  thumbnailImage: string;
  price?: number;
}

interface ARRoomViewerProps {
  products: Product[];
  onClose: () => void;
}

export default function ARRoomViewer({ products, onClose }: ARRoomViewerProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [showProductList, setShowProductList] = useState(true);

  // HTML Content sử dụng model-viewer
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>AR View</title>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: sans-serif; background: #fff; height: 100vh; overflow: hidden; }
    model-viewer { width: 100%; height: 100%; }
    #placeholder {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center; color: #666;
    }
    /* Nút AR tùy chỉnh */
    .ar-button {
      background-color: #2f855a;
      border-radius: 20px; border: none;
      position: absolute; bottom: 20px; right: 20px;
      color: white; padding: 10px 20px;
      font-weight: bold; font-size: 14px;
      display: none; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div id="placeholder">
    <h3>Chọn sản phẩm bên dưới</h3>
  </div>

  <model-viewer
    id="viewer"
    src=""
    ios-src=""
    alt="3D Model"
    shadow-intensity="1"
    camera-controls
    auto-rotate
    ar
    ar-modes="scene-viewer quick-look"
    style="display: none;"
  >
    <button slot="ar-button" class="ar-button" id="ar-btn">
      📷 Xem AR
    </button>
  </model-viewer>

  <script>
    const viewer = document.getElementById('viewer');
    const placeholder = document.getElementById('placeholder');
    const arBtn = document.getElementById('ar-btn');

    window.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'ADD_PRODUCT') {
          viewer.style.display = 'block';
          placeholder.style.display = 'none';
          
          // Gán link GLB cho Android/Web
          viewer.src = message.data.modelUrl;
          
          // MẸO QUAN TRỌNG CHO IOS:
          // iOS QuickLook cần file .usdz. Nếu bạn chỉ có .glb, model-viewer sẽ cố hiển thị 3D.
          // Nếu bạn có link file .usdz thì gán vào đây: viewer.iosSrc = 'link_file.usdz';
          
          viewer.dismissPoster();
        } 
      } catch (e) {}
    });

    viewer.addEventListener('load', () => { arBtn.style.display = 'block'; });
  </script>
</body>
</html>
  `;

  const handleAddProduct = (product: Product) => {
    const message = JSON.stringify({
      type: 'ADD_PRODUCT',
      data: { id: product.id, modelUrl: product.modelUrl },
    });
    webViewRef.current?.postMessage(message);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleAddProduct(item)}>
      <Image source={{ uri: item.thumbnailImage }} style={styles.productImage} resizeMode="cover" />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2f855a" />
        </View>
      )}

      {/* List sản phẩm */}
      <View style={styles.productListContainer}>
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1 },
  closeButton: {
    position: 'absolute', top: 50, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', zIndex: 10
  },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'
  },
  productListContainer: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20
  },
  productList: { paddingHorizontal: 16 },
  productCard: {
    width: 100, marginRight: 12, backgroundColor: '#fff',
    borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee'
  },
  productImage: { width: '100%', height: 70 },
  productInfo: { padding: 4 },
  productName: { fontSize: 11, color: '#333' }
});