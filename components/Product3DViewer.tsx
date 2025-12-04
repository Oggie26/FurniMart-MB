import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { Asset } from "expo-asset";
import GLTFLoader from "three-gltf-loader"; 
interface Props {
  modelUrl: string;
}

export default function Product3DViewer({ modelUrl }: Props) {
  const modelRef = useRef<THREE.Object3D | null>(null);

  const onContextCreate = async (gl: any) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0xf9fafb, 1);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // ✅ Load model bằng three-gltf-loader
    try {
      const asset = Asset.fromURI(modelUrl);
      await asset.downloadAsync();

      const loader = new GLTFLoader();
      loader.load(
        asset.localUri || asset.uri,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(1.2, 1.2, 1.2);
          scene.add(model);
          modelRef.current = model;
        },
        undefined,
        (error) => console.error("Lỗi load model:", error)
      );
    } catch (err) {
      console.error("Không thể load mô hình:", err);
    }

    camera.position.z = 3;

    const animate = () => {
      requestAnimationFrame(animate);
      if (modelRef.current) modelRef.current.rotation.y += 0.01;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  return (
    <View style={styles.container}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
});
