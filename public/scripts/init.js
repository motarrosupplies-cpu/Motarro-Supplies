if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(r) { }).catch(function() { });
  });
}

(function() {
  if (typeof window === 'undefined' || window.location.pathname.indexOf('/admin') === 0) return;
  if (document.getElementById('merchantWidgetScript')) return;
  var s = document.createElement('script');
  s.id = 'merchantWidgetScript';
  s.src = 'https://www.gstatic.com/shopping/merchant/merchantwidget.js';
  s.defer = true;
  s.onload = function() {
    if (window.merchantwidget) window.merchantwidget.start({ merchant_id: 5592910569, position: 'LEFT_BOTTOM', region: 'ZA' });
  };
  document.head.appendChild(s);
})();
