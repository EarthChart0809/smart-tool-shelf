"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  DRAWER_NAME_PATTERN,
  DRAWER_OPEN_DIRECTION,
  DRAWER_OPEN_RATIO,
} from "@/lib/shelf-config";

export const SHELF_MODEL_PATH = "/models/tool-shelf.glb";

interface DrawerInfo {
  object: THREE.Object3D;
  closedWorld: THREE.Vector3; // 閉じているときのワールド座標
  travel: number; // 全開時の移動距離
  progress: number; // 0=閉、1=開(アニメーション用)
  materials: THREE.MeshStandardMaterial[]; // 強調表示で色を変える材質(この引き出し専用の複製)
  glow: number; // 0=通常、1=強調(アニメーション用)
}

// 強調表示の色(抱月レッド)
const HIGHLIGHT_COLOR = new THREE.Color("#e60012");

interface Props {
  // キー: 引き出し番号(= 工具の boxId)、値: true なら開いている
  drawerStates?: Record<number, boolean>;
  // 赤く強調する引き出しの番号(取り出す引き出し・要確認の引き出しなど)
  highlightIds?: number[];
}

export default function ShelfModel({
  drawerStates = {},
  highlightIds = [],
}: Props) {
  const { scene } = useGLTF(SHELF_MODEL_PATH);

  // 同じモデルを複数箇所で使っても干渉しないよう、複製して使う
  const model = useMemo(() => scene.clone(true), [scene]);

  const drawersRef = useRef<Map<number, DrawerInfo>>(new Map());

  useEffect(() => {
    model.updateMatrixWorld(true);

    const dir = DRAWER_OPEN_DIRECTION.clone().normalize();
    const drawers = new Map<number, DrawerInfo>();
    const names: string[] = [];

    model.traverse((object) => {
      if (object.name) names.push(object.name);

      const match = object.name.match(DRAWER_NAME_PATTERN);
      if (!match) return;

      const id = Number(match[1]);

      // 開く方向に沿った、引き出しの奥行きを測る
      const size = new THREE.Box3()
        .setFromObject(object)
        .getSize(new THREE.Vector3());

      const depth =
        Math.abs(dir.x) * size.x +
        Math.abs(dir.y) * size.y +
        Math.abs(dir.z) * size.z;

      // 材質はモデル全体で共有されているので、この引き出しの分だけ複製してから色を変える
      const materials: THREE.MeshStandardMaterial[] = [];
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const list = Array.isArray(child.material)
          ? child.material.map((m) => m.clone())
          : [child.material.clone()];
        child.material = Array.isArray(child.material) ? list : list[0];
        for (const m of list) {
          if (m instanceof THREE.MeshStandardMaterial) materials.push(m);
        }
      });

      drawers.set(id, {
        object,
        closedWorld: object.getWorldPosition(new THREE.Vector3()),
        travel: depth * DRAWER_OPEN_RATIO,
        progress: 0,
        materials,
        glow: 0,
      });
    });

    drawersRef.current = drawers;

    console.log("[ShelfModel] ノード名:", names.join(", "));
    console.log(
      "[ShelfModel] 認識した引き出し(番号):",
      Array.from(drawers.keys()).join(", ") || "なし",
    );

    if (drawers.size === 0) {
      console.warn(
        "[ShelfModel] Drawer_1 のような名前のノードが見つかりません。Blenderでの命名を確認してください。",
      );
    }
  }, [model]);

  useFrame((_, delta) => {
    const dir = DRAWER_OPEN_DIRECTION.clone().normalize();

    drawersRef.current.forEach((drawer, id) => {
      const target = drawerStates[id] ? 1 : 0;

      // 目標値に向かって滑らかに近づける(開閉アニメーション)
      drawer.progress = THREE.MathUtils.damp(drawer.progress, target, 8, delta);

      const worldTarget = drawer.closedWorld
        .clone()
        .addScaledVector(dir, drawer.travel * drawer.progress);

      // ワールド座標 → 親から見たローカル座標に変換して反映
      const parent = drawer.object.parent;
      drawer.object.position.copy(
        parent ? parent.worldToLocal(worldTarget) : worldTarget,
      );

      // 強調表示: 赤くふわっと光らせる
      const glowTarget = highlightIds.includes(id) ? 1 : 0;
      drawer.glow = THREE.MathUtils.damp(drawer.glow, glowTarget, 6, delta);
      for (const m of drawer.materials) {
        m.emissive.copy(HIGHLIGHT_COLOR);
        m.emissiveIntensity = drawer.glow * 0.55;
      }
    });
  });

  return <primitive object={model} />;
}

useGLTF.preload(SHELF_MODEL_PATH);
