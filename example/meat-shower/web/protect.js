// Screen rectangles of cards that text must never cover (faces, key props). Used by tools/textlayer.js.
// In main.js:  import { protectRectsFn } from "./protect.js";
//              window.protectRects = protectRectsFn(THREE, camera, cardList, W, H);
// and in updateCards():  m.userData.protect = !!s.protect;
// Then mark actors with { protect: true } in story.js (every person, the hero prop of each shot).
export const protectRectsFn = (THREE, camera, meshes, W, H) => {
  const box = new THREE.Box3(), v = new THREE.Vector3();
  return () => {
    const out = [];
    for (const m of meshes) {
      if (!m.visible || !m.userData.protect || m.userData.top) continue;
      box.setFromObject(m); if (box.isEmpty()) continue;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, front = false;
      for (let i = 0; i < 8; i++) {
        v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
        if (v.z < 1) front = true;
        const px = (v.x * 0.5 + 0.5) * W, py = (1 - (v.y * 0.5 + 0.5)) * H;
        x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py);
      }
      if (!front) continue;
      x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(W, x1); y1 = Math.min(H, y1);
      if (x1 - x0 > 4 && y1 - y0 > 4) out.push([x0, y0, x1 - x0, y1 - y0]);
    }
    return out;
  };
};
