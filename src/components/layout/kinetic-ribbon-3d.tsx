"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function KineticRibbon3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, -0.5, 7.5);

    // 2. WebGL Renderer with High Performance
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Studio Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.8);
    scene.add(ambientLight);

    // Key Light (Bright Specular Top-Right)
    const keyLight = new THREE.DirectionalLight(0xa5b4fc, 3.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Fill Light (Royal Violet Bottom-Left)
    const fillLight = new THREE.DirectionalLight(0x7c3aed, 2.5);
    fillLight.position.set(-6, -4, 3);
    scene.add(fillLight);

    // Rim / Edge Glow Light (Electric Cyan Behind)
    const rimLight = new THREE.PointLight(0x38bdf8, 3.0, 15);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // 4. Create 3D Sculptural Turbine / Satin Ribbon Blades
    const group = new THREE.Group();
    scene.add(group);

    // Satin Ribbon Physical Material
    const ribbonMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x2563eb), // Royal Cobalt Blue
      emissive: new THREE.Color(0x0f172a),
      roughness: 0.28,
      metalness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
      sheen: 1.0,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color(0xc084fc), // Soft Purple Sheen
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    const bladeCount = 32;
    const bladeMeshes: THREE.Mesh[] = [];
    const baseGeometries: Float32Array[] = [];

    // Create curved satin blade petals
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const radius = 2.4;

      // Plane geometry with segments for vertex deformation
      const geometry = new THREE.PlaneGeometry(0.75, 2.6, 16, 24);
      const posAttr = geometry.attributes.position;
      const originalPositions = new Float32Array(posAttr.array.length);
      originalPositions.set(posAttr.array);
      baseGeometries.push(originalPositions);

      const mesh = new THREE.Mesh(geometry, ribbonMaterial);

      // Position blade in a circular turbine arch
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = Math.sin(angle) * (radius * 0.75) - 1.2;
      mesh.position.z = Math.sin(angle * 2) * 0.45;

      // Rotate blade into helical twist
      mesh.rotation.z = angle + Math.PI / 2;
      mesh.rotation.x = 0.6 + Math.sin(angle) * 0.3;
      mesh.rotation.y = angle * 0.5;

      group.add(mesh);
      bladeMeshes.push(mesh);
    }

    // Tilt turbine to match the Dribbble perspective
    group.rotation.x = -0.35;
    group.rotation.y = 0.1;
    group.position.y = -0.6;

    // 5. Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 0.4;
      mouseY = y * 0.3;
    };

    window.addEventListener("mousemove", onMouseMove);

    // 6. Responsive Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", onResize);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation (Damping)
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Group kinetic rotation
      group.rotation.z = elapsedTime * 0.08 + targetX;
      group.rotation.x = -0.35 + targetY * 0.4 + Math.sin(elapsedTime * 0.4) * 0.04;
      group.rotation.y = 0.1 + targetX * 0.5 + Math.cos(elapsedTime * 0.3) * 0.03;

      // Undulate and morph individual satin ribbon blades
      for (let i = 0; i < bladeCount; i++) {
        const mesh = bladeMeshes[i];
        const geometry = mesh.geometry as THREE.PlaneGeometry;
        const posAttr = geometry.attributes.position;
        const orig = baseGeometries[i];

        const phase = i * 0.25 + elapsedTime * 1.5;

        for (let j = 0; j < posAttr.count; j++) {
          const u = orig[j * 3 + 1]; // Y-coord along ribbon
          const wave = Math.sin(phase + u * 2.2) * 0.18;
          const twist = Math.cos(phase * 0.8 + u * 1.5) * 0.12;

          posAttr.setZ(j, orig[j * 3 + 2] + wave);
          posAttr.setX(j, orig[j * 3] + twist);
        }

        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose Geometries & Material
      bladeMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
      });
      ribbonMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none"
    />
  );
}
