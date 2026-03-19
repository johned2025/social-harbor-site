/**
 * add-friend.js
 *
 * Responsibilities:
 *  1. Extract the contact string from the URL path (/add-friend/<contactString>)
 *  2. Decode base64 → JSON → extract displayName and peerId
 *  3. Show State A (valid) or State B (invalid)
 *  4. Handle "Open in Harbor" click with deep link + fallback timeout
 *  5. Highlight the correct download button for the user's platform
 */

(function () {

  // ── 1. Extract contact string from URL path ──────────────────────────────
  //
  // URL format: https://social-harbor.com/add-friend/<contactString>
  // window.location.pathname is something like: /add-friend/eyJtdWx0aWFkZHIi...
  // We split on '/add-friend/' and take everything after it.

  const pathParts = window.location.pathname.split('/add-friend/');
  let rawContactString = pathParts.length > 1 ? pathParts[1] : '';

  // Discard if the pathname gave us a filename instead of a contact string.
  // This happens in local testing where the URL is /add-friend/index.html?c=...
  // and split('/add-friend/') captures 'index.html' instead of a base64 string.
  if (rawContactString.includes('.')) {
    rawContactString = '';
  }

  // LOCAL TESTING ONLY — query parameter fallback.
  // Python's static server can't route /add-friend/<contactString> to this file,
  // so during local development use ?c=<contactString> instead:
  //   http://localhost:8080/add-friend/index.html?c=eyJ...
  // This fallback is never triggered in production because Vercel's rewrite
  // rule serves this file for any /add-friend/* path, making pathname work.
  //
  // Note: we use a regex + decodeURIComponent instead of URLSearchParams.get()
  // because URLSearchParams converts + to spaces (form encoding), which would
  // corrupt base64 strings that contain + characters before atob() can decode them.
  if (!rawContactString) {
    const match = window.location.search.match(/[?&]c=([^&]*)/);
    rawContactString = match ? decodeURIComponent(match[1]) : '';
  }

  // ── 2. Decode the contact string ─────────────────────────────────────────
  //
  // The contact string is URL-safe base64 (no padding) encoding a JSON object.
  // Harbor's Rust backend uses URL_SAFE_NO_PAD (from the base64 crate), which:
  //   - Replaces + with -
  //   - Replaces / with _
  //   - Omits = padding
  //
  // To decode in JS we must reverse those substitutions before calling atob().

  function decodeContactString(contactString) {
    try {
      if (!contactString) return null;

      // Restore standard base64 characters from URL-safe variant
      const b64 = contactString
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      // Add = padding so the length is a multiple of 4
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);

      // Decode base64 → JSON string → object
      const json = atob(padded);
      const bundle = JSON.parse(json);

      // Validate required fields per ContactBundle format
      if (!bundle.multiaddr || !bundle.displayName) return null;

      // Extract peerId: last segment of the multiaddr after /p2p/
      const parts = bundle.multiaddr.split('/');
      const peerId = parts[parts.length - 1];

      return {
        displayName: bundle.displayName,
        peerId: peerId,
        bio: bundle.bio || null,
        // Preserve the original string to pass to the deep link unchanged
        raw: contactString,
      };

    } catch (e) {
      return null;
    }
  }

  const contact = decodeContactString(rawContactString);

  // ── 3. Show the correct state ────────────────────────────────────────────

  const stateValid   = document.getElementById('state-valid');
  const stateInvalid = document.getElementById('state-invalid');

  if (contact) {
    // Populate the valid state UI
    document.getElementById('contact-name').textContent = contact.displayName;
    document.getElementById('peer-id').textContent = contact.peerId;

    // Update page title and OG title with the real contact name
    document.title = contact.displayName + ' wants to connect — Harbor';

    // Show valid state
    stateValid.classList.remove('hidden');

  } else {
    // Show invalid state
    stateInvalid.classList.remove('hidden');
  }

  // ── 4. "Open in Harbor" deep link + fallback ─────────────────────────────
  //
  // When clicked, we navigate to harbor://add-friend/<contactString>.
  // If the app is installed, the OS intercepts this and opens Harbor.
  // If the app is NOT installed, the browser silently ignores the protocol
  // and the page stays visible. We detect this case with a 3-second timeout:
  // if the page is still visible after 3s, the app probably didn't open.

  const openBtn = document.getElementById('open-in-harbor');
  const fallbackMsg = document.getElementById('fallback-message');

  if (openBtn && contact) {
    openBtn.addEventListener('click', function () {
      // Construct the deep link URL
      const deepLink = 'harbor://add-friend/' + contact.raw;

      // Navigate to the deep link — if Harbor is installed the OS handles it
      window.location.href = deepLink;

      // Start the fallback timer
      const fallbackTimer = setTimeout(function () {
        // Page is still visible — Harbor likely isn't installed
        if (!document.hidden) {
          fallbackMsg.style.display = 'block';
        }
      }, 3000);

      // If the user switches away (app opened), cancel the fallback
      document.addEventListener('visibilitychange', function onVisChange() {
        if (document.hidden) {
          clearTimeout(fallbackTimer);
          document.removeEventListener('visibilitychange', onVisChange);
        }
      });
    });
  }

  // ── 5. Platform detection — highlight the correct download button ─────────
  //
  // We check navigator.userAgent to determine the OS and add the
  // 'highlighted' class to the matching download button so it stands out.

  function detectPlatform() {
    const ua = navigator.userAgent;
    if (/Win/i.test(ua))     return 'windows';
    if (/Mac/i.test(ua))     return 'macos';
    if (/Linux/i.test(ua))   return 'linux';
    return null;
  }

  const platform = detectPlatform();
  if (platform) {
    // Apply to both the valid state and invalid state download buttons
    const btns = document.querySelectorAll('#dl-' + platform);
    btns.forEach(function (btn) {
      btn.classList.add('highlighted');
    });
  }

})();
