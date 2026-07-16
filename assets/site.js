(function () {
  "use strict";

  // ---------- Mobile sidebar toggle ----------
  var toggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('backdrop');
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
  }
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('is-open');
      if (backdrop) backdrop.classList.toggle('is-open');
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // Scroll the active lesson into view in the sidebar rail
  var active = document.querySelector('.rail__item.is-active');
  if (active && active.scrollIntoView) {
    active.scrollIntoView({ block: 'center' });
  }

  // ---------- Tabs widgets ----------
  document.querySelectorAll('.tabs').forEach(function (widget) {
    var buttons = widget.querySelectorAll('.tabs__btn');
    var panels = widget.querySelectorAll('.tabs__panel');
    buttons.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        if (panels[idx]) panels[idx].classList.add('is-active');
      });
    });
  });

  // ---------- Flashcards ----------
  document.querySelectorAll('.flashcard').forEach(function (card) {
    card.addEventListener('click', function () {
      var flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    });
  });

  // ---------- Knowledge-check quizzes ----------
  document.querySelectorAll('.quiz').forEach(function (card) {
    var options = card.querySelectorAll('.quiz__option');
    var checkBtn = card.querySelector('.quiz__btn');
    var feedback = card.querySelector('.quiz__feedback');
    if (!checkBtn) return;

    checkBtn.addEventListener('click', function () {
      var selected = card.querySelector('input[type="radio"]:checked');
      options.forEach(function (o) { o.classList.remove('is-correct', 'is-wrong'); });

      if (!selected) {
        if (feedback) {
          feedback.textContent = 'Choose an option first, then check your answer.';
          feedback.classList.remove('is-correct', 'is-wrong');
          feedback.classList.add('is-visible');
        }
        return;
      }

      var selectedLi = selected.closest('.quiz__option');
      var correctLi = card.querySelector('.quiz__option[data-correct="true"]');
      var isRight = selectedLi === correctLi;

      if (correctLi) correctLi.classList.add('is-correct');
      if (!isRight && selectedLi) selectedLi.classList.add('is-wrong');

      if (feedback) {
        var note = feedback.getAttribute('data-note') || '';
        if (correctLi) {
          feedback.textContent = (isRight ? 'Correct. ' : 'Not quite. ') + note;
          feedback.classList.remove('is-correct', 'is-wrong');
          feedback.classList.add(isRight ? 'is-correct' : 'is-wrong', 'is-visible');
        } else {
          feedback.textContent = 'Selected. Compare your reasoning against the lesson content above.';
          feedback.classList.add('is-visible');
        }
      }
    });
  });
})();

// ---------- Lightweight in-browser edit mode ----------
// Lets you tweak the text on this page and either keep the change in this
// browser (auto-restored next time you open the file) or download a
// corrected copy of the HTML file to replace the original with.
(function () {
  "use strict";
  var editable = document.querySelector('.lesson-body') || document.querySelector('.module-list');
  var titleEl = document.querySelector('.lesson-title');
  if (!editable) return;

  // Incremented after publishing the reviewed course copy so an older local
  // draft cannot replace the approved wording or remove its source links.
  var storageKey = 'editv2:' + location.pathname;

  // Restore any previously saved edit for this page
  try {
    var saved = localStorage.getItem(storageKey);
    if (saved) {
      var data = JSON.parse(saved);
      if (data.body) editable.innerHTML = data.body;
      if (data.title && titleEl) titleEl.textContent = data.title;
    }
  } catch (e) { /* ignore corrupted storage */ }

  var bar = document.createElement('div');
  bar.className = 'edit-bar';
  bar.innerHTML =
    '<button type="button" class="edit-bar__btn" id="editToggle">Edit this page</button>' +
    '<span class="edit-bar__actions" id="editActions" hidden>' +
    '<button type="button" class="edit-bar__btn edit-bar__btn--save" id="editSave">Save in this browser</button>' +
    '<button type="button" class="edit-bar__btn" id="editDownload">Download edited HTML</button>' +
    '<button type="button" class="edit-bar__btn edit-bar__btn--reset" id="editReset">Revert</button>' +
    '</span>';
  document.body.appendChild(bar);

  var toggleBtn = bar.querySelector('#editToggle');
  var actions = bar.querySelector('#editActions');
  var saveBtn = bar.querySelector('#editSave');
  var downloadBtn = bar.querySelector('#editDownload');
  var resetBtn = bar.querySelector('#editReset');
  var editing = false;

  function setEditing(on) {
    editing = on;
    editable.contentEditable = on ? 'true' : 'false';
    if (titleEl) titleEl.contentEditable = on ? 'true' : 'false';
    editable.classList.toggle('is-editing', on);
    actions.hidden = !on;
    toggleBtn.textContent = on ? 'Stop editing' : 'Edit this page';
  }

  toggleBtn.addEventListener('click', function () { setEditing(!editing); });

  saveBtn.addEventListener('click', function () {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        body: editable.innerHTML,
        title: titleEl ? titleEl.textContent : undefined
      }));
      flash(saveBtn, 'Saved');
    } catch (e) {
      flash(saveBtn, 'Could not save');
    }
  });

  resetBtn.addEventListener('click', function () {
    localStorage.removeItem(storageKey);
    location.reload();
  });

  downloadBtn.addEventListener('click', function () {
    var clone = document.documentElement.cloneNode(true);
    var cloneBar = clone.querySelector('.edit-bar');
    if (cloneBar) cloneBar.remove();
    clone.querySelectorAll('[contenteditable]').forEach(function (n) {
      n.removeAttribute('contenteditable');
    });

    // Keep formatting, lesson navigation, images, and source links working
    // when the downloaded HTML is opened outside the website folder.
    clone.querySelectorAll('link[href], script[src], img[src], a[href]').forEach(function (n) {
      var attribute = n.hasAttribute('href') ? 'href' : 'src';
      var value = n.getAttribute(attribute);
      if (!value || value.charAt(0) === '#' || /^(?:data:|mailto:|tel:|javascript:)/i.test(value)) return;
      try { n.setAttribute(attribute, new URL(value, document.baseURI).href); } catch (e) { /* keep original */ }
    });

    var html = '<!DOCTYPE html>\n' + clone.outerHTML;
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var name = location.pathname.split('/').pop() || 'page.html';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  function flash(btn, msg) {
    var original = btn.textContent;
    btn.textContent = msg;
    setTimeout(function () { btn.textContent = original; }, 1600);
  }
})();

/* Estimated completion time for each lesson on the course overview. */
(function () {
  "use strict";
  var durations = [
    "30 min", "30 min", "45 min", "45 min", "45 min", "1 hr",
    "45 min", "45 min", "1 hr", "45 min", "30 min", "1 hr",
    "30 min", "45 min", "30 min", "45 min", "30 min", "45 min",
    "30 min", "30 min", "1 hr", "45 min", "30 min"
  ];

  document.querySelectorAll('.lesson-card').forEach(function (card, index) {
    var meta = card.querySelector('.lesson-card__meta');
    if (!meta || !durations[index] || meta.querySelector('.lesson-duration')) return;
    var badge = document.createElement('span');
    badge.className = 'lesson-duration';
    badge.setAttribute('aria-label', 'Estimated duration ' + durations[index]);
    badge.textContent = '\u23F1 ' + durations[index];
    meta.appendChild(badge);
  });
})();
(function () {
  "use strict";

  // ---------- Mobile sidebar toggle ----------
  var toggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('backdrop');
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
  }
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('is-open');
      if (backdrop) backdrop.classList.toggle('is-open');
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // Scroll the active lesson into view in the sidebar rail
  var active = document.querySelector('.rail__item.is-active');
  if (active && active.scrollIntoView) {
    active.scrollIntoView({ block: 'center' });
  }

  // ---------- Tabs widgets ----------
  document.querySelectorAll('.tabs').forEach(function (widget) {
    var buttons = widget.querySelectorAll('.tabs__btn');
    var panels = widget.querySelectorAll('.tabs__panel');
    buttons.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        if (panels[idx]) panels[idx].classList.add('is-active');
      });
    });
  });

  // ---------- Flashcards ----------
  document.querySelectorAll('.flashcard').forEach(function (card) {
    card.addEventListener('click', function () {
      var flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    });
  });

  // ---------- Knowledge-check quizzes ----------
  document.querySelectorAll('.quiz').forEach(function (card) {
    var options = card.querySelectorAll('.quiz__option');
    var checkBtn = card.querySelector('.quiz__btn');
    var feedback = card.querySelector('.quiz__feedback');
    if (!checkBtn) return;

    checkBtn.addEventListener('click', function () {
      var selected = card.querySelector('input[type="radio"]:checked');
      options.forEach(function (o) { o.classList.remove('is-correct', 'is-wrong'); });

      if (!selected) {
        if (feedback) {
          feedback.textContent = 'Choose an option first, then check your answer.';
          feedback.classList.remove('is-correct', 'is-wrong');
          feedback.classList.add('is-visible');
        }
        return;
      }

      var selectedLi = selected.closest('.quiz__option');
      var correctLi = card.querySelector('.quiz__option[data-correct="true"]');
      var isRight = selectedLi === correctLi;

      if (correctLi) correctLi.classList.add('is-correct');
      if (!isRight && selectedLi) selectedLi.classList.add('is-wrong');

      if (feedback) {
        var note = feedback.getAttribute('data-note') || '';
        if (correctLi) {
          feedback.textContent = (isRight ? 'Correct. ' : 'Not quite. ') + note;
          feedback.classList.remove('is-correct', 'is-wrong');
          feedback.classList.add(isRight ? 'is-correct' : 'is-wrong', 'is-visible');
        } else {
          feedback.textContent = 'Selected. Compare your reasoning against the lesson content above.';
          feedback.classList.add('is-visible');
        }
      }
    });
  });
})();

// ---------- Lightweight in-browser edit mode ----------
// Lets you tweak the text on this page and either keep the change in this
// browser (auto-restored next time you open the file) or download a
// corrected copy of the HTML file to replace the original with.
(function () {
  "use strict";
  var editable = document.querySelector('.lesson-body') || document.querySelector('.module-list');
  var titleEl = document.querySelector('.lesson-title');
  if (!editable) return;

  var storageKey = 'editv1:' + location.pathname;

  // Restore any previously saved edit for this page
  try {
    var saved = localStorage.getItem(storageKey);
    if (saved) {
      var data = JSON.parse(saved);
      if (data.body) editable.innerHTML = data.body;
      if (data.title && titleEl) titleEl.textContent = data.title;
    }
  } catch (e) { /* ignore corrupted storage */ }

  var bar = document.createElement('div');
  bar.className = 'edit-bar';
  bar.innerHTML =
    '<button type="button" class="edit-bar__btn" id="editToggle">Edit this page</button>' +
    '<span class="edit-bar__actions" id="editActions" hidden>' +
    '<button type="button" class="edit-bar__btn edit-bar__btn--save" id="editSave">Save in this browser</button>' +
    '<button type="button" class="edit-bar__btn" id="editDownload">Download edited HTML</button>' +
    '<button type="button" class="edit-bar__btn edit-bar__btn--reset" id="editReset">Revert</button>' +
    '</span>';
  document.body.appendChild(bar);

  var toggleBtn = bar.querySelector('#editToggle');
  var actions = bar.querySelector('#editActions');
  var saveBtn = bar.querySelector('#editSave');
  var downloadBtn = bar.querySelector('#editDownload');
  var resetBtn = bar.querySelector('#editReset');
  var editing = false;

  function setEditing(on) {
    editing = on;
    editable.contentEditable = on ? 'true' : 'false';
    if (titleEl) titleEl.contentEditable = on ? 'true' : 'false';
    editable.classList.toggle('is-editing', on);
    actions.hidden = !on;
    toggleBtn.textContent = on ? 'Stop editing' : 'Edit this page';
  }

  toggleBtn.addEventListener('click', function () { setEditing(!editing); });

  saveBtn.addEventListener('click', function () {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        body: editable.innerHTML,
        title: titleEl ? titleEl.textContent : undefined
      }));
      flash(saveBtn, 'Saved');
    } catch (e) {
      flash(saveBtn, 'Could not save');
    }
  });

  resetBtn.addEventListener('click', function () {
    localStorage.removeItem(storageKey);
    location.reload();
  });

  downloadBtn.addEventListener('click', function () {
    var clone = document.documentElement.cloneNode(true);
    var cloneBar = clone.querySelector('.edit-bar');
    if (cloneBar) cloneBar.remove();
    clone.querySelectorAll('[contenteditable]').forEach(function (n) {
      n.removeAttribute('contenteditable');
    });
    var html = '<!DOCTYPE html>\n' + clone.outerHTML;
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var name = location.pathname.split('/').pop() || 'page.html';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  function flash(btn, msg) {
    var original = btn.textContent;
    btn.textContent = msg;
    setTimeout(function () { btn.textContent = original; }, 1600);
  }
})();

/* Estimated completion time for each lesson on the course overview. */
(function () {
  "use strict";
  var durations = [
    "30 min", "30 min", "45 min", "45 min", "45 min", "1 hr",
    "45 min", "45 min", "1 hr", "45 min", "30 min", "1 hr",
    "30 min", "45 min", "30 min", "45 min", "30 min", "45 min",
    "30 min", "30 min", "1 hr", "45 min", "30 min"
  ];

  document.querySelectorAll('.lesson-card').forEach(function (card, index) {
    var meta = card.querySelector('.lesson-card__meta');
    if (!meta || !durations[index] || meta.querySelector('.lesson-duration')) return;
    var badge = document.createElement('span');
    badge.className = 'lesson-duration';
    badge.setAttribute('aria-label', 'Estimated duration ' + durations[index]);
    badge.textContent = '\u23F1 ' + durations[index];
    meta.appendChild(badge);
  });
})();
