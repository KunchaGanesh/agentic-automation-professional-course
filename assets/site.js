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
