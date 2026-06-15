(function() {
  if (typeof window === 'undefined') return;
  var OriginalImage = window.Image;
  function PatchedImage() {
    return Reflect.construct(OriginalImage, [].slice.call(arguments));
  }
  PatchedImage.__motarro_patched_image__ = true;
  PatchedImage.prototype = OriginalImage.prototype;
  window.Image = PatchedImage;
  Object.setPrototypeOf(window.Image, OriginalImage);
  Object.setPrototypeOf(window.Image.prototype, OriginalImage.prototype);
})();
