import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface ARViewerProps {
    modelUrl: string;
    onClose: () => void;
}

const ARViewer: React.FC<ARViewerProps> = ({ modelUrl, onClose }) => {
    const webViewRef = useRef<WebView>(null);

    // HTML content cho WebAR sử dụng model-viewer
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>AR Viewer</title>
  
  <!-- Import model-viewer -->
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      background: #000;
    }
    
    model-viewer {
      width: 100vw;
      height: 100vh;
      background-color: transparent;
    }
    
    .controls {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
      z-index: 1000;
    }
    
    .control-btn {
      background: rgba(255, 255, 255, 0.95);
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    }
    
    .control-btn:active {
      transform: scale(0.95);
      background: rgba(255, 255, 255, 0.8);
    }
    
    .ar-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: bold;
      font-size: 14px;
      padding: 0 20px;
      border-radius: 30px;
      width: auto;
    }
    
    .info {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 12px 24px;
      border-radius: 20px;
      font-size: 14px;
      z-index: 1000;
      text-align: center;
    }
    
    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 18px;
      z-index: 999;
    }
    
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="info" id="info">
    👆 Chạm và kéo để xoay • 🤏 Pinch để phóng to/thu nhỏ
  </div>
  
  <div class="loading" id="loading">
    <div class="spinner"></div>
    Đang tải mô hình 3D...
  </div>
  
  <model-viewer
    id="modelViewer"
    src="${modelUrl}"
    ar
    ar-modes="webxr scene-viewer quick-look"
    camera-controls
    touch-action="pan-y"
    shadow-intensity="1"
    exposure="1"
    auto-rotate
    auto-rotate-delay="3000"
    rotation-per-second="30deg"
    min-camera-orbit="auto auto 5%"
    max-camera-orbit="auto auto 100%"
    min-field-of-view="10deg"
    max-field-of-view="90deg"
    interpolation-decay="200"
  >
    <button slot="ar-button" class="control-btn ar-btn">
      📱 Xem AR
    </button>
  </model-viewer>
  
  <div class="controls">
    <button class="control-btn" onclick="resetView()">🔄</button>
    <button class="control-btn" onclick="toggleRotation()">⏸️</button>
  </div>
  
  <script>
    const modelViewer = document.getElementById('modelViewer');
    const loading = document.getElementById('loading');
    const info = document.getElementById('info');
    let isRotating = true;
    
    // Hide loading when model is loaded
    modelViewer.addEventListener('load', () => {
      loading.style.display = 'none';
      console.log('Model loaded successfully');
    });
    
    // Handle loading errors
    modelViewer.addEventListener('error', (event) => {
      loading.innerHTML = '<div class="spinner"></div>Lỗi tải mô hình. Vui lòng thử lại.';
      console.error('Error loading model:', event);
    });
    
    // Reset camera view
    function resetView() {
      modelViewer.resetTurntableRotation();
      modelViewer.cameraOrbit = 'auto auto auto';
      modelViewer.fieldOfView = '45deg';
      showToast('🔄 Đã đặt lại góc nhìn');
    }
    
    // Toggle auto-rotation
    function toggleRotation() {
      const btn = event.target;
      if (isRotating) {
        modelViewer.autoRotate = false;
        btn.textContent = '▶️';
        isRotating = false;
        showToast('⏸️ Đã tắt xoay tự động');
      } else {
        modelViewer.autoRotate = true;
        btn.textContent = '⏸️';
        isRotating = true;
        showToast('▶️ Đã bật xoay tự động');
      }
    }
    
    // Show toast message
    function showToast(message) {
      info.textContent = message;
      setTimeout(() => {
        info.textContent = '👆 Chạm và kéo để xoay • 🤏 Pinch để phóng to/thu nhỏ';
      }, 2000);
    }
    
    // Handle AR mode
    modelViewer.addEventListener('ar-status', (event) => {
      if (event.detail.status === 'session-started') {
        console.log('AR session started');
      } else if (event.detail.status === 'not-presenting') {
        console.log('AR session ended');
      }
    });
    
    // Prevent default touch behaviors for better AR experience
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
  </script>
</body>
</html>
  `;

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: htmlContent }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                allowsFullscreenVideo={true}
                originWhitelist={['*']}
                mixedContentMode="always"
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('HTTP error: ', nativeEvent);
                }}
            />

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default ARViewer;
