/**
 * Facecome posts data layer — stored in localStorage.
 * Post shape:
 *   { id, author, type: 'text'|'photo'|'video'|'live', text,
 *     media, createdAt, likes: [email], comments: [{author, text, createdAt}],
 *     invites: { title, joined: [email] } }
 */
(function () {
  var POSTS_KEY = 'facecome_posts';
  var AVATAR_MAX = 400 * 1024; // keep data URLs small enough for localStorage

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }

  function readPosts() {
    return read(POSTS_KEY) || [];
  }

  function writePosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }

  function uid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  window.FacecomePosts = {
    list: readPosts,

    create: function (author, type, text, media, hasInvite) {
      var post = {
        id: uid(),
        author: author,
        type: type,
        text: (text || '').trim(),
        media: media || null,
        createdAt: Date.now(),
        likes: [],
        comments: [],
        invites: hasInvite ? { title: (text || '').trim() || 'Let\'s hang out', joined: [] } : null
      };
      var posts = readPosts();
      posts.unshift(post);
      writePosts(posts);
      return post;
    },

    toggleLike: function (postId, email) {
      var posts = readPosts();
      var post = posts.find(function (p) { return p.id === postId; });
      if (!post) return null;
      var i = post.likes.indexOf(email);
      if (i >= 0) { post.likes.splice(i, 1); } else { post.likes.push(email); }
      writePosts(posts);
      return post;
    },

    addComment: function (postId, author, text) {
      var posts = readPosts();
      var post = posts.find(function (p) { return p.id === postId; });
      if (!post || !text.trim()) return null;
      post.comments.push({ author: author, text: text.trim(), createdAt: Date.now() });
      writePosts(posts);
      return post;
    },

    toggleJoin: function (postId, email) {
      var posts = readPosts();
      var post = posts.find(function (p) { return p.id === postId; });
      if (!post || !post.invites) return null;
      var i = post.invites.joined.indexOf(email);
      if (i >= 0) { post.invites.joined.splice(i, 1); } else { post.invites.joined.push(email); }
      writePosts(posts);
      return post;
    },

    byAuthor: function (email) {
      return readPosts().filter(function (p) { return p.author === email; });
    },

    /** Compress an image File into a small data URL, or null on error. */
    fileToAvatarDataUrl: function (file, cb) {
      if (!file || file.type.indexOf('image') !== 0) return cb(null);
      var reader = new FileReader();
      reader.onerror = function () { cb(null); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { cb(null); };
        img.onload = function () {
          var max = 200;
          var w = img.width, h = img.height;
          var s = Math.min(1, max / Math.max(w, h));
          var canvas = document.createElement('canvas');
          canvas.width = Math.ceil(w * s);
          canvas.height = Math.ceil(h * s);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          cb(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    },

    /** Downscale a photo post to a data URL capped near AVATAR_MAX bytes. */
    fileToPhotoDataUrl: function (file, cb) {
      if (!file || file.type.indexOf('image') !== 0) return cb(null);
      var reader = new FileReader();
      reader.onerror = function () { cb(null); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { cb(null); };
        img.onload = function () {
          var data = reader.result;
          if (data.length < AVATAR_MAX) return cb(data);
          var s = Math.min(1, 900 / Math.max(img.width, img.height));
          var canvas = document.createElement('canvas');
          canvas.width = Math.ceil(img.width * s);
          canvas.height = Math.ceil(img.height * s);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          cb(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    },

    AVATAR_MAX: AVATAR_MAX,

    /** Seed a few demo posts so the feed isn't empty on first visit. */
    seedIfEmpty: function () {
      if (readPosts().length) return;
      var now = Date.now();
      writePosts([
        {
          id: uid(), author: 'demo@facecome.app', type: 'text',
          text: 'Good morning Facecome! ☀️ Each day your voice rises like a new sun — say hi below!',
          media: null, createdAt: now - 3 * 3600e3,
          likes: [], comments: [{ author: 'maya@facecome.app', text: 'Morning! Love this 🌅', createdAt: now - 2 * 3600e3 }],
          invites: null
        },
        {
          id: uid(), author: 'maya@facecome.app', type: 'text',
          text: 'Game night at my place this Friday 🎮 who wants in?',
          media: null, createdAt: now - 2 * 3600e3,
          likes: ['demo@facecome.app'], comments: [],
          invites: { title: 'Game night at my place', joined: ['demo@facecome.app'] }
        },
        {
          id: uid(), author: 'leo@facecome.app', type: 'text',
          text: 'Dropped my first vlog here 🎬 feedback welcome!',
          media: null, createdAt: now - 1800e3,
          likes: [], comments: [{ author: 'maya@facecome.app', text: 'Watched twice 😍', createdAt: now - 900e3 }],
          invites: null
        }
      ]);
    },

    _clearAll: function () { writePosts([]); }
  };
})();
