/* Facecome profile page logic */
(function () {
  var session = window.FacecomeAuth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  var me = window.FacecomeAuth.findUser(session);
  if (!me) { window.location.href = 'login.html'; return; }

  var F = window.FacecomeFeed, P = window.FacecomePosts;

  var avatarView = document.getElementById('avatar-view');
  var avatarInput = document.getElementById('avatar-input');
  var nameInput = document.getElementById('name-input');
  var emailLine = document.getElementById('email-line');
  var bioInput = document.getElementById('bio-input');
  var saveMsg = document.getElementById('save-msg');

  emailLine.value = session;
  nameInput.value = me.name || '';
  bioInput.value = me.bio || '';

  function renderAvatar(avatar, name) {
    avatarView.innerHTML = F.avatarHtml({ avatar: avatar, name: name }, 'avatar-xl');
  }
  renderAvatar(me.avatar, me.name);

  document.getElementById('avatar-btn').addEventListener('click', function () {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', function () {
    var f = avatarInput.files[0];
    if (!f) return;
    P.fileToAvatarDataUrl(f, function (data) {
      if (!data) { saveMsg.textContent = 'Could not read that image.'; saveMsg.classList.remove('hidden'); return; }
      renderAvatar(data, nameInput.value);
      me.avatar = data; // staged until Save
      avatarInput.value = '';
    });
  });

  document.getElementById('save-btn').addEventListener('click', function () {
    if (!nameInput.value.trim()) {
      saveMsg.textContent = 'Name cannot be empty.';
      saveMsg.classList.remove('hidden');
      return;
    }
    var res = window.FacecomeAuth.updateProfile(session, {
      name: nameInput.value,
      bio: bioInput.value,
      avatar: me.avatar
    });
    saveMsg.textContent = res.ok ? 'Profile saved ✓' : (res.message || 'Could not save.');
    saveMsg.classList.toggle('hidden', false);
    setTimeout(function () { saveMsg.classList.add('hidden'); }, 2500);
    renderAvatar(me.avatar, nameInput.value);
    renderRecent();
  });

  function renderStats() {
    var mine = P.byAuthor(session);
    var likes = mine.reduce(function (sum, p) { return sum + p.likes.length; }, 0);
    var joins = mine.reduce(function (sum, p) { return sum + (p.invites ? p.invites.joined.length : 0); }, 0);
    document.getElementById('stats').innerHTML =
      '<div class="stat"><b>' + mine.length + '</b><span>thoughts</span></div>' +
      '<div class="stat"><b>' + likes + '</b><span>likes</span></div>' +
      '<div class="stat"><b>' + joins + '</b><span>joins</span></div>';
    // demo posts exist only if this is a fresh signup (no posts authored anywhere else)
    var demoBtn = document.getElementById('clear-demo-btn');
    demoBtn.classList.toggle('hidden', mine.length === 0 || P.list().some(function (p) { return p.author !== session; }) === false && mine.length === 0 === false);
    demoBtn.classList.toggle('hidden', !mine.length);
  }

  function renderRecent() {
    var mine = P.byAuthor(session).slice(0, 3);
    window.FacecomeFeed.renderPosts(document.getElementById('recent'), mine, session, {});
    renderStats();
  }

  document.getElementById('clear-demo-btn').addEventListener('click', function () {
    var remaining = P.list().filter(function (p) { return p.author !== session; });
    localStorage.setItem('facecome_posts', JSON.stringify(remaining));
    renderRecent();
  });

  document.getElementById('recent').addEventListener('click', function (e) {
    var btn = e.target.closest('.action');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var act = btn.getAttribute('data-act');
    if (act === 'like') P.toggleLike(id, session);
    if (act === 'join') P.toggleJoin(id, session);
    if (act === 'send') {
      var input = document.querySelector('.comment-input[data-input="' + id + '"]');
      if (input && input.value.trim()) P.addComment(id, session, input.value);
    }
    if (act === 'comment') {
      var box = document.querySelector('[data-box="' + id + '"]');
      if (box) box.classList.toggle('hidden');
    }
    renderRecent();
    if (act === 'comment' || act === 'send') {
      var box = document.querySelector('[data-box="' + id + '"]');
      if (box) box.classList.remove('hidden');
    }
  });

  document.getElementById('recent').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var input = e.target.closest('.comment-input');
    if (!input) return;
    e.preventDefault();
    var id = input.getAttribute('data-input');
    if (input.value.trim()) P.addComment(id, session, input.value);
    renderRecent();
    var box = document.querySelector('[data-box="' + id + '"]');
    if (box) {
      box.classList.remove('hidden');
      var again = box.querySelector('.comment-input');
      if (again) again.focus();
    }
  });

  document.getElementById('logout').addEventListener('click', function () {
    window.FacecomeAuth.logout();
    window.location.href = 'login.html';
  });

  renderRecent();
})();
