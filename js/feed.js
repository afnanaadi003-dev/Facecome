/**
 * Facecome shared post machinery.
 * FacecomeFeed.renderPosts(container, posts, me, opts)
 * FacecomeFeed.avatarHtml(user, size) — initials badge or photo.
 * FacecomeFeed.timeAgo(ts) helper.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function authorOf(email) {
    return window.FacecomeAuth.findUser(email) || { name: 'Facecome user', email: email, avatar: null, bio: '' };
  }

  function initials(name) {
    return (name || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase() || '?';
  }

  function avatarHtml(user, cls) {
    if (user && user.avatar) {
      return '<img class="avatar ' + cls + '" src="' + user.avatar + '" alt="' + esc(user.name) + '" />';
    }
    return '<span class="avatar avatar-initials ' + cls + '">' + esc(initials(user && user.name)) + '</span>';
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    if (diff < 60e3) return 'just now';
    var m = Math.floor(diff / 60e3);
    if (m < 60) return m + ' min ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' h ago';
    var d = Math.floor(h / 24);
    if (d < 7) return d + ' d ago';
    return new Date(ts).toLocaleDateString();
  }

  // Media record -> HTML. media is { kind:'photo'|'video'|'live', data }
  function mediaHtml(media) {
    if (!media) return '';
    if (media.kind === 'photo') {
      return '<img class="post-media" src="' + media.data + '" alt="Post photo" />';
    }
    if (media.kind === 'video') {
      return '<video class="post-media" controls src="' + media.data + '"></video>';
    }
    if (media.kind === 'live') {
      return '<div class="post-live"><span class="live-dot"></span>Live voice note <audio controls src="' + media.data + '"></audio></div>';
    }
    return '';
  }

  function renderPost(post, me, opts) {
    var author = authorOf(post.author);
    var liked = post.likes.indexOf(me) >= 0;
    var joined = post.invites && post.invites.joined.indexOf(me) >= 0;
    var typeBadge = {
      text: '', photo: '<span class="badge">📷 photo</span>',
      video: '<span class="badge">🎬 video</span>',
      live: '<span class="badge">🔴 live talking</span>'
    }[post.type] || '';
    var joinHtml = '';
    if (post.invites) {
      joinHtml =
        '<div class="join-row">' +
        '<button class="action join-btn' + (joined ? ' active' : '') + '" data-act="join" data-id="' + post.id + '">' +
        (joined ? '✓ Joined' : '🙋 Wanna join?') + ' (' + post.invites.joined.length + ')' +
        '</button>' +
        '<span class="join-names">' + esc(post.invites.joined.map(function (e) { return authorOf(e).name.split(' ')[0]; }).join(', ')) + '</span>' +
        '</div>';
    }
    var comments = post.comments.map(function (c) {
      return '<div class="comment">' + avatarHtml(authorOf(c.author), 'avatar-xs') +
        '<div><div class="comment-head"><b>' + esc(authorOf(c.author).name) + '</b> <span class="time">' + timeAgo(c.createdAt) + '</span></div>' +
        '<div class="comment-text">' + esc(c.text) + '</div></div></div>';
    }).join('');
    var emptyComments = post.comments.length ? '' : '<div class="comment-empty">Be the first to comment 💬</div>';

    return '<article class="card post" data-id="' + post.id + '">' +
      '<header class="post-head">' + avatarHtml(author, 'avatar-sm') +
      '<div class="post-meta"><b>' + esc(author.name) + '</b>' + typeBadge +
      '<span class="time">' + timeAgo(post.createdAt) + '</span></div></header>' +
      (post.text ? '<p class="post-text">' + esc(post.text) + '</p>' : '') +
      mediaHtml(post.media) +
      joinHtml +
      '<div class="post-actions">' +
      '<button class="action like-btn' + (liked ? ' active' : '') + '" data-act="like" data-id="' + post.id + '">' +
      '<svg viewBox="0 0 24 24" class="icon"><path d="M2 21h4V9H2v12zM23 10c0-1.1-.9-2-2-2h-6.3l1-4.6c.1-.5-.1-1-.4-1.4-.4-.4-1-.5-1.5-.3L13 2l-4 8v11h11c.8 0 1.5-.5 1.8-1.2l2.9-7.3c.2-.4.3-.9.3-1.5v-1z"/></svg>' +
      (post.likes.length ? post.likes.length : '') + '</button>' +
      '<button class="action comment-btn" data-act="comment" data-id="' + post.id + '">' +
      '<svg viewBox="0 0 24 24" class="icon"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' +
      (post.comments.length ? post.comments.length : '') + '</button>' +
      '</div>' +
      '<div class="comments-box' + (opts && opts.expandComments ? '' : ' hidden') + '" data-box="' + post.id + '">' +
      emptyComments + comments +
      '<div class="comment-input-row">' + avatarHtml(authorOf(me), 'avatar-xs') +
      '<input class="comment-input" data-input="' + post.id + '" placeholder="Write a comment…" maxlength="300" />' +
      '<button class="action send-btn" data-act="send" data-id="' + post.id + '">➤</button>' +
      '</div></div></article>';
  }

  function renderPosts(container, posts, me, opts) {
    opts = opts || {};
    container.innerHTML = posts.length
      ? posts.map(function (p) { return renderPost(p, me, opts); }).join('')
      : '<div class="card empty-feed">No thoughts yet — write the first one above ✍️</div>';
  }

  window.FacecomeFeed = {
    renderPosts: renderPosts,
    avatarHtml: avatarHtml,
    timeAgo: timeAgo,
    esc: esc,
    initials: initials,
    authorOf: authorOf
  };
})();
