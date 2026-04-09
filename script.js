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

  document.querySelectorAll(".menu-link").forEach((link) => {
    link.addEventListener("click", () => {
      overlay.classList.remove("open");
      document.body.classList.remove("menu-open");
    });
  });
}

document.querySelectorAll(".reel-video").forEach((vid) => {
  vid.addEventListener("mouseenter", () => {
    vid.currentTime = 0;
    vid.play().catch(() => {});
  });

  vid.addEventListener("mouseleave", () => {
    vid.pause();
    vid.currentTime = 0;
  });
});

window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

document.querySelectorAll("a[href]").forEach((link) => {
  const url = link.getAttribute("href");

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

// ===== SIMPLE WEBGL BACKGROUND =====
const webglCanvas = document.getElementById("webgl");

if (webglCanvas && window.innerWidth > 768 && window.THREE) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const renderer = new THREE.WebGLRenderer({
    canvas: webglCanvas,
    alpha: true,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const geometry = new THREE.PlaneGeometry(2, 2);

  const uniforms = {
    uTime: { value: 0 },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight)
    }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uResolution;

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        float t = uTime * 0.18;

        // VIBRANT COLORS (hot pink + teal + pastel mix)
        vec3 hotPink = vec3(1.0, 0.25, 0.65);
        vec3 coral   = vec3(1.0, 0.55, 0.35);
        vec3 teal    = vec3(0.15, 0.85, 0.80);
        vec3 lilac   = vec3(0.75, 0.60, 1.0);
        vec3 softBg  = vec3(0.97, 0.95, 0.93);

        // smooth flowing motion (no harsh lines)
        float w1 = sin((uv.x * 3.0) + t);
        float w2 = sin((uv.y * 3.5) - t * 1.2);
        float w3 = sin(((uv.x + uv.y) * 2.5) + t * 0.8);

        float m1 = 0.5 + 0.5 * w1;
        float m2 = 0.5 + 0.5 * w2;
        float m3 = 0.5 + 0.5 * w3;

        // layer colors more strongly (this is key)
        vec3 color = mix(softBg, hotPink, m1 * 0.7);
        color = mix(color, coral, m2 * 0.55);
        color = mix(color, teal, m3 * 0.5);
        color = mix(color, lilac, (m1 * m3) * 0.35);

        // slight richness boost
        color = pow(color, vec3(0.9));

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function animate() {
    uniforms.uTime.value += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });
}