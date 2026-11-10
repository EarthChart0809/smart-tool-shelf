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
}

interface Props {
  // キー: 引き出し番号(= 工具の boxId)、値: true なら開いている
  drawerStates?: Record<number, boolean>;
}

export default function ShelfModel({ drawerStates = {} }: Props) {
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

      drawers.set(id, {
        object,
        closedWorld: object.getWorldPosition(new THREE.Vector3()),
        travel: depth * DRAWER_OPEN_RATIO,
        progress: 0,
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
    });
  });

  return <primitive object={model} />;
}

useGLTF.preload(SHELF_MODEL_PATH);