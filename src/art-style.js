// Shared art vocabulary: rounded silhouettes, readable construction and upper-left light.
// Every painter works in integer source pixels. It never resizes a sprite or changes its anchor.
export const INK = '#38493D',
  CREAM = '#FFF7E4',
  WOOD = '#B88D60',
  WOOD_D = '#775B46',
  WOOD_L = '#D9B783';
export function R(c, x, y, w, h, col) {
  if (w <= 0 || h <= 0) return;
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}
export function tint(hex, n) {
  const v = parseInt(hex.slice(1), 16),
    to = n < 0 ? 0 : 255,
    k = Math.abs(n);
  return (
    '#' +
    [v >> 16, (v >> 8) & 255, v & 255]
      .map((a) =>
        Math.round(a + (to - a) * k)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
export function oval(c, x, y, rx, ry, col) {
  for (let yy = -Math.floor(ry); yy <= ry; yy++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (yy * yy) / (ry * ry))));
    if (half) R(c, x - half, y + yy, half * 2 + 1, 1, col);
  }
}
export function poly(c, points, col) {
  for (
    let y = Math.ceil(Math.min(...points.map((p) => p[1])));
    y < Math.max(...points.map((p) => p[1]));
    y++
  ) {
    const xs = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y))
        xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2)
      R(c, Math.ceil(xs[i]), y, Math.floor(xs[i + 1]) - Math.ceil(xs[i]) + 1, 1, col);
  }
}
export function line(c, x0, y0, x1, y1, col, w = 1) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) R(c, x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, w, w, col);
}
export function box(c, x, y, w, h, col, round = 1) {
  const d = tint(col, -0.28),
    l = tint(col, 0.25);
  R(c, x + round, y, w - round * 2, h, d);
  R(c, x, y + round, w, h - round * 2, d);
  R(c, x + 1, y + 1, w - 2, h - 2, col);
  if (w >= 7 && h >= 6) {
    // Three actual planes within the original bounding box: top, front, right side.
    poly(
      c,
      [
        [x + 1, y + 2],
        [x + 3, y],
        [x + w - 2, y],
        [x + w - 4, y + 2],
      ],
      l,
    );
    poly(
      c,
      [
        [x + w - 3, y + 3],
        [x + w - 1, y + 1],
        [x + w - 1, y + h - 3],
        [x + w - 3, y + h - 1],
      ],
      d,
    );
    R(c, x + 1, y + 3, 1, h - 5, tint(col, 0.15));
    R(c, x + 2, y + h - 2, w - 5, 1, tint(col, -0.13));
  } else {
    R(c, x + 1, y + 1, w - 2, 1, l);
    R(c, x + w - 2, y + 2, 1, h - 3, d);
  }
}
export function plank(c, x, y, w, h, col = WOOD) {
  box(c, x, y, w, h, col);
  if (w > 9) {
    R(c, x + 3, y + Math.max(2, Math.floor(h / 2)), Math.min(5, w - 5), 1, tint(col, -0.12));
    if (h > 7) R(c, x + w - 5, y + h - 3, 2, 1, tint(col, 0.15));
  }
}
export function leaf(c, x, y, rx, ry, col = '#6F925B') {
  oval(c, x, y, rx, ry, tint(col, -0.24));
  oval(c, x - 1, y - 1, Math.max(1, rx - 1), Math.max(1, ry - 1), col);
  R(c, x - rx + 2, y - ry + 2, Math.max(1, rx - 1), 1, tint(col, 0.27));
}
export function flower(c, x, y, col) {
  R(c, x - 1, y - 2, 3, 5, col);
  R(c, x - 2, y - 1, 5, 3, col);
  R(c, x, y, 1, 1, CREAM);
  R(c, x + 1, y + 1, 1, 1, tint(col, -0.16));
}
export function roof(c, x, y, w, h, col) {
  poly(
    c,
    [
      [x, y + h],
      [x + w * 0.36, y],
      [x + w * 0.73, y + 1],
      [x + w, y + h],
    ],
    tint(col, -0.3),
  );
  poly(
    c,
    [
      [x + 1, y + h - 1],
      [x + w * 0.36, y + 1],
      [x + w * 0.72, y + 2],
      [x + w - 2, y + h - 1],
    ],
    col,
  );
  for (let yy = y + 4; yy < y + h - 1; yy += 3) {
    const t = (yy - y) / h,
      left = x + w * 0.36 * (1 - t),
      right = x + w * 0.72 + w * 0.28 * t;
    R(c, left, yy, right - left, 1, tint(col, -0.16));
    for (let xx = Math.ceil(left) + 3 + (Math.floor((yy - y) / 3) % 2) * 3; xx < right - 1; xx += 6)
      R(c, xx, yy - 2, 1, 2, tint(col, 0.13));
  }
  R(c, x + 1, y + h - 1, w - 2, 2, tint(col, -0.32));
  R(c, x + w * 0.36, y, w * 0.37, 1, tint(col, 0.3));
}
export function windowPane(c, x, y, w, h, night = false) {
  box(c, x, y, w, h, WOOD_D);
  R(c, x + 1, y + 1, w - 2, h - 2, night ? '#F2D39A' : '#79AAA4');
  R(c, x + 2, y + 2, Math.max(1, w - 5), Math.max(1, h - 5), night ? '#FFF0BC' : '#B7D4BD');
  R(c, x + Math.floor(w / 2), y + 1, 1, h - 2, CREAM);
  if (h > 6) R(c, x + 1, y + Math.floor(h / 2), w - 2, 1, CREAM);
  R(c, x - 1, y + h, w + 2, 1, WOOD_L);
}
export function paintTree(
  c,
  w,
  h,
  { kind = 'oak', season = 'spring', fruit = false, fruitColor } = {},
) {
  const X = (x) => Math.round((x * w) / 40),
    Y = (y) => Math.round((y * h) / 52),
    r = (x, y, ww, hh, col) =>
      R(c, X(x), Y(y), Math.max(1, X(x + ww) - X(x)), Math.max(1, Y(y + hh) - Y(y)), col);
  const winter = season === 'winter',
    autumn = season === 'autumn',
    birch = kind === 'birch';
  const base =
      kind === 'cherry' && season === 'spring'
        ? '#E4B4A3'
        : autumn
          ? '#C98A44'
          : winter
            ? '#97AEA0'
            : kind === 'willow'
              ? '#8FAB72'
              : kind === 'birch'
                ? '#9DBA74'
                : '#6F925B',
    dark =
      kind === 'cherry' && season === 'spring'
        ? '#A96E75'
        : autumn
          ? '#9A5E30'
          : winter
            ? '#6F8D80'
            : '#3F604A',
    light = winter
      ? '#F2F6F6'
      : kind === 'cherry' && season === 'spring'
        ? '#F3D6C4'
        : autumn
          ? '#E3B266'
          : '#9DBA74';
  const bark = birch ? '#E9E4D8' : WOOD_D;
  for (const [x, y, ww, hh] of [
    [16, 27, 4, 8],
    [13, 25, 3, 6],
    [25, 26, 4, 7],
    [22, 31, 5, 7],
    [19, 33, 7, 8],
    [20, 40, 7, 4],
    [22, 44, 6, 5],
    [21, 48, 9, 3],
    [18, 50, 15, 2],
  ])
    r(x, y, ww, hh, bark);
  for (const [x, y, ww, hh] of [
    [17, 28, 2, 6],
    [20, 33, 3, 7],
    [21, 40, 3, 4],
    [23, 43, 3, 5],
    [23, 48, 5, 3],
    [20, 50, 4, 1],
  ])
    r(x, y, ww, hh, birch ? CREAM : WOOD);
  r(20, 35, 1, 4, birch ? WOOD_D : WOOD_L);
  r(22, 41, 1, 3, WOOD_L);
  r(24, 45, 1, 3, birch ? WOOD_D : WOOD_L);
  r(25, 49, 2, 1, WOOD_L);
  if (kind === 'pine') {
    for (let n = 0; n < 4; n++) {
      const yy = 3 + n * 9,
        ww = 12 + n * 7;
      poly(
        c,
        [
          [X(20), Y(yy)],
          [X(20 - ww / 2), Y(yy + 13)],
          [X(20 + ww / 2), Y(yy + 13)],
        ],
        dark,
      );
      poly(
        c,
        [
          [X(19), Y(yy + 1)],
          [X(22 - ww / 2), Y(yy + 10)],
          [X(20 + ww / 2 - 2), Y(yy + 10)],
        ],
        base,
      );
      r(18, yy + 4, 2, 2, winter ? light : '#9DBA74');
    }
    return;
  }
  const bunches =
    kind === 'sapling'
      ? [
          [18, 21, 7, 7],
          [25, 27, 6, 6],
        ]
      : [
          [15, 12, 10, 9],
          [27, 15, 10, 9],
          [9, 23, 9, 9],
          [30, 25, 9, 9],
          [21, 29, 11, 9],
        ];
  for (const [x, y, rx, ry] of bunches)
    oval(c, X(x), Y(y), Math.max(1, X(rx)), Math.max(1, Y(ry)), dark);
  for (const [x, y, rx, ry] of bunches)
    oval(c, X(x - 1), Y(y - 1), Math.max(1, X(rx - 1)), Math.max(1, Y(ry - 2)), base);
  for (const [x, y, rx, ry] of bunches)
    oval(c, X(x - 3), Y(y - 3), Math.max(1, X(rx * 0.55)), Math.max(1, Y(ry * 0.33)), light);
  for (const [x, y] of [
    [10, 18],
    [27, 20],
    [7, 28],
    [20, 35],
    [30, 31],
  ])
    r(x, y, 4, 1, dark);
  if (kind === 'willow')
    for (const [x, y, hh] of [
      [3, 23, 12],
      [7, 28, 11],
      [31, 24, 12],
      [35, 26, 7],
    ]) {
      r(x, y, 1, hh, dark);
      r(x + 1, y + 1, 1, hh - 3, base);
    }
  if (birch) for (const yy of [37, 42, 47]) r(23, yy, 2, 1, WOOD_D);
  if (season === 'spring' && kind !== 'sapling')
    for (const [x, y] of [
      [10, 13],
      [27, 10],
      [5, 24],
      [28, 31],
    ]) {
      r(x, y, 1, 3, '#E4B4A3');
      r(x - 1, y + 1, 3, 1, '#E4B4A3');
      r(x, y + 1, 1, 1, CREAM);
    }
  if (fruit)
    for (const [x, y] of [
      [17, 15],
      [31, 23],
      [12, 29],
    ]) {
      const col =
        fruitColor ||
        { spring: '#C93A4A', summer: '#F0A27A', autumn: '#C9483A', winter: '#EE9A3A' }[season];
      r(x + 1, y - 2, 1, 3, WOOD_D);
      r(x - 1, y + 1, 4, 3, tint(col, -0.2));
      r(x, y, 2, 4, tint(col, -0.2));
      r(x - 1, y + 1, 3, 2, col);
      r(x, y, 1, 1, '#E4B4A3');
      r(x + 3, y + 2, 3, 3, tint(col, -0.2));
      r(x + 3, y + 2, 2, 2, col);
      r(x + 3, y + 2, 1, 1, CREAM);
    }
}
export function paintHouse(
  c,
  w,
  h,
  { level = 1, night = false, wall = WOOD, roofColor = '#A96E75' } = {},
) {
  const top = Math.round(h * 0.48),
    front = w - 13,
    back = w - 4,
    bottom = h - 4,
    peak = Math.round(w * 0.38);
  // The front is square to the player, with a receding right wall.
  poly(
    c,
    [
      [4, top],
      [front, top],
      [front, bottom],
      [4, bottom],
    ],
    tint(wall, -0.28),
  );
  R(c, 5, top + 1, front - 6, bottom - top - 1, wall);
  poly(
    c,
    [
      [front, top],
      [back, top - 5],
      [back, bottom - 5],
      [front, bottom],
    ],
    tint(wall, -0.27),
  );
  line(c, front + 1, top + 1, front + 1, bottom - 1, tint(wall, -0.38));
  for (let y = top + 4; y < bottom - 1; y += 4) {
    R(c, 6, y, front - 7, 1, tint(wall, -0.12));
    line(c, front + 1, y, back - 1, y - 4, tint(wall, -0.36));
  }
  // A pitched roof with a broad shingled plane and a visible front gable.
  poly(
    c,
    [
      [2, top + 1],
      [peak, 4],
      [front + 2, top + 1],
    ],
    tint(roofColor, -0.3),
  );
  poly(
    c,
    [
      [peak, 4],
      [peak + 8, 0],
      [w - 1, top - 5],
      [front + 2, top + 1],
    ],
    roofColor,
  );
  poly(
    c,
    [
      [3, top],
      [peak, 5],
      [front, top],
    ],
    tint(roofColor, -0.1),
  );
  for (let y = 8; y < top; y += 3) {
    const t = (y - 4) / (top - 4),
      left = peak + (front - peak) * t;
    line(c, left, y, Math.min(w - 2, left + 8), y - 4, tint(roofColor, -0.23));
    for (let x = 4; x < front - 3; x += 5) {
      if (x > peak - (peak - 2) * t && x < left)
        R(c, x + (Math.floor(y / 3) % 2), y, 3, 1, tint(roofColor, 0.13));
    }
  }
  line(c, 2, top + 1, peak, 4, WOOD_L);
  line(c, peak, 4, front + 2, top + 1, tint(roofColor, -0.38), 2);
  line(c, front + 2, top + 1, w - 1, top - 5, tint(roofColor, -0.4), 2);
  line(c, peak, 4, peak + 8, 0, tint(roofColor, 0.3));
  box(c, w - 15, 2, 5, 9, '#9A958A');
  R(c, w - 16, 1, 7, 2, '#C4BFB3');
  R(c, w - 14, 5, 3, 1, '#6E6A62');
  if (level > 2) {
    roof(c, peak - 5, top * 0.38, 13, 6, roofColor);
    box(c, peak - 3, top * 0.38 + 6, 9, 7, wall);
    windowPane(c, peak - 2, top * 0.38 + 7, 6, 5, night);
  }
  const dx = Math.round((front + 4) / 2) - 4;
  box(c, dx, bottom - 15, 8, 15, WOOD_D);
  R(c, dx + 1, bottom - 13, 5, 12, WOOD);
  R(c, dx + 2, bottom - 12, 1, 10, WOOD_L);
  R(c, dx + 5, bottom - 7, 1, 1, '#E8C25A');
  windowPane(c, 7, bottom - 15, 7, 8, night);
  windowPane(c, front - 10, bottom - 15, 7, 8, night);
  // The side window is a small parallelogram, matching the receding wall.
  poly(
    c,
    [
      [front + 3, top + 4],
      [back - 2, top + 2],
      [back - 2, top + 9],
      [front + 3, top + 11],
    ],
    WOOD_D,
  );
  poly(
    c,
    [
      [front + 4, top + 5],
      [back - 3, top + 4],
      [back - 3, top + 8],
      [front + 4, top + 9],
    ],
    night ? '#F2D39A' : '#79AAA4',
  );
  for (const x of [8, front - 9]) {
    R(c, x - 1, bottom - 4, 8, 3, WOOD_D);
    leaf(c, x + 1, bottom - 5, 2, 2);
    leaf(c, x + 4, bottom - 5, 2, 2);
    R(c, x + 1, bottom - 6, 1, 1, '#E4B4A3');
  }
  plank(c, dx - 2, h - 4, 12, 4, '#9A958A');
  R(c, dx - 1, h - 3, 9, 1, '#C4BFB3');
}
// Inner-edge lighting and contact shadows stay within the native canvas; PNG overrides bypass this.
export function finishPixels(canvas, name) {
  if (/^(ground_|floor_|wallpaper_|cave_wall_|fx_|monster_.*_1$)/.test(name)) return;
  const ctx = canvas.getContext('2d'),
    w = canvas.width,
    h = canvas.height,
    img = ctx.getImageData(0, 0, w, h),
    src = new Uint8ClampedArray(img.data),
    dst = img.data;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (src[i + 3] < 220) continue;
      const bright = (src[i] + src[i + 1] + src[i + 2]) / 3;
      if (bright < 53) continue;
      const up = y === 0 || src[i - w * 4 + 3] < 100,
        left = x === 0 || src[i - 4 + 3] < 100,
        down = y === h - 1 || src[i + w * 4 + 3] < 100,
        right = x === w - 1 || src[i + 4 + 3] < 100;
      const k = down || right ? -0.12 : up || left ? 0.12 : 0;
      if (!k) continue;
      const target = k < 0 ? [56, 73, 61] : [255, 247, 228];
      for (let j = 0; j < 3; j++)
        dst[i + j] = Math.round(src[i + j] + (target[j] - src[i + j]) * Math.abs(k));
    }
  ctx.putImageData(img, 0, 0);
  // Ground contact stays inside the native canvas and behind the feet, never over them.
  if (
    /^(tree_|house_|tent$|stall$|workbench$|bench$|critter_|visitor_|animal_|bunny_|museum$|furniture_)/.test(
      name,
    )
  ) {
    let minX = w,
      maxX = -1,
      maxY = -1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (src[(y * w + x) * 4 + 3] > 180) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
    if (maxX >= minX) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      oval(
        ctx,
        (minX + maxX) / 2,
        Math.min(h - 1, maxY),
        Math.max(2, (maxX - minX) * 0.33),
        1,
        'rgba(56,73,61,0.16)',
      );
      ctx.restore();
    }
  }
}
