"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls } from "@react-three/drei";
import ShelfModel from "./ShelfModel";

interface Props {
  drawerStates?: Record<number, boolean>;
  highlightIds?: number[];
}

export default function ShelfCanvas({ drawerStates, highlightIds }: Props) {
  return (
    <Canvas camera={{ position: [2, 1.5, 3], fov: 40 }} dpr={[1, 2]}>
      <hemisphereLight intensity={0.8} groundColor="#888888" />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.5}>
          <ShelfModel drawerStates={drawerStates} highlightIds={highlightIds} />
        </Bounds>
      </Suspense>

      <OrbitControls makeDefault enablePan={false} />
    </Canvas>
  );
}
