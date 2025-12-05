import React from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

interface Model3DViewerProps {
    modelUrl: string;
    previewImage?: string;
}

const Model3DViewer: React.FC<Model3DViewerProps> = ({ modelUrl, previewImage }) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>3D Model Viewer</title>
      <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        model-viewer {
          width: 100%;
          height: 100%;
          --poster-color: transparent;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #3b7a57;
          font-family: Arial, sans-serif;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <model-viewer
        src="${modelUrl}"
        ${previewImage ? `poster="${previewImage}"` : ''}
        alt="3D Model"
        auto-rotate
        camera-controls
        touch-action="pan-y"
        disable-zoom
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        exposure="1"
        camera-orbit="45deg 75deg 2.5m"
        min-camera-orbit="auto auto 1m"
        max-camera-orbit="auto auto 10m"
      >
        <div class="loading" slot="poster">Đang tải mô hình 3D...</div>
      </model-viewer>
    </body>
    </html>
  `;

    return (
        <View style={styles.container}>
            <WebView
                source={{ html }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b7a57" />
                    </View>
                )}
                originWhitelist={['*']}
                allowFileAccess={true}
                allowUniversalAccessFromFileURLs={true}
                mixedContentMode="always"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width - 40,
        height: 400,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f5f7fa',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
});

export default Model3DViewer;
