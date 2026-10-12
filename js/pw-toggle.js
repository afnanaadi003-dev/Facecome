/**
 * Show/hide password toggles.
 * Any button with .pw-toggle inside a .pw-wrap toggles the type of the
 * input with the id in its data-target attribute.
 */
(function () {
  var EYE_CLOSED_LABEL = 'Hide password';
  var EYE_OPEN_LABEL = 'Show password';

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.pw-toggle');
    if (!btn) return;

    var wrap = btn.closest('.pw-wrap');
    var input = document.getElementById(btn.getAttribute('data-target'));
    if (!wrap || !input) return;

    var showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    wrap.classList.toggle('shown', !showing);
    btn.setAttribute('aria-label', showing ? EYE_OPEN_LABEL : EYE_CLOSED_LABEL);
  });
})();
