const openBtn = document.getElementById("openMenu");
const closeBtn = document.getElementById("closeMenu");
const overlay = document.getElementById("menuOverlay");

if (openBtn && closeBtn && overlay) {
  openBtn.addEventListener("click", () => {
    overlay.classList.add("open");
    document.body.classList.add("menu-open");
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("open");
    document.body.classList.remove("menu-open");
  });

  document.querySelectorAll(".menu-link").forEach(link => {
    link.addEventListener("click", () => {
      overlay.classList.remove("open");
      document.body.classList.remove("menu-open");
    });
  });
}

// ----- Interactive ripple canvas (Home only) -----
const canvas = document.getElementById("bgCanvas");


if (canvas) {
  const ctx = canvas.getContext("2d");

  // Resize for crisp rendering
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // Ripple simulation on a coarse grid (fast)
  const scale = 3; // smaller = more detailed but heavier. 3 is a good start.
  let w = Math.floor(window.innerWidth / scale);
  let h = Math.floor(window.innerHeight / scale);

  let prev = new Float32Array(w * h);
  let curr = new Float32Array(w * h);

  function resetGrid() {
    w = Math.floor(window.innerWidth / scale);
    h = Math.floor(window.innerHeight / scale);
    prev = new Float32Array(w * h);
    curr = new Float32Array(w * h);
  }
  window.addEventListener("resize", resetGrid);

  // “Ink” palette behind ripples
  const colors = [
    [255, 42, 127], // pink
    [255, 122, 61], // coral
    [24, 198, 193], // teal
    [245, 66, 145], // magenta
  ];

  // Add disturbance where mouse moves (this is the "push")
  function splash(clientX, clientY, strength = 120) {
    const x = Math.floor((clientX / window.innerWidth) * w);
    const y = Math.floor((clientY / window.innerHeight) * h);

    const r = 6; // radius of disturbance
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 1 || ny < 1 || nx >= w - 1 || ny >= h - 1) continue;
        const d = dx * dx + dy * dy;
        if (d <= r * r) {
          prev[ny * w + nx] -= strength * (1 - d / (r * r));
        }
      }
    }
  }

  // Mouse “drag” makes continuous ripples
  let lastMove = 0;
  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastMove > 12) { // throttle
      splash(e.clientX, e.clientY, 90);
      lastMove = now;
    }
  });

  // Click makes a bigger splash (fun)
  window.addEventListener("click", (e) => splash(e.clientX, e.clientY, 220));

  // Render: map ripple height to slight color shifts (watery shimmer)
  function draw(time) {
    // ripple update (simple wave equation)
    const damping = 0.985;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const v =
          (prev[i - 1] + prev[i + 1] + prev[i - w] + prev[i + w]) / 2 - curr[i];
        curr[i] = v * damping;
      }
    }

    // paint background gradient-ish + ripple shimmer
    const imgW = window.innerWidth;
    const imgH = window.innerHeight;

    // base fill
    ctx.clearRect(0, 0, imgW, imgH);

    // soft blobs (static-ish) so your colors match
    // (cheap radial fills)
    function blob(cx, cy, r, rgb, a) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`);
      g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    blob(imgW * 0.25, imgH * 0.30, 520, colors[0], 0.75);
    blob(imgW * 0.78, imgH * 0.38, 560, colors[1], 0.70);
    blob(imgW * 0.42, imgH * 0.78, 620, colors[2], 0.65);
    blob(imgW * 0.72, imgH * 0.78, 540, colors[3], 0.55);

    // ripple shimmer overlay
    // draw coarse grid as small rectangles — fast enough
    ctx.globalCompositeOperation = "soft-light";
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const i = y * w + x;
        const val = curr[i]; // -inf..inf
        const intensity = Math.max(0, Math.min(1, (val + 60) / 120));

        if (intensity < 0.52) continue; // skip low energy pixels

        // white shimmer
        ctx.fillStyle = `rgba(255,255,255,${(intensity - 0.5) * 0.18})`;
        ctx.fillRect(x * scale, y * scale, scale * 2, scale * 2);
      }
    }
    ctx.globalCompositeOperation = "source-over";

    // swap buffers
    const tmp = prev;
    prev = curr;
    curr = tmp;

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}


document.querySelectorAll(".reel-video").forEach((vid) => {
    vid.addEventListener("mouseenter", () => {
      vid.currentTime = 0;
      vid.play().catch(()=>{});
    });
  
    vid.addEventListener("mouseleave", () => {
      vid.pause();
      vid.currentTime = 0;
    });
  });
// --- PAGE TRANSITIONS ---

window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

document.querySelectorAll("a[href]").forEach(link => {
  const url = link.getAttribute("href");

  // only apply to internal links
  if (
    url &&
    !url.startsWith("#") &&
    !url.startsWith("mailto") &&
    !url.startsWith("http")
  ) {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      document.body.classList.remove("page-loaded");
      document.body.classList.add("page-exit");

      setTimeout(() => {
        window.location.href = url;
      }, 400);
    });
  }
});