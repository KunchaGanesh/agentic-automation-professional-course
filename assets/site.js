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

// Public GitHub Pages course is view-only.
// Course owners edit the source safely in the GitHub repository.

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

/* Final structural cleanup for imported headings, paragraphs, and references. */
(function () {
  "use strict";
  var body = document.querySelector('.lesson-body');
  if (!body || document.documentElement.hasAttribute('data-restored-course-draft')) return;
  var lesson = (location.pathname.match(/lesson-(\d{2})\.html$/) || [])[1];
  var urls = {
    'About Coded Agents': 'https://docs.uipath.com/agents/automation-cloud/latest/user-guide/about-coded-agents',
    'Complete Coded Agents Guide': 'https://docs.uipath.com/agents/automation-cloud/latest/user-guide/about-coded-agents',
    'Building and Deploying Coded Agents': 'https://docs.uipath.com/agents/automation-cloud/latest/user-guide/building-and-deploying-coded-agents',
    'UiPath SDKs & Frameworks': 'https://docs.uipath.com/sdk/other/latest/developer-guide/using-agents-sdks',
    'UiPath CLI Installation': 'https://docs.uipath.com/uipath-cli/standalone/latest/user-guide/uip-codedagent',
    'uip rpa pack': 'https://docs.uipath.com/uipath-cli/standalone/latest/user-guide/uip-codedagent',
    'uip rpa-legacy package': 'https://docs.uipath.com/uipath-cli/standalone/latest/user-guide/uip-codedagent',
    'About Assets': 'https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/about-assets',
    'Managing Processes': 'https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/about-processes',
    'Creating Agent Escalations with Action Apps': 'https://docs.uipath.com/action-center/automation-cloud/latest/user-guide/quick-start-guide-for-app-actions-and-agents'
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
    var box = document.createElement('div'); box.innerHTML = html;
    while (box.firstChild) first.parentNode.insertBefore(box.firstChild, first);
    var node = first;
    while (node) { var next = node.nextSibling; node.remove(); if (node === last) break; node = next; }
  }
  function linkedHeading(el, label, url) {
    if (!el) return;
    el.textContent = '';
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.className = 'inline-source-link'; a.textContent = label;
    el.appendChild(a);
  }

  if (lesson === '06') {
    var compareStart = document.querySelector('#compare-the-two-retrieval-methods-for-knowledge-search');
    var quickReview = exact('p', 'Quick Review: Retrieval Approaches');
    replaceRange(compareStart, quickReview,
      '<h2 id="compare-the-two-retrieval-methods-for-knowledge-search">Compare the Two Retrieval Methods for Knowledge Search</h2>' +
      '<p>Semantic Search is optimized for fast, direct retrieval, while DeepRAG adds reasoning across multiple sources for complex questions.</p>' +
      '<div class="course-table-wrap"><table class="course-table"><thead><tr><th>Feature</th><th>Semantic Search</th><th>DeepRAG</th></tr></thead><tbody>' +
      '<tr><th>Purpose</th><td>Retrieves the most relevant indexed content using semantic similarity.</td><td>Retrieves, analyzes, and synthesizes information from multiple sources.</td></tr>' +
      '<tr><th>Response speed</th><td>Faster for straightforward lookups.</td><td>Typically slower because it performs additional retrieval and reasoning.</td></tr>' +
      '<tr><th>Complexity handling</th><td>Best for questions answered by a specific document or content chunk.</td><td>Best for multipart questions that require cross-document reasoning.</td></tr>' +
      '<tr><th>Answer generation</th><td>Returns the most relevant retrieved content.</td><td>Generates a synthesized response from the gathered information.</td></tr>' +
      '<tr><th>Source references</th><td>Provides the relevant retrieved content from the knowledge base.</td><td>Includes citations and references to the source material used.</td></tr>' +
      '<tr><th>Best use cases</th><td>FAQs, policy lookups, product information, and direct knowledge retrieval.</td><td>Research questions, policy interpretation, cross-document analysis, and complex reasoning.</td></tr>' +
      '</tbody></table></div>' +
      '<h3>Semantic Search example</h3><p>“What is our return policy?” The system retrieves the document sections most closely related to the question, even when the exact wording differs.</p>' +
      '<h3>DeepRAG example</h3><p>“How do I request parental leave while maintaining health insurance benefits?” DeepRAG combines relevant information from multiple HR policy documents and cites the sources used.</p>' +
      '<h2>Quick Review: Retrieval Approaches</h2>');
  }

  if (lesson === '07') {
    var steps = body.querySelector('ol.steps');
    if (steps) {
      steps.className = 'clean-steps';
      steps.innerHTML = '<li><strong>Receive and validate the request.</strong><span>Confirm the business goal and required inputs.</span></li><li><strong>Interpret intent and context.</strong><span>Apply policies, knowledge, and approved business context.</span></li><li><strong>Retrieve trusted enterprise information.</strong><span>Use approved APIs, connectors, and Knowledge Indexes.</span></li><li><strong>Execute deterministic actions.</strong><span>Invoke UiPath automations or APIs to complete system work.</span></li><li><strong>Escalate sensitive decisions.</strong><span>Route exceptions and high-risk decisions to a human reviewer.</span></li><li><strong>Record and improve.</strong><span>Capture outcomes, traces, and feedback for continuous improvement.</span></li>';
    }
  }

  if (lesson === '08') {
    var classify = document.querySelector('#classify-items-performance-compliance-or-improvement');
    var congratulations = prefix('p', 'Congratulations on completing the course!');
    if (classify && congratulations) replaceRange(classify, congratulations.previousElementSibling,
      '<h2 id="classify-items-performance-compliance-or-improvement">Performance, Compliance, and Improvement</h2>' +
      '<div class="course-table-wrap"><table class="course-table"><thead><tr><th>Category</th><th>Examples</th></tr></thead><tbody>' +
      '<tr><th>Performance metrics</th><td>Response accuracy, completion rate, response time, and exception frequency.</td></tr>' +
      '<tr><th>Compliance mechanisms</th><td>Human escalation for ambiguous cases and an audit trail of agent decisions.</td></tr>' +
      '<tr><th>Continuous improvement</th><td>Scheduled reviews, refreshed indexes and models, evaluation results, and stakeholder feedback.</td></tr>' +
      '</tbody></table></div>');
  }

  if (lesson === '09') {
    var prereq = document.querySelector('#coded-agents-prerequisites-python-setup-about-coded-agents');
    if (prereq) prereq.textContent = 'Coded Agent Prerequisites and Python Setup';
    linkedHeading(document.querySelector('#uipath-sdks-frameworks'), 'UiPath SDKs & Frameworks', urls['UiPath SDKs & Frameworks']);
    linkedHeading(document.querySelector('#uipath-cli-installation'), 'UiPath CLI Installation', urls['UiPath CLI Installation']);
    linkedHeading(document.querySelector('#building-and-deploying-coded-agents'), 'Building and Deploying Coded Agents', urls['Building and Deploying Coded Agents']);
  }

  if (lesson === '10') {
    var commandQuestion = document.querySelector('#the-uipath-pack-command-which-cli-command-is-used-to-package-agents');
    if (commandQuestion) { commandQuestion.textContent = 'Which CLI command is used to package agents?'; if (commandQuestion.nextElementSibling) commandQuestion.nextElementSibling.textContent = 'The UiPath pack command bundles the agent code and dependencies into a deployable .nupkg package.'; }
    var versionQuestion = document.querySelector('#versioning-enables-traceability-why-is-versioning-important');
    if (versionQuestion) { versionQuestion.textContent = 'Why is versioning important?'; if (versionQuestion.nextElementSibling) versionQuestion.nextElementSibling.textContent = 'Versioning enables traceability, rollback, and compliance across enterprise automation environments.'; }
    var managing = exact('p', 'Managing Agent Processes within');
    if (managing && managing.nextElementSibling && managing.nextElementSibling.id === 'orchestrator-folders') { managing.nextElementSibling.textContent = 'Managing Agent Processes within Orchestrator Folders'; managing.remove(); }
    var lifecycle = document.querySelector('#visualizing-the-full-lifecycle-from-agent');
    if (lifecycle && lifecycle.nextElementSibling && lifecycle.nextElementSibling.id === 'packaging-to-enterprise-operation') { lifecycle.textContent = 'Visualizing the Full Lifecycle: From Agent Packaging to Enterprise Operation'; lifecycle.nextElementSibling.remove(); }

    var operationsStart = document.querySelector('#process-management-and-governance-in-orchestrator');
    var operationsEnd = document.querySelector('#integrating-coded-agents-with-uipath-assets-buckets-and-processes');
    if (operationsStart && operationsEnd) {
      replaceRange(operationsStart, operationsEnd.previousElementSibling,
        '<h2 id="process-management-and-governance-in-orchestrator">Process Management and Governance in Orchestrator</h2>' +
        '<p>Select each tab to review one operational area at a time.</p>' +
        '<div class="tabs process-tabs">' +
          '<div class="tabs__nav" role="tablist" aria-label="Orchestrator process management topics">' +
            '<button type="button" class="tabs__btn is-active" role="tab" aria-selected="true">Process Creation</button>' +
            '<button type="button" class="tabs__btn" role="tab" aria-selected="false">Folder</button>' +
            '<button type="button" class="tabs__btn" role="tab" aria-selected="false">Scheduling &amp; Monitoring</button>' +
            '<button type="button" class="tabs__btn" role="tab" aria-selected="false">Governance</button>' +
            '<button type="button" class="tabs__btn" role="tab" aria-selected="false">Triggers</button>' +
            '<button type="button" class="tabs__btn" role="tab" aria-selected="false">Alerts</button>' +
          '</div>' +
          '<section class="tabs__panel is-active" role="tabpanel"><h3>Process Creation</h3><p>Navigate to <strong>Automations &gt; Processes</strong> in the folder where you want to deploy, then select <strong>Add</strong>. Choose the agent package from the <strong>Package Source Name</strong> list; the latest package version is selected automatically.</p><p>Before saving, configure runtime argument values, job priority, display name, description, tags, and the applicable retention settings.</p><p class="tab-source">Source: <a class="inline-source-link" href="https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/managing-processes" target="_blank" rel="noopener noreferrer">Managing Processes</a></p></section>' +
          '<section class="tabs__panel" role="tabpanel"><h3>Folder</h3><p>Folders scope Orchestrator resources. Only resources available in the active folder are visible. Assign folder roles with the required folder-level permissions to manage access.</p><p>A folder hierarchy can contain up to seven levels. Access granted on a parent folder is inherited by its subfolders.</p><p class="tab-source">Source: <a class="inline-source-link" href="https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/folders" target="_blank" rel="noopener noreferrer">Folders</a></p></section>' +
          '<section class="tabs__panel" role="tabpanel"><h3>Scheduling &amp; Monitoring</h3><p>Schedule agent execution with an appropriate time, queue, event, or API trigger. Use calendars when executions must avoid non-working days.</p><p>Monitor jobs and agent runs for status, errors, duration, and consumption. Review job details and traces when investigating failures or unexpected behavior.</p><p class="tab-source">Source: <a class="inline-source-link" href="https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/monitoring-agents" target="_blank" rel="noopener noreferrer">Monitoring Agents</a></p></section>' +
          '<section class="tabs__panel" role="tabpanel"><h3>Governance</h3><p>Apply least-privilege folder roles, approved package versions, controlled configuration, auditability, and retention requirements. Separate development, testing, and production resources where appropriate.</p><p>Keep secrets in approved UiPath assets or environment configuration instead of embedding them in agent code.</p><p class="tab-source">Source: <a class="inline-source-link" href="https://docs.uipath.com/agents/automation-cloud/latest/user-guide/about-coded-agents" target="_blank" rel="noopener noreferrer">About Coded Agents</a></p></section>' +
          '<section class="tabs__panel" role="tabpanel"><h3>Triggers</h3><p>Use time triggers for scheduled execution, queue triggers for new queue work, event triggers for integrated application events, and API triggers for external systems.</p><p>Creating a trigger requires folder-level permissions for Triggers and access to the associated process.</p><p class="tab-source">Source: <a class="inline-source-link" href="https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/managing-triggers" target="_blank" rel="noopener noreferrer">Managing Triggers</a></p></section>' +
          '<section class="tabs__panel" role="tabpanel"><h3>Alerts</h3><p>Subscribe to the relevant Orchestrator notifications for job faults, trigger problems, and other operational events. Alert visibility depends on both tenant-level alert access and the required folder-level resource permissions.</p><p>Use alerts with monitoring and traces so the support team can identify the affected process, folder, and execution quickly.</p><p class="tab-source">Source: <a class="inline-source-link" href="https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/notifications" target="_blank" rel="noopener noreferrer">Notifications</a></p></section>' +
        '</div>');

      var processTabs = body.querySelector('.process-tabs');
      var tabButtons = processTabs.querySelectorAll('.tabs__btn');
      var tabPanels = processTabs.querySelectorAll('.tabs__panel');
      tabButtons.forEach(function (button, index) {
        button.addEventListener('click', function () {
          tabButtons.forEach(function (item) { item.classList.remove('is-active'); item.setAttribute('aria-selected', 'false'); });
          tabPanels.forEach(function (panel) { panel.classList.remove('is-active'); });
          button.classList.add('is-active'); button.setAttribute('aria-selected', 'true');
          if (tabPanels[index]) tabPanels[index].classList.add('is-active');
        });
      });
    }
  }

  /* Join paragraphs that were split by the source importer. */
  var changed = true;
  while (changed) {
    changed = false;
    Array.prototype.slice.call(body.querySelectorAll(':scope > p')).forEach(function (p) {
      var next = p.nextElementSibling;
      if (!next || next.tagName !== 'P') return;
      var left = p.textContent.trim(), right = next.textContent.trim();
      if (left && right && !/[.!?:;\u201d"')\]]$/.test(left) && /^[a-z]/.test(right)) {
        p.textContent = left + ' ' + right; next.remove(); changed = true;
      }
    });
  }

  /* Promote short imported labels into consistent bold subsection headings. */
  Array.prototype.slice.call(body.querySelectorAll(':scope > p')).forEach(function (p) {
    var value = p.textContent.trim();
    if (!value || value.length > 70 || /[.!?:;]$/.test(value) || !/^[A-Z]/.test(value)) return;
    if (/^(Source|Sources|Example|Phase|Next|Lesson)\b/i.test(value)) return;
    if (!p.nextElementSibling || p.querySelector('a')) return;
    var h = document.createElement('h3'); h.textContent = value; p.replaceWith(h);
  });

  /* Turn visible source labels into official, clickable UiPath references. */
  Array.prototype.slice.call(body.querySelectorAll('h2,h3,p,li')).forEach(function (el) {
    var value = el.textContent.trim();
    if (!/^(Source|Sources):/i.test(value) || el.querySelector('a')) return;
    var labels = value.replace(/^(Source|Sources):\s*/i, '').split(/\s*\u00b7\s*/);
    if (!labels.join('').trim()) { el.remove(); return; }
    el.textContent = value.indexOf('Sources:') === 0 ? 'Sources: ' : 'Source: ';
    labels.forEach(function (label, index) {
      label = label.trim(); if (index) el.appendChild(document.createTextNode(' \u00b7 '));
      if (urls[label]) { var a = document.createElement('a'); a.href = urls[label]; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'inline-source-link'; a.textContent = label; el.appendChild(a); }
      else el.appendChild(document.createTextNode(label));
    });
  });
})();


/* Course feedback update - 2026-07-30 */
(function () {
  "use strict";
  var match = location.pathname.match(/lesson-(\d{2})\.html$/);
  var lesson = match ? match[1] : "";
  var removed = ["09", "10", "11"];

  if (removed.indexOf(lesson) >= 0) {
    location.replace("../index.html#courseModules");
    return;
  }

  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (/lesson-(09|10|11)\.html/.test(href)) {
      var item = link.closest('.lesson-card') || link.closest('.rail__item');
      if (item) item.remove();
    }
  });

  document.querySelectorAll('.lesson-nav a[href]').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (!/lesson-(09|10|11)\.html/.test(href)) return;
    if (lesson === '08') link.setAttribute('href', 'lesson-12.html');
    if (lesson === '12') link.setAttribute('href', 'lesson-08.html');
  });

  var style = document.createElement('style');
  style.textContent =
    '.feedback-figure{margin:1.7rem 0;padding:1rem;background:#fff;border:1px solid #dfe5e8;border-radius:14px;box-shadow:0 8px 24px rgba(24,32,39,.08)}' +
    '.feedback-figure img{display:block;width:100%;height:auto;border-radius:9px}' +
    '.feedback-figure figcaption{margin-top:.8rem;color:#52616b;font-size:.92rem}' +
    '.feedback-figure a,.feedback-source{color:#c63b13;font-weight:700}' +
    '.feedback-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.25rem 0 2rem}' +
    '.feedback-card{padding:1.1rem;border:1px solid #dfe5e8;border-radius:12px;background:#fff}' +
    '.feedback-card strong{display:block;margin-bottom:.45rem;color:#182027;font-size:1.08rem}' +
    '.cg-best-practices{margin:2rem 0;padding:1.4rem;border-left:7px solid #00a88e;background:#dff6f1;border-radius:12px}' +
    '.cg-best-practices h2,.cg-best-practices h3{color:#006b5b}' +
    '.feedback-flow{display:flex;flex-wrap:wrap;align-items:stretch;gap:.6rem;margin:1.25rem 0 2rem}' +
    '.feedback-node{flex:1 1 145px;padding:1rem;border-radius:12px;background:#fff;border:2px solid #cfd8dc;text-align:center}' +
    '.feedback-node.decision{background:#fff3e8;border-color:#fa4616}' +
    '.feedback-node.result{background:#e8f4ff;border-color:#2874a6}' +
    '.feedback-arrow{align-self:center;color:#fa4616;font-weight:800;font-size:1.35rem}' +
    '.feedback-callout{margin:1rem 0 1.5rem;padding:1rem 1.1rem;background:#f3f6f7;border-left:4px solid #fa4616;border-radius:8px}' +
    '@media(max-width:700px){.feedback-arrow{display:none}}';
  document.head.appendChild(style);

  function heading(text) {
    return Array.prototype.find.call(document.querySelectorAll('.lesson-body h2,.lesson-body h3'), function (el) {
      return el.textContent.toLowerCase().indexOf(text.toLowerCase()) >= 0;
    });
  }
  function after(node, html) {
    if (!node) return;
    var box = document.createElement('div');
    box.innerHTML = html;
    while (box.lastChild) node.parentNode.insertBefore(box.lastChild, node.nextSibling);
  }

  if (lesson === '04') {
    var cg = heading('How Context Grounding Works') || heading('Context Grounding');
    if (cg && !document.querySelector('[data-feedback="cg-architecture"]')) {
      after(cg,
        '<figure class="feedback-figure" data-feedback="cg-architecture">' +
        '<img loading="lazy" src="https://dev-assets.cms.uipath.com/assets/images/automation-cloud/automation-cloud-context-grounding-component-architecture-image-455462-f4f3bbcb-1c579487.webp" alt="UiPath Context Grounding component architecture">' +
        '<figcaption>UiPath Context Grounding architecture: ingestion and indexing, retrieval, RAG, and DeepRAG. Source: <a target="_blank" rel="noopener noreferrer" href="https://docs.uipath.com/automation-cloud/automation-cloud/latest/admin-guide/about-context-grounding">About Context Grounding</a>.</figcaption></figure>');
    }

    var best = heading('Best Practices');
    if (best && !best.closest('.cg-best-practices')) {
      var panel = document.createElement('section');
      panel.className = 'cg-best-practices';
      best.parentNode.insertBefore(panel, best);
      var node = best;
      while (node) {
        var next = node.nextSibling;
        if (node !== best && node.nodeType === 1 && node.tagName === 'H2') break;
        panel.appendChild(node);
        node = next;
      }
      panel.insertAdjacentHTML('beforeend', '<p><strong>Official guidance:</strong> Use descriptive, versioned index names; select Basic ingestion for text-first files and Advanced ingestion for scans, tables, images, and infographics; and continuously evaluate retrieval quality.</p><p><a class="feedback-source" target="_blank" rel="noopener noreferrer" href="https://docs.uipath.com/agents/automation-cloud/latest/user-guide/best-practices-for-context-engineering">UiPath Context Grounding best practices</a></p>');
    }
  }

  if (lesson === '05' || lesson === '06') {
    var ingestion = heading('Ingestion') || heading('DeepRAG') || document.querySelector('.lesson-body h2');
    if (ingestion && !document.querySelector('[data-feedback="cg-modes"]')) {
      after(ingestion,
        '<section data-feedback="cg-modes"><div class="feedback-grid">' +
        '<article class="feedback-card"><strong>🖼️ Advanced Ingestion</strong><p>Use it for multimodal documents containing scans, tables, images, or infographics. UiPath processes the visual and textual content together.</p></article>' +
        '<article class="feedback-card"><strong>📚 DeepRAG</strong><p>Use it for complex questions requiring planning, evidence gathering across documents, synthesis, and detailed citations.</p></article>' +
        '<article class="feedback-card"><strong>🔎 Semantic Search</strong><p>Use it for fast fact lookup when a relevant answer is likely contained in a specific indexed passage.</p></article>' +
        '</div><p>Official sources: <a class="feedback-source" target="_blank" rel="noopener noreferrer" href="https://docs.uipath.com/automation-cloud/automation-cloud/latest/admin-guide/about-context-grounding">Context Grounding and multimodal ingestion</a> · <a class="feedback-source" target="_blank" rel="noopener noreferrer" href="https://docs.uipath.com/automation-cloud/automation-cloud/latest/admin-guide/using-deeprag">Using DeepRAG</a></p></section>');
    }
  }

  if (lesson === '20') {
    var route = heading('Multi-Level Approval') || heading('Data-Driven Routing') || document.querySelector('.lesson-body h2');
    if (route && !document.querySelector('[data-feedback="routing-visual"]')) {
      after(route,
        '<section data-feedback="routing-visual"><p class="feedback-callout"><strong>Example context:</strong> A purchase request arrives with connected process data: <code>PO_Amount</code>, <code>Department</code>, <code>Risk_Level</code>, and <code>Requester</code>. The workflow uses these values to select the approval route.</p>' +
        '<div class="feedback-flow" aria-label="Purchase request approval routing">' +
        '<div class="feedback-node"><strong>Input data</strong><br>Amount + department + risk</div><div class="feedback-arrow">→</div>' +
        '<div class="feedback-node decision"><strong>≤ $5K</strong><br>Manager approval</div><div class="feedback-arrow">→</div>' +
        '<div class="feedback-node decision"><strong>$5K–$25K</strong><br>Department head</div><div class="feedback-arrow">→</div>' +
        '<div class="feedback-node result"><strong>&gt; $25K or high risk</strong><br>Finance + compliance</div></div></section>');
    }
  }

  if (lesson === '21') {
    var api = heading('API Workflows') || document.querySelector('.lesson-body h2');
    if (api && !document.querySelector('[data-feedback="api-example"]')) {
      after(api,
        '<section data-feedback="api-example"><h2>Worked Example: Customer Status API Workflow</h2>' +
        '<p>The workflow receives a <code>customerId</code>, calls the customer service through HTTP, evaluates the response, and returns governed JSON.</p>' +
        '<div class="feedback-flow"><div class="feedback-node"><strong>Input</strong><br>customerId</div><div class="feedback-arrow">→</div><div class="feedback-node"><strong>HTTP GET</strong><br>/customers/{id}</div><div class="feedback-arrow">→</div><div class="feedback-node decision"><strong>Decision</strong><br>200 / 404 / error</div><div class="feedback-arrow">→</div><div class="feedback-node result"><strong>Response</strong><br>status + customer data</div></div>' +
        '<div class="feedback-grid">' +
        '<figure class="feedback-figure"><img loading="lazy" src="https://dev-assets.cms.uipath.com/assets/images/studio-web/studio-web-test-input-and-output-panels-582812-b7ffa5ec.webp" alt="UiPath API workflow test input and output panels"><figcaption>Validate mappings with test input and expression output. Source: <a target="_blank" rel="noopener noreferrer" href="https://docs.uipath.com/studio-web/automation-cloud/latest/user-guide/http">UiPath HTTP activity example</a>.</figcaption></figure>' +
        '<figure class="feedback-figure"><img loading="lazy" src="https://dev-assets.cms.uipath.com/assets/images/studio-web/studio-web-debug-panel-with-response-582820-af3ed665.webp" alt="UiPath API workflow debug response panel"><figcaption>Debug the workflow and inspect the API response. Source: <a target="_blank" rel="noopener noreferrer" href="https://docs.uipath.com/studio-web/automation-cloud/latest/user-guide/http">UiPath HTTP activity example</a>.</figcaption></figure>' +
        '</div></section>');
    }
  }

  if (lesson === '22') {
    var incomplete = heading('From Polling to Real Time: The Shift to');
    if (incomplete) {
      incomplete.textContent = 'From Polling to Real Time: The Shift to Event-Driven Automation';
      var next = incomplete.nextElementSibling;
      if (next && /^H[23]$/.test(next.tagName) && /Event-Driven Automation/i.test(next.textContent)) next.remove();
    }
  }

  if (lesson === '23') {
    var body = document.querySelector('.lesson-body');
    if (body && !document.querySelector('[data-feedback="autopilot-short"]')) {
      body.innerHTML = '<section data-feedback="autopilot-short">' +
        '<p class="feedback-callout"><strong>Goal:</strong> Create a focused Autopilot for a business use case with clear instructions, trusted context, and approved tools.</p>' +
        '<div class="feedback-grid">' +
        '<article class="feedback-card"><strong>1. Open configuration</strong><p>Go to Automation Cloud → Admin → AI Trust Layer → Autopilot for Everyone and select <em>Create a specialized Autopilot</em>.</p></article>' +
        '<article class="feedback-card"><strong>2. Define the experience</strong><p>Enter the display name, description, Orchestrator folder, and focused custom system prompt.</p></article>' +
        '<article class="feedback-card"><strong>3. Add starting prompts</strong><p>Save the general settings and add short, task-oriented starting prompts.</p></article>' +
        '<article class="feedback-card"><strong>4. Connect and test</strong><p>Enable the required Context Grounding indexes and approved tools, then test the experience.</p></article></div>' +
        '<figure class="feedback-figure"><img loading="lazy" src="https://dev-assets.cms.uipath.com/assets/images/autopilot/autopilot-autopilot-for-everyone-landing-page-558893-f5522d9a-b952ba28.webp" alt="UiPath Autopilot for Everyone landing page"><figcaption>The learner-facing landing page shows the title, description, chat box, and starting prompts. Source: <a target="_blank" rel="noopener noreferrer" href="https://docs.uipath.com/autopilot/other/latest/user-guide/launching-autopilot-for-everyone">Launching Autopilot for Everyone</a>.</figcaption></figure>' +
        '<p><a class="feedback-source" target="_blank" rel="noopener noreferrer" href="https://docs.uipath.com/autopilot/other/latest/user-guide/specialized-autopilot">Official specialized Autopilot setup</a></p>' +
        '<section class="summary-box"><h2>Course Complete</h2><p><strong>Congratulations!</strong> You have completed the Agentic Automation Professional course.</p></section></section>';
    }
  }
})();


/* Course QA, numbering, visuals, and accessibility update - 2026-07-30 */
(function () {
  "use strict";

  function ready() {
    if (document.documentElement.hasAttribute('data-course-qa-ready')) return;
    document.documentElement.setAttribute('data-course-qa-ready', 'true');

    /* Imported lesson files can contain a second complete document. Keep only the first course shell. */
    var shells = document.querySelectorAll('.shell');
    for (var si = 1; si < shells.length; si += 1) shells[si].remove();

    var lessonMatch = location.pathname.match(/lesson-(\d{2})\.html$/);
    var originalLesson = lessonMatch ? parseInt(lessonMatch[1], 10) : 0;
    var removed = {9:true, 10:true, 11:true};
    var displayNumber = function (n) { return n <= 8 ? n : n - 3; };
    var pad = function (n) { return String(n).padStart(2, '0'); };

    /* Remove retired coded-agent lessons and renumber the remaining 20 lessons consistently. */
    document.querySelectorAll('a[href*="lesson-"]').forEach(function (link) {
      var hit = (link.getAttribute('href') || '').match(/lesson-(\d{2})\.html/);
      if (!hit) return;
      var oldNo = parseInt(hit[1], 10);
      if (removed[oldNo]) {
        var removable = link.closest('.rail__item, .lesson-card');
        if (removable) removable.remove();
        return;
      }
      var newNo = displayNumber(oldNo);
      var railNo = link.querySelector('.rail__num');
      if (railNo) railNo.textContent = pad(newNo);
      var cardNo = link.querySelector('.lesson-card__num');
      if (cardNo) cardNo.textContent = pad(newNo);
      var cardMeta = link.querySelector('.lesson-card__meta');
      if (cardMeta) cardMeta.textContent = 'Lesson ' + pad(newNo) + ' of 20';
      var navTitle = link.querySelector('.lesson-nav__title');
      if (navTitle) navTitle.textContent = navTitle.textContent.replace(/Lesson\s+\d+/i, 'Lesson ' + newNo);
    });

    if (originalLesson && !removed[originalLesson]) {
      var shown = displayNumber(originalLesson);
      document.querySelectorAll('.lesson-eyebrow').forEach(function (el) { el.textContent = 'Lesson ' + shown + ' of 20'; });
      document.querySelectorAll('.breadcrumb').forEach(function (el) { el.innerHTML = el.innerHTML.replace(/Lesson\s+\d+/i, 'Lesson ' + shown); });
    }

    /* Course overview copy requested in the review. */
    if (!originalLesson) {
      var kicker = document.querySelector('.hero__kicker');
      if (kicker) kicker.textContent = 'Course Objective';
      var heroText = document.querySelector('.hero__copy > p');
      if (heroText) heroText.textContent = 'Understand how agentic AI combines reasoning, contextual decision-making, and enterprise automation. Learn to design, ground, govern, and integrate UiPath agents with reliable workflows and human oversight.';
      var meta = document.querySelectorAll('.hero__meta > div');
      meta.forEach(function (item) {
        if (/Lessons/i.test(item.textContent)) { var strong = item.querySelector('strong'); if (strong) strong.textContent = '20'; }
        if (/16\s*hours/i.test(item.textContent)) item.innerHTML = item.innerHTML.replace(/16\s*hours/i, '6 hours');
      });
      var audienceVersion = document.querySelector('.target-audience .course-objectives__eyebrow');
      if (audienceVersion) audienceVersion.textContent = audienceVersion.textContent.replace(/March\s+2026\s*[·•-]?\s*/i, '').trim();
      var sidebarKicker = document.querySelector('.sidebar__kicker');
      if (sidebarKicker) sidebarKicker.textContent = 'UiPath Learning Course';
      document.querySelectorAll('.course-objectives__grid li').forEach(function (item) {
        if (/coded agents/i.test(item.textContent)) item.textContent = 'Apply governance, security, human oversight, and operational guardrails to enterprise agents.';
      });
    }

    /* Make every flashcard reliably operable by pointer and keyboard. */
    document.querySelectorAll('.flashcard').forEach(function (oldCard) {
      var card = oldCard.cloneNode(true);
      oldCard.replaceWith(card);
      card.setAttribute('aria-pressed', 'false');
      function toggleCard() {
        var flipped = card.classList.toggle('is-flipped');
        card.setAttribute('aria-pressed', String(flipped));
      }
      card.addEventListener('click', toggleCard);
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleCard(); }
      });
    });

    var body = document.querySelector('.lesson-body');
    if (!body) return;

    function addOnce(id, target, position, html) {
      if (!target || document.getElementById(id)) return;
      target.insertAdjacentHTML(position, html);
    }

    /* Lesson 01: official UiPath platform image and Agent-versus-RPA comparison. */
    if (originalLesson === 1) {
      var objectiveBox = body.querySelector('.objectives');
      var lessonOneTarget = objectiveBox || body.firstElementChild;
      addOnce('agent-rpa-visual', lessonOneTarget, objectiveBox ? 'afterend' : 'beforebegin',
        '<section id="agent-rpa-visual" class="qa-section"><h2>Agent and RPA: Different Strengths, One Automation Platform</h2>' +
        '<figure class="qa-official-figure"><a href="https://docs.uipath.com/agents/automation-cloud/latest/user-guide/agent-capabilities-in-the-uipath-platform" target="_blank" rel="noopener"><img src="https://dev-assets.cms.uipath.com/assets/images/agents/agents-docs-image-5-31bc8e3c.webp" alt="Official UiPath diagram showing agents, robots, and people in the automation workforce" loading="lazy"></a><figcaption>Official UiPath platform visual. <a href="https://docs.uipath.com/agents/automation-cloud/latest/user-guide/agent-capabilities-in-the-uipath-platform" target="_blank" rel="noopener">View source ↗</a></figcaption></figure>' +
        '<div class="qa-compare"><article><span class="qa-chip">UiPath Agent</span><h3>Reasons and adapts</h3><p>Best for ambiguous, unstructured, or context-dependent work. Outcomes are probabilistic and require evaluation and guardrails.</p></article><article><span class="qa-chip qa-chip--blue">RPA Robot</span><h3>Follows deterministic rules</h3><p>Best for repetitive, structured, predictable system actions where the same inputs should produce the same result.</p></article><article><span class="qa-chip qa-chip--teal">Agentic workflow</span><h3>Combines judgment and execution</h3><p>The agent interprets and decides; RPA completes reliable system actions; a person reviews sensitive exceptions.</p></article></div>' +
        '<p class="qa-source">Source: <a href="https://docs.uipath.com/agents/automation-cloud/latest/user-guide/about-agents" target="_blank" rel="noopener">UiPath — About agents</a></p></section>');
    }

    /* Lesson 03: the missing visual map showing where an agent fits. */
    if (originalLesson === 3) {
      var mapHeading = document.getElementById('agent-story-blueprint-visual-map');
      if (!mapHeading) mapHeading = Array.prototype.find.call(body.querySelectorAll('h2'), function (h) { return /Agent Story Blueprint Visual Map/i.test(h.textContent); });
      var mapAnchor = mapHeading ? (mapHeading.nextElementSibling || mapHeading) : body.firstElementChild;
      addOnce('agent-fit-map', mapAnchor, 'afterend',
        '<section id="agent-fit-map" class="qa-section qa-map"><h3>Use-Case Decision Map: Where the Agent Fits</h3>' +
        '<div class="qa-map__flow"><div class="qa-map__question">What kind of work is required?</div><div class="qa-map__arrow">↓</div><div class="qa-map__branches"><article><strong>Structured + predictable</strong><span>Rules, stable inputs, repeatable steps</span><b>Use an RPA workflow</b></article><article><strong>Ambiguous + contextual</strong><span>Judgment, language, changing information</span><b>Use a UiPath Agent</b></article><article><strong>Judgment + system action</strong><span>Reasoning plus reliable execution</span><b>Use an agentic workflow</b><small>Agent + RPA + human review</small></article></div></div>' +
        '<p class="qa-source">Source: <a href="https://docs.uipath.com/agents/automation-cloud/latest/user-guide/agent-vs-workflows" target="_blank" rel="noopener">UiPath — Agents versus workflows</a></p></section>');
    }

    /* Lesson 23: concise but complete customized Autopilot configuration guidance. */
    if (originalLesson === 23) {
      body.innerHTML =
        '<h2>Configure a Customized Autopilot</h2><p>A customized Autopilot gives business users a focused conversational experience grounded in approved enterprise knowledge and connected to the automations they are allowed to use.</p>' +
        '<figure class="qa-official-figure"><a href="https://docs.uipath.com/autopilot/other/latest/user-guide/launching-autopilot-for-everyone" target="_blank" rel="noopener"><img src="https://dev-assets.cms.uipath.com/assets/images/autopilot/autopilot-autopilot-for-everyone-landing-page-558893-f5522d9a-b952ba28.webp" alt="Official UiPath Autopilot for Everyone landing page" loading="lazy"></a><figcaption>Official UiPath Autopilot interface. <a href="https://docs.uipath.com/autopilot/other/latest/user-guide/launching-autopilot-for-everyone" target="_blank" rel="noopener">View source ↗</a></figcaption></figure>' +
        '<h2>Configuration Steps</h2><ol class="qa-steps"><li><strong>Create or select the specialized Autopilot.</strong><span>Choose a clear name, description, and the business role it supports.</span></li><li><strong>Write the custom system prompt.</strong><span>Define its purpose, tone, allowed behavior, boundaries, and when it must ask for help.</span></li><li><strong>Add starting prompts.</strong><span>Give users useful example questions for the most common supported tasks.</span></li><li><strong>Connect approved knowledge.</strong><span>Enable the required Context Grounding indexes so answers use trusted organizational content.</span></li><li><strong>Enable tools and automations.</strong><span>Select only the processes and actions the Autopilot needs, using least-privilege access.</span></li><li><strong>Test, publish, and monitor.</strong><span>Validate common questions, unsupported requests, permissions, citations, and escalation behavior before sharing it.</span></li></ol>' +
        '<div class="qa-compare qa-autopilot-check"><article><h3>System prompt</h3><p>State the role, scope, response style, policies, prohibited actions, and escalation rules.</p></article><article><h3>Starting prompts</h3><p>Use short examples that demonstrate what users can ask and the outcome they can expect.</p></article><article><h3>Knowledge and tools</h3><p>Grant only the indexes and automations needed for the supported business scenario.</p></article></div>' +
        '<aside class="doc-links"><h2>Related UiPath documentation</h2><ul><li><a href="https://docs.uipath.com/autopilot/other/latest/user-guide/specialized-autopilot" target="_blank" rel="noopener">Specialized Autopilot ↗</a></li><li><a href="https://docs.uipath.com/autopilot/other/latest/user-guide/launching-autopilot-for-everyone" target="_blank" rel="noopener">Launching Autopilot for Everyone ↗</a></li></ul></aside>' +
        '<section class="qa-complete"><span aria-hidden="true">✓</span><div><h2>Congratulations!</h2><p>You have completed the Agentic Automation Professional course.</p></div></section>';
    }

    var css = document.createElement('style');
    css.textContent =
      '.qa-section{margin:2.25rem 0;padding:1.5rem;border:1px solid #d7dbe0;border-radius:14px;background:#fff}.qa-official-figure{margin:1.25rem 0}.qa-official-figure img{display:block;width:100%;max-height:440px;object-fit:contain;border:1px solid #d7dbe0;border-radius:12px;background:#f7f8f9}.qa-official-figure figcaption{margin-top:.55rem;font-size:.85rem;color:#53606d}.qa-compare{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin:1.25rem 0}.qa-compare article{padding:1rem;border:1px solid #d7dbe0;border-top:4px solid #fa4616;border-radius:10px;background:#f8f9fa}.qa-compare h3{margin:.6rem 0}.qa-chip{display:inline-block;padding:.28rem .55rem;border-radius:999px;background:#fff0eb;color:#b9320d;font-weight:700;font-size:.78rem}.qa-chip--blue{background:#e8f1ff;color:#1558a6}.qa-chip--teal{background:#def6f2;color:#006d64}.qa-source{font-size:.9rem}.qa-map{background:#f8f9fa}.qa-map__flow{text-align:center}.qa-map__question{display:inline-block;padding:.75rem 1rem;border-radius:10px;background:#18242e;color:#fff;font-weight:700}.qa-map__arrow{font-size:1.7rem;color:#fa4616}.qa-map__branches{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.qa-map__branches article{display:flex;min-height:180px;flex-direction:column;gap:.55rem;padding:1rem;border:2px solid #d7dbe0;border-radius:12px;background:#fff}.qa-map__branches article:nth-child(2){border-color:#fa4616}.qa-map__branches span,.qa-map__branches small{color:#53606d}.qa-map__branches b{margin-top:auto;color:#fa4616}.qa-steps{list-style:none;counter-reset:qastep;padding:0;margin:1.4rem 0}.qa-steps li{counter-increment:qastep;display:grid;grid-template-columns:2.3rem 1fr;column-gap:.8rem;padding:1rem 0;border-bottom:1px solid #e4e7ea}.qa-steps li:before{content:counter(qastep);grid-row:1/3;display:grid;place-items:center;width:2.2rem;height:2.2rem;border-radius:50%;background:#fa4616;color:#fff;font-weight:900}.qa-steps span{grid-column:2;color:#53606d}.qa-complete{display:flex;gap:1rem;align-items:center;margin:2rem 0;padding:1.4rem;border-left:5px solid #00a68a;border-radius:12px;background:#e5f7f4}.qa-complete>span{display:grid;place-items:center;width:2.8rem;height:2.8rem;border-radius:50%;background:#00a68a;color:#fff;font-size:1.5rem;font-weight:900}.qa-complete h2,.qa-complete p{margin:.2rem 0}@media(max-width:760px){.qa-compare,.qa-map__branches{grid-template-columns:1fr}.qa-section{padding:1rem}}';
    document.head.appendChild(css);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
