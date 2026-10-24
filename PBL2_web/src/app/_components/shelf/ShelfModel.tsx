"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";

export const SHELF_MODEL_PATH = "/models/tool-shelf.glb";

export default function ShelfModel() {
  const { scene } = useGLTF(SHELF_MODEL_PATH);

  // 同じモデルを複数箇所で使っても干渉しないよう、複製して使う
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    // Blenderでの命名が意図通りか確認するためのログ(手順4で名前を使って引き出しを動かす)
    const names: string[] = [];
    model.traverse((object) => {
      if (object.name) names.push(object.name);
    });
    console.log("[ShelfModel] ノード名一覧:", names);
  }, [model]);

  return <primitive object={model} />;
}

useGLTF.preload(SHELF_MODEL_PATH);