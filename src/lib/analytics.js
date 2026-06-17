// Meta Pixel loader, fired only after cookie consent (UK PECR).
// Pixel ID comes from VITE_META_PIXEL_ID (public by nature).
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
export const hasPixel = Boolean(PIXEL_ID);

let loaded = false;
export function loadPixel() {
  if (loaded || !PIXEL_ID || typeof window === "undefined") return;
  loaded = true;
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

// Fire a standard event if the pixel is loaded (consent given).
export function track(event, params) {
  if (typeof window !== "undefined" && window.fbq) window.fbq("track", event, params);
}
