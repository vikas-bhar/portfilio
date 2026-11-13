import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useMediaQuery } from '../hooks/useMediaQuery';
import WireframeGlobe from './WireframeGlobe';

export default function Ambient3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 28;

    // Keep the original scene, with a safe fallback if WebGL is unavailable.
    const canvas = document.createElement('canvas');
    let context: WebGL2RenderingContext | null;
    try {
      context = canvas.getContext('webgl2', { alpha: true, antialias: true });
    } catch {
      return;
    }
    if (!context) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(canvas);
    container.dataset.webgl = 'ready';

    // Group for all floating objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Floating 3D Geometric Polyhedra (Crisp White Wireframes with Depth)
    interface FloatingPolyhedron {
      mesh: THREE.Group;
      rotSpeed: { x: number; y: number; z: number };
      initialY: number;
      initialX: number;
      floatSpeed: number;
      floatAmplitude: number;
      floatOffset: number;
    }

    const polyhedra: FloatingPolyhedron[] = [];

    // Distinct 3D geometries
    const geometries = [
      new THREE.IcosahedronGeometry(2.2, 0),
      new THREE.OctahedronGeometry(2.0, 0),
      new THREE.DodecahedronGeometry(2.1, 0),
      new THREE.TetrahedronGeometry(2.4, 0),
      new THREE.TorusGeometry(2.2, 0.45, 12, 32),
      new THREE.TorusKnotGeometry(1.6, 0.4, 64, 16),
      new THREE.BoxGeometry(2.2, 2.2, 2.2),
      new THREE.IcosahedronGeometry(1.8, 1),
    ];

    // Wireframe Material in bright crisp white
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    // Inner subtle semi-transparent solid core material
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
    });

    // Create 10 floating 3D polyhedra distributed in the background
    for (let i = 0; i < 10; i++) {
      const geom = geometries[i % geometries.length];
      const objGroup = new THREE.Group();

      const wireMesh = new THREE.Mesh(geom, wireframeMat);
      const innerMesh = new THREE.Mesh(geom, innerCoreMat);
      innerMesh.scale.set(0.96, 0.96, 0.96);

      objGroup.add(wireMesh);
      objGroup.add(innerMesh);

      const x = (Math.random() - 0.5) * 55;
      const y = (Math.random() - 0.5) * 65;
      const z = (Math.random() - 0.5) * 25 - 6;

      objGroup.position.set(x, y, z);
      mainGroup.add(objGroup);

      polyhedra.push({
        mesh: objGroup,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.012,
          y: (Math.random() - 0.5) * 0.014,
          z: (Math.random() - 0.5) * 0.01,
        },
        initialX: x,
        initialY: y,
        floatSpeed: 0.8 + Math.random() * 0.9,
        floatAmplitude: 1.8 + Math.random() * 2.2,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }

    // 2. Interactive Constellation Network (Nodes + Dynamic Connecting Lines)
    const nodeCount = 65;
    const nodePositions: THREE.Vector3[] = [];
    const nodeVelocities: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 20 - 4,
      );
      nodePositions.push(pos);
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.025,
          (Math.random() - 0.5) * 0.025,
          (Math.random() - 0.5) * 0.015,
        ),
      );
    }

    // Node Points Geometry & Material
    const nodeGeometry = new THREE.BufferGeometry();
    const nodePosArray = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      nodePosArray[i * 3] = nodePositions[i].x;
      nodePosArray[i * 3 + 1] = nodePositions[i].y;
      nodePosArray[i * 3 + 2] = nodePositions[i].z;
    }
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePosArray, 3));

    const nodeMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const constellationNodes = new THREE.Points(nodeGeometry, nodeMaterial);
    mainGroup.add(constellationNodes);

    // Dynamic Lines connecting nearby nodes
    const maxConnections = 140;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const constellationLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    mainGroup.add(constellationLines);
    constellationLines.frustumCulled = false;

    // 3. Ambient Star Dust Stream
    const dustCount = 120;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 70;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.22,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const dustField = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustField);

    // Mouse Tracking & Parallax Scrolling
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let scrollY = window.scrollY * 0.009;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 4;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 4;
    };

    const handleScroll = () => {
      scrollY = window.scrollY * 0.009;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId = 0;
    const startedAt = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startedAt) / 1000;

      // Smooth mouse damping
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Parallax scene rotation
      mainGroup.rotation.y = currentMouseX * 0.25;
      mainGroup.rotation.x = currentMouseY * 0.2;
      mainGroup.position.y = -scrollY;

      dustField.rotation.y = elapsedTime * 0.02 + currentMouseX * 0.15;
      dustField.rotation.x = elapsedTime * 0.015;
      dustField.position.y = -scrollY * 0.6;

      // Animate floating 3D polyhedra
      polyhedra.forEach((obj) => {
        obj.mesh.rotation.x += obj.rotSpeed.x;
        obj.mesh.rotation.y += obj.rotSpeed.y;
        obj.mesh.rotation.z += obj.rotSpeed.z;

        // Harmonic organic floating movement
        obj.mesh.position.y =
          obj.initialY +
          Math.sin(elapsedTime * obj.floatSpeed + obj.floatOffset) * obj.floatAmplitude;
        obj.mesh.position.x =
          obj.initialX + Math.cos(elapsedTime * (obj.floatSpeed * 0.7) + obj.floatOffset) * 0.8;
      });

      // Animate Constellation Nodes & Connect Nearby Nodes
      const nodePosAttr = nodeGeometry.attributes.position as THREE.BufferAttribute;
      const positions = nodePosAttr.array as Float32Array;

      for (let i = 0; i < nodeCount; i++) {
        const p = nodePositions[i];
        const v = nodeVelocities[i];

        p.x += v.x;
        p.y += v.y;
        p.z += v.z;

        // Bounce within boundaries
        if (p.x < -32 || p.x > 32) v.x *= -1;
        if (p.y < -38 || p.y > 38) v.y *= -1;
        if (p.z < -16 || p.z > 8) v.z *= -1;

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      }
      nodePosAttr.needsUpdate = true;

      // Update lines between nodes
      let lineIndex = 0;
      const connectionDist = 8.5;

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodePositions[i].x - nodePositions[j].x;
          const dy = nodePositions[i].y - nodePositions[j].y;
          const dz = nodePositions[i].z - nodePositions[j].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDist && lineIndex < maxConnections) {
            const alpha = 1 - dist / connectionDist;

            // Line segment start
            linePositions[lineIndex * 6] = nodePositions[i].x;
            linePositions[lineIndex * 6 + 1] = nodePositions[i].y;
            linePositions[lineIndex * 6 + 2] = nodePositions[i].z;
            lineColors[lineIndex * 6] = alpha;
            lineColors[lineIndex * 6 + 1] = alpha;
            lineColors[lineIndex * 6 + 2] = alpha;

            // Line segment end
            linePositions[lineIndex * 6 + 3] = nodePositions[j].x;
            linePositions[lineIndex * 6 + 4] = nodePositions[j].y;
            linePositions[lineIndex * 6 + 5] = nodePositions[j].z;
            lineColors[lineIndex * 6 + 3] = alpha;
            lineColors[lineIndex * 6 + 4] = alpha;
            lineColors[lineIndex * 6 + 5] = alpha;

            lineIndex++;
          }
        }
      }

      // Clear remaining line slots
      for (let k = lineIndex; k < maxConnections; k++) {
        linePositions[k * 6] = 0;
        linePositions[k * 6 + 1] = 0;
        linePositions[k * 6 + 2] = 0;
        linePositions[k * 6 + 3] = 0;
        linePositions[k * 6 + 4] = 0;
        linePositions[k * 6 + 5] = 0;
      }

      (lineGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };

    // These lifecycle safeguards do not change the original animation behavior.
    const updatePlayback = () => {
      cancelAnimationFrame(animationFrameId);
      const playing = !document.hidden && !document.querySelector('dialog[open]');
      container.dataset.playback = playing ? 'running' : 'paused';
      if (playing) animate();
    };
    const updateColor = () => {
      const color = getComputedStyle(container).color;
      wireframeMat.color.set(color);
      innerCoreMat.color.set(color);
      nodeMaterial.color.set(color);
      lineMaterial.color.set(color);
      dustMaterial.color.set(color);
      const light = document.documentElement.dataset.theme === 'light';
      for (const material of [nodeMaterial, lineMaterial, dustMaterial]) {
        material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
        material.needsUpdate = true;
      }
    };
    const themeObserver = new MutationObserver(updateColor);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    document.addEventListener('visibilitychange', updatePlayback);
    document.addEventListener('toggle', updatePlayback, true);
    container.dataset.polyhedra = String(polyhedra.length);
    container.dataset.nodes = String(nodeCount);
    container.dataset.dust = String(dustCount);
    updateColor();
    updatePlayback();

    return () => {
      cancelAnimationFrame(animationFrameId);
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', updatePlayback);
      document.removeEventListener('toggle', updatePlayback, true);
      delete container.dataset.webgl;
      delete container.dataset.playback;
      delete container.dataset.polyhedra;
      delete container.dataset.nodes;
      delete container.dataset.dust;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer.forceContextLoss();
      geometries.forEach((g) => g.dispose());
      wireframeMat.dispose();
      innerCoreMat.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
    };
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="ambient-background" aria-hidden="true">
      <WireframeGlobe />
    </div>
  );
}
