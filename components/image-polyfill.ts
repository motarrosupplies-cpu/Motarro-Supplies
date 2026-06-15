// Polyfill to make `Image()` callable with or without `new`.
// Some libraries call `Image()` directly; some do `new Image()`.
// We must not call the native Image constructor via `.apply()`, which throws.

if (typeof window !== "undefined") {
  const OriginalImage = window.Image

  // If already patched, do nothing.
  if ((OriginalImage as any)?.__motarro_patched_image__) {
    // noop
  } else {
    function PatchedImage(this: unknown, ...args: any[]) {
      // Always construct the native Image properly.
      return Reflect.construct(OriginalImage as any, args)
    }

    ;(PatchedImage as any).__motarro_patched_image__ = true

    // Preserve prototype chain expectations.
    PatchedImage.prototype = OriginalImage.prototype
    Object.setPrototypeOf(PatchedImage, OriginalImage)

    // Replace global
    ;(window as any).Image = PatchedImage
  }
}
