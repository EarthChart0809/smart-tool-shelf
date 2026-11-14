import * as THREE from "three";

// 引き出しが開く方向(3D空間上の向き)。モデルの向きに合わせて調整する。
// 下の対応表を参考に、手前に出るよう変更してください。
export const DRAWER_OPEN_DIRECTION = new THREE.Vector3(0, 0, 1);

// 引き出しの奥行きに対して、何割ぶん引き出すか(1.0で奥行きと同じだけ出る)
export const DRAWER_OPEN_RATIO = 0.7;

// 引き出しのノード名。Drawer_1, Drawer_2 ...(番号 = 工具の boxId)
export const DRAWER_NAME_PATTERN = /^drawer[_\s-]?(\d+)$/i;