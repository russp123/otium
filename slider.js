// imagesLoaded CDN import for browser
const imagesLoaded = window.imagesLoaded || function (el, cb) {
  // fallback: call cb immediately
  cb({ isComplete: true });
};

console.clear();

const wrap = (n, max) => (n + max) % max;
const lerp = (a, b, t) => a + (b - a) * t;

const genId = (() => {
    let count = 0;
    return () => (count++).toString();
})();

class Raf {
    constructor() {
        this.rafId = 0;
        this.raf = this.raf.bind(this);
        this.callbacks = [];
        this.start();
    }
    start() { this.raf(); }
    stop() { cancelAnimationFrame(this.rafId); }
    raf() {
        this.callbacks.forEach(({ callback, id }) => callback({ id }));
        this.rafId = requestAnimationFrame(this.raf);
    }
    add(callback, id) { this.callbacks.push({ callback, id: id || genId() }); }
    remove(id) { this.callbacks = this.callbacks.filter((cb) => cb.id !== id); }
}

class Vec2 {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    set(x, y) { this.x = x; this.y = y; }
    lerp(v, t) { this.x = lerp(this.x, v.x, t); this.y = lerp(this.y, v.y, t); }
}
const vec2 = (x = 0, y = 0) => new Vec2(x, y);

function tilt(node, options) {
    let { trigger, target } = resolveOptions(node, options);
    let lerpAmount = 0.06;
    const rotDeg = { current: vec2(), target: vec2() };
    const bgPos = { current: vec2(), target: vec2() };
    const update = (newOptions) => {
        destroy();
        ({ trigger, target } = resolveOptions(node, newOptions));
        init();
    };
    let rafId;
    function ticker({ id }) {
        rafId = id;
        rotDeg.current.lerp(rotDeg.target, lerpAmount);
        bgPos.current.lerp(bgPos.target, lerpAmount);
        for (const el of target) {
            el.style.setProperty("--rotX", rotDeg.current.y.toFixed(2) + "deg");
            el.style.setProperty("--rotY", rotDeg.current.x.toFixed(2) + "deg");
            el.style.setProperty("--bgPosX", bgPos.current.x.toFixed(2) + "%");
            el.style.setProperty("--bgPosY", bgPos.current.y.toFixed(2) + "%");
        }
    }
    const onMouseMove = ({ offsetX, offsetY }) => {
        lerpAmount = 0.1;
        for (const el of target) {
            const ox = (offsetX - el.clientWidth * 0.5) / (Math.PI * 3);
            const oy = -(offsetY - el.clientHeight * 0.5) / (Math.PI * 4);
            rotDeg.target.set(ox, oy);
            bgPos.target.set(-ox * 0.3, oy * 0.3);
        }
    };
    const onMouseLeave = () => {
        lerpAmount = 0.06;
        rotDeg.target.set(0, 0);
        bgPos.target.set(0, 0);
    };
    const addListeners = () => {
        trigger.addEventListener("mousemove", onMouseMove);
        trigger.addEventListener("mouseleave", onMouseLeave);
    };
    const removeListeners = () => {
        trigger.removeEventListener("mousemove", onMouseMove);
        trigger.removeEventListener("mouseleave", onMouseLeave);
    };
    const init = () => {
        addListeners();
        raf.add(ticker);
    };
    const destroy = () => {
        removeListeners();
        raf.remove(rafId);
    };
    init();
    return { destroy, update };
}
function resolveOptions(node, options) {
    return {
        trigger: options?.trigger ?? node,
        target: options?.target
            ? Array.isArray(options.target)
                ? options.target
                : [options.target]
            : [node]
    };
}

const raf = new Raf();

function init() {
    const loader = document.querySelector(".loader");
    const slides = [...document.querySelectorAll(".slide")];
    const slidesInfo = [...document.querySelectorAll(".slide-info")];
    const slidesBg = [...document.querySelectorAll(".slide__bg")];
    const buttons = {
        prev: document.querySelector(".slider--btn__prev"),
        next: document.querySelector(".slider--btn__next")
    };
    loader.style.opacity = 0;
    loader.style.pointerEvents = "none";

    // Set all 5 data attributes for initial state
    const total = slides.length;
    // Find the current index (should be 0 on load)
    let idx = slides.findIndex(slide => slide.hasAttribute("data-current"));
    let infoIdx = slidesInfo.findIndex(info => info.hasAttribute("data-current"));
    let bgIdx = slidesBg.findIndex(bg => bg.hasAttribute("data-current"));

    // Remove all data attributes first
    slides.forEach(slide => {
        slide.removeAttribute("data-current");
        slide.removeAttribute("data-next");
        slide.removeAttribute("data-next2");
        slide.removeAttribute("data-previous");
        slide.removeAttribute("data-previous2");
    });
    slidesInfo.forEach(info => {
        info.removeAttribute("data-current");
        info.removeAttribute("data-next");
        info.removeAttribute("data-next2");
        info.removeAttribute("data-previous");
        info.removeAttribute("data-previous2");
    });
    slidesBg.forEach(bg => {
        bg.removeAttribute("data-current");
        bg.removeAttribute("data-next");
        bg.removeAttribute("data-next2");
        bg.removeAttribute("data-previous");
        bg.removeAttribute("data-previous2");
    });

    // Set the 5 attributes for slides
    slides[idx].setAttribute("data-current", "");
    slides[(idx + 1) % total].setAttribute("data-next", "");
    slides[(idx + 2) % total].setAttribute("data-next2", "");
    slides[(idx - 1 + total) % total].setAttribute("data-previous", "");
    slides[(idx - 2 + total) % total].setAttribute("data-previous2", "");

    slidesInfo[infoIdx].setAttribute("data-current", "");
    slidesInfo[(infoIdx + 1) % slidesInfo.length].setAttribute("data-next", "");
    slidesInfo[(infoIdx + 2) % slidesInfo.length].setAttribute("data-next2", "");
    slidesInfo[(infoIdx - 1 + slidesInfo.length) % slidesInfo.length].setAttribute("data-previous", "");
    slidesInfo[(infoIdx - 2 + slidesInfo.length) % slidesInfo.length].setAttribute("data-previous2", "");

    slidesBg[bgIdx].setAttribute("data-current", "");
    slidesBg[(bgIdx + 1) % slidesBg.length].setAttribute("data-next", "");
    slidesBg[(bgIdx + 2) % slidesBg.length].setAttribute("data-next2", "");
    slidesBg[(bgIdx - 1 + slidesBg.length) % slidesBg.length].setAttribute("data-previous", "");
    slidesBg[(bgIdx - 2 + slidesBg.length) % slidesBg.length].setAttribute("data-previous2", "");

    // Tilt effect
    slides.slice(0, slidesInfo.length).forEach((slide, i) => {
        const slideInner = slide.querySelector(".slide__inner");
        const slideInfoInner = slidesInfo[i].querySelector(".slide-info__inner");
        tilt(slide, { target: [slideInner, slideInfoInner] });
    });

    buttons.prev.addEventListener("click", change(-1));
    buttons.next.addEventListener("click", change(1));
}

function setup() {
    const loaderText = document.querySelector(".loader__text");
    const images = [...document.querySelectorAll(".slide--image")];
    const totalImages = images.length;
    let loadedImages = 0;
    let progress = { current: 0, target: 0 };
    images.forEach((image) => {
        imagesLoaded(image, (instance) => {
            if (instance.isComplete) {
                loadedImages++;
                progress.target = loadedImages / totalImages;
            }
        });
    });
    raf.add(({ id }) => {
        progress.current = lerp(progress.current, progress.target, 0.06);
        const progressPercent = Math.round(progress.current * 100);
        loaderText.textContent = `${progressPercent}%`;
        if (progressPercent === 100) {
            init();
            raf.remove(id);
        }
    });
}

function change(direction) {
    return () => {
        let current = {
            slide: document.querySelector(".slide[data-current]"),
            slideInfo: document.querySelector(".slide-info[data-current]"),
            slideBg: document.querySelector(".slide__bg[data-current]")
        };
        let previous = {
            slide: document.querySelector(".slide[data-previous]"),
            slideInfo: document.querySelector(".slide-info[data-previous]"),
            slideBg: document.querySelector(".slide__bg[data-previous]")
        };
        let next = {
            slide: document.querySelector(".slide[data-next]"),
            slideInfo: document.querySelector(".slide-info[data-next]"),
            slideBg: document.querySelector(".slide__bg[data-next]")
        };
        let previous2 = {
            slide: document.querySelector(".slide[data-previous2]"),
            slideInfo: document.querySelector(".slide-info[data-previous2]"),
            slideBg: document.querySelector(".slide__bg[data-previous2]")
        };
        let next2 = {
            slide: document.querySelector(".slide[data-next2]"),
            slideInfo: document.querySelector(".slide-info[data-next2]"),
            slideBg: document.querySelector(".slide__bg[data-next2]")
        };

        // Remove all data attributes
        [
            ...Object.values(current),
            ...Object.values(previous),
            ...Object.values(next),
            ...Object.values(previous2),
            ...Object.values(next2)
        ].forEach(el => {
            if (el) {
                el.removeAttribute("data-current");
                el.removeAttribute("data-previous");
                el.removeAttribute("data-next");
                el.removeAttribute("data-previous2");
                el.removeAttribute("data-next2");
            }
        });

        const slides = [...document.querySelectorAll(".slide")];
        const slidesInfo = [...document.querySelectorAll(".slide-info")];
        const slidesBg = [...document.querySelectorAll(".slide__bg")];
        let idx = slides.indexOf(current.slide);
        let infoIdx = slidesInfo.indexOf(current.slideInfo);
        let bgIdx = slidesBg.indexOf(current.slideBg);
        const total = slides.length;

        if (direction === 1) {
            idx = wrap(idx + 1, total);
            infoIdx = wrap(infoIdx + 1, slidesInfo.length);
            bgIdx = wrap(bgIdx + 1, slidesBg.length);
        } else if (direction === -1) {
            idx = wrap(idx - 1, total);
            infoIdx = wrap(infoIdx - 1, slidesInfo.length);
            bgIdx = wrap(bgIdx - 1, slidesBg.length);
        }

        slides[idx].setAttribute("data-current", "");
        slides[wrap(idx + 1, total)].setAttribute("data-next", "");
        slides[wrap(idx + 2, total)].setAttribute("data-next2", "");
        slides[wrap(idx - 1, total)].setAttribute("data-previous", "");
        slides[wrap(idx - 2, total)].setAttribute("data-previous2", "");

        slidesInfo[infoIdx].setAttribute("data-current", "");
        slidesInfo[wrap(infoIdx + 1, slidesInfo.length)].setAttribute("data-next", "");
        slidesInfo[wrap(infoIdx + 2, slidesInfo.length)].setAttribute("data-next2", "");
        slidesInfo[wrap(infoIdx - 1, slidesInfo.length)].setAttribute("data-previous", "");
        slidesInfo[wrap(infoIdx - 2, slidesInfo.length)].setAttribute("data-previous2", "");

        slidesBg[bgIdx].setAttribute("data-current", "");
        slidesBg[wrap(bgIdx + 1, slidesBg.length)].setAttribute("data-next", "");
        slidesBg[wrap(bgIdx + 2, slidesBg.length)].setAttribute("data-next2", "");
        slidesBg[wrap(bgIdx - 1, slidesBg.length)].setAttribute("data-previous", "");
        slidesBg[wrap(bgIdx - 2, slidesBg.length)].setAttribute("data-previous2", "");

        // ADD THIS LINE to update the center slide's click handler
        updateCenterSlideClick();
    };
}

// Add this function near the bottom of your file, before DOMContentLoaded
function updateCenterSlideClick() {
    // Remove previous click handlers and cursor from all slides
    document.querySelectorAll('.slide').forEach(slide => {
        slide.style.cursor = 'default';
        slide.onclick = null;
    });
    // Find the current (center) slide
    const current = document.querySelector('.slide[data-current]');
    if (current && current.dataset.link) {
        current.style.cursor = 'pointer';
        current.onclick = () => window.location.href = current.dataset.link;
    }
}

// Wait for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Load imagesLoaded from CDN if not present
  if (!window.imagesLoaded) {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js";
    script.onload = setup;
    document.body.appendChild(script);
  } else {
    setup();
  }
});