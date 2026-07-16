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

  // Restore the current draft normally. The explicit recovery query is used
  // only to recover reviewed edits saved before the course was republished.
  try {
    var recoverLegacy = new URLSearchParams(location.search).get('restoreDraft') === 'legacy';
    var currentSaved = localStorage.getItem(storageKey);
    var legacySaved = recoverLegacy ? localStorage.getItem('editv1:' + location.pathname) : null;
    var saved = legacySaved || currentSaved;
    if (saved) {
      var data = JSON.parse(saved);
      if (data.body) editable.innerHTML = data.body;
      if (data.title && titleEl) titleEl.textContent = data.title;
      document.documentElement.setAttribute(
        'data-restored-course-draft',
        legacySaved ? 'legacy' : 'current'
      );
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

/* Normalize imported course content while preserving learner edits and source links. */
(function () {
  "use strict";
  var body = document.querySelector('.lesson-body');
  if (!body || document.documentElement.hasAttribute('data-restored-course-draft')) return;

  var official = {
    cli: 'https://docs.uipath.com/uipath-cli/standalone/latest/user-guide/uip-codedagent',
    about: 'https://docs.uipath.com/agents/automation-cloud/latest/user-guide/about-coded-agents',
    build: 'https://docs.uipath.com/agents/automation-cloud/latest/user-guide/building-and-deploying-coded-agents',
    sdk: 'https://docs.uipath.com/sdk/other/latest/developer-guide/using-agents-sdks',
    studio: 'https://docs.uipath.com/agents/automation-cloud/latest/user-guide/coded-agents-in-studio-web',
    traces: 'https://docs.uipath.com/agents/automation-cloud/latest/user-guide/running-the-agent'
  };

  function exact(selector, value) {
    return Array.prototype.find.call(body.querySelectorAll(selector), function (el) {
      return el.textContent.trim() === value;
    });
  }
  function prefix(selector, value) {
    return Array.prototype.find.call(body.querySelectorAll(selector), function (el) {
      return el.textContent.trim().indexOf(value) === 0;
    });
  }
  function replaceRange(first, last, html) {
    if (!first || !last) return;
    var holder = document.createElement('div');
    holder.innerHTML = html;
    while (holder.firstChild) first.parentNode.insertBefore(holder.firstChild, first);
    var node = first;
    while (node) {
      var next = node.nextSibling;
      node.remove();
      if (node === last) break;
      node = next;
    }
  }
  function makeSourceLink(label, url) {
    var el = exact('li,p,h3', label);
    if (!el || el.querySelector('a')) return;
    el.textContent = '';
    var a = document.createElement('a');
    a.className = 'inline-source-link';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = label;
    el.appendChild(a);
  }

  var replacements = {
    'decisionmaking': 'decision-making', 'contextaware': 'context-aware',
    'UIbased': 'UI-based', 'humanin-the-loop': 'human-in-the-loop',
    'LlamaIndexbased': 'LlamaIndex-based', 'CustomerManaged': 'Customer-Managed',
    'debuggin': 'debugging', 'end-tothose': 'end-to-end processes'
  };
  var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  var textNodes = [], current;
  while ((current = walker.nextNode())) textNodes.push(current);
  textNodes.forEach(function (node) {
    Object.keys(replacements).forEach(function (bad) {
      node.nodeValue = node.nodeValue.split(bad).join(replacements[bad]);
    });
  });

  ['UiPath CLI Agent Commands', 'Building and Deploying Coded Agents',
   'Agent SDKs (Python, LangGraph, LlamaIndex)', 'Coded Agents in Studio Web - Debug & Evaluation',
   'Complete Coded Agents Guide'].forEach(function (label, index) {
    makeSourceLink(label, [official.cli, official.build, official.sdk, official.studio, official.about][index]);
  });
  makeSourceLink('About Coded Agents', official.about);
  makeSourceLink('Agents SDKs', official.sdk);
  makeSourceLink('Agent Traces', official.traces);

  var lesson = (location.pathname.match(/lesson-(\d{2})\.html$/) || [])[1];
  if (lesson === '01') {
    replaceRange(document.querySelector('#supervised-agent'), prefix('p', 'In this lesson, you explored the foundations'),
      '<h2>Supervised and Autonomous Agents</h2><div class="course-table-wrap"><table class="course-table"><thead><tr><th>Agent type</th><th>How it operates</th><th>Best fit</th></tr></thead><tbody><tr><th>Supervised agent</th><td>Works with human review or approval at important decision points.</td><td>High-risk, regulated, or exception-heavy work.</td></tr><tr><th>Autonomous agent</th><td>Runs independently within defined goals, policies, and guardrails.</td><td>Repeatable decisions where automated monitoring is sufficient.</td></tr></tbody></table></div><p>In this lesson, you explored the foundations of agentic automation, the UiPath agent types, and when to apply supervised or autonomous execution.</p>');
  }
  if (lesson === '02') {
    replaceRange(document.querySelector('#agentic-automation-use-case'), prefix('p', 'In this lesson, you learned how to identify'),
      '<h2>Classifying Automation Opportunities</h2><div class="course-table-wrap"><table class="course-table"><thead><tr><th>Scenario</th><th>Recommended approach</th></tr></thead><tbody><tr><th>Stable rules and structured inputs</th><td>Use deterministic RPA.</td></tr><tr><th>Judgment, ambiguity, and contextual decisions</th><td>Use an agentic workflow with appropriate guardrails.</td></tr><tr><th>Judgment plus repetitive system actions</th><td>Combine agents with RPA and human review where needed.</td></tr></tbody></table></div><p>In this lesson, you learned how to identify, assess, and prioritize suitable use cases for agentic automation.</p>');
  }
  if (lesson === '03') {
    var actions = document.querySelector('#actions-behaviors');
    if (actions && actions.nextElementSibling && actions.nextElementSibling.id === 'userssystemsagent-interactions') {
      actions.insertAdjacentHTML('afterend', '<p>Define the tools, decisions, and system actions the agent is allowed to perform.</p>');
    }
    replaceRange(document.querySelector('#agent-persona'), prefix('p', 'In this lesson, you learned how to design'),
      '<h2>Agent Story Mapping</h2><div class="course-table-wrap"><table class="course-table"><thead><tr><th>Story element</th><th>Design question</th></tr></thead><tbody><tr><th>Agent persona</th><td>What role, expertise, tone, and responsibilities should the agent have?</td></tr><tr><th>Goal</th><td>What measurable outcome must the agent achieve?</td></tr><tr><th>Context</th><td>Which policies, data, and business constraints guide its decisions?</td></tr><tr><th>Actions and interactions</th><td>Which tools may it use, and when must a person or system participate?</td></tr></tbody></table></div><p>In this lesson, you learned how to design clear agent stories and translate them into reliable workflows.</p>');
  }
  if (lesson === '04') {
    var rag = document.querySelector('#retrieval-augmented-generation-rag-and');
    if (rag && rag.nextElementSibling && /^H[23]$/.test(rag.nextElementSibling.tagName)) {
      rag.textContent = 'Retrieval-Augmented Generation (RAG) and Context Grounding';
      rag.nextElementSibling.remove();
    }
    ['Compliance', 'Data Governance', 'Operational Limits', 'Transparency'].forEach(function (label) {
      var el = exact('p', label); if (el) { var h = document.createElement('h3'); h.textContent = label; el.replaceWith(h); }
    });
    var tail = exact('p', 'automation projects.');
    if (tail && tail.previousElementSibling && tail.previousElementSibling.tagName === 'P') {
      tail.previousElementSibling.textContent += ' ' + tail.textContent; tail.remove();
    }
  }
  if (lesson === '07') {
    replaceRange(document.querySelector('#purpose'), document.querySelector('#knowledge-indexes-and-context-grounding'),
      '<h2>Integration Methods and Purpose</h2><div class="course-table-wrap"><table class="course-table"><thead><tr><th>Method</th><th>Purpose</th></tr></thead><tbody><tr><th>APIs and connectors</th><td>Exchange structured data with enterprise applications and services.</td></tr><tr><th>UiPath automations and robots</th><td>Execute UI-based and end-to-end processes when an API is unavailable.</td></tr><tr><th>Knowledge Indexes (Context Grounding)</th><td>Retrieve trusted organizational policies, procedures, and documents.</td></tr><tr><th>Business data</th><td>Use operational records and process context to support accurate decisions.</td></tr></tbody></table></div>');
    var intro = document.querySelector('#introduction-to-hybrid-agentic-and-rpa-workflow');
    var steps = intro ? body.querySelector('ol.steps') : null;
    if (steps) steps.innerHTML = '<li>Receive the business request and validate the required inputs.</li><li>Use the agent to interpret intent, policies, and contextual information.</li><li>Retrieve trusted knowledge or enterprise data through approved integrations.</li><li>Invoke UiPath automations or APIs to complete deterministic system actions.</li><li>Route exceptions or high-risk decisions to a human reviewer.</li><li>Record outcomes, traces, and feedback for monitoring and continuous improvement.</li>';
  }
  if (lesson === '09') {
    var refs = document.querySelector('#reference-links'); if (refs) refs.textContent = 'Official Reference Links';
  }
  if (lesson === '10') {
    var sources = prefix('p', 'Sources:');
    if (sources) sources.innerHTML = 'Source: <a class="inline-source-link" target="_blank" rel="noopener noreferrer" href="' + official.build + '">Building and Deploying Coded Agents</a>';
  }
  if (lesson === '11') {
    var architecture = document.querySelector('#core-architectural-pillars-of-uipath-coded-agents');
    var quiz = body.querySelector('.quiz');
    if (architecture && quiz) replaceRange(architecture, quiz.previousElementSibling,
      '<h2 id="core-architectural-pillars-of-uipath-coded-agents">Core Architectural Pillars of UiPath Coded Agents</h2><div class="course-table-wrap"><table class="course-table"><thead><tr><th>Pillar</th><th>Responsibility</th></tr></thead><tbody><tr><th>Agent logic</th><td>Defines goals, reasoning, orchestration, and tool selection.</td></tr><tr><th>Tools and integrations</th><td>Connects the agent to APIs, UiPath automations, and enterprise systems.</td></tr><tr><th>Context and memory</th><td>Supplies trusted knowledge, process data, and state needed for decisions.</td></tr><tr><th>Governance and observability</th><td>Applies access controls, human oversight, traces, evaluation, and monitoring.</td></tr></tbody></table></div><h3>Execution lifecycle</h3><p>A coded agent receives a request, gathers approved context, selects tools, performs actions, and records the result for review and improvement.</p><h3>Deployment model</h3><p>Package and deploy the agent through UiPath so that authentication, dependencies, bindings, and runtime governance remain centrally managed.</p><h3>Operational responsibility</h3><p>Use least-privilege access, human approval for sensitive decisions, and continuous monitoring of quality, cost, latency, and failures.</p>');
    Array.prototype.forEach.call(body.querySelectorAll('h2,h3'), function (el) {
      if (el.textContent.trim() === 'TYPE' || el.textContent.trim() === 'Sources') el.remove();
    });
  }
  if (lesson === '14') { var fourFive = exact('p', '4 5'); if (fourFive) fourFive.remove(); }
  if (lesson === '21') { var threeFour = exact('p', '3 4'); if (threeFour) threeFour.remove(); }
})();
