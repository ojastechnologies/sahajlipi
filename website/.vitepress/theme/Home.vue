<script setup>
import { withBase } from 'vitepress';
import WordPreview from './WordPreview.vue';

const quickstart = `import { attachNepaliInputs } from 'sahajlipi/dom';

const typing = attachNepaliInputs(document, {
  scope: 'all',
});

// Call during app or page teardown.
typing.destroy();`;
</script>

<template>
  <main class="sahaj-home">
    <section class="sahaj-hero" aria-labelledby="home-title">
      <div class="sahaj-hero-copy">
        <h1 id="home-title">Nepali typing for your web app.</h1>
        <p class="sahaj-introduction">SahajLipi is an open-source JavaScript library that converts Roman Nepali into Unicode as people type. Use the core engine, or add live typing to your web forms.</p>
        <div class="sahaj-actions">
          <a class="sahaj-button sahaj-button-primary" :href="withBase('/docs/package/getting-started.html')">Get started</a>
          <a class="sahaj-button sahaj-button-secondary" :href="withBase('/demo/')" target="_self">Try the demo</a>
        </div>
        <p class="sahaj-release-note">0.1.0-alpha.2 is available on <a href="https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.2">npm</a>.<br>Experimental Nepali developer alpha. Read the <a :href="withBase('/docs/release.html')">release record</a>.</p>
        <p class="sahaj-source-note">Alpha.2 uses full consonant endings, automatic conjuncts, and backtick for explicit halves. Strict half mode retains alpha.1 fallback endings. See the <a :href="withBase('/docs/package/consonant-defaults-2026-10-03.html')">change and compatibility checks</a>.</p>
      </div>
      <WordPreview />
    </section>

    <section class="sahaj-integration" aria-labelledby="integration-title">
      <div class="sahaj-section-introduction">
        <h2 id="integration-title">Fit the fields you already have.</h2>
        <p>Enable Nepali across an app, within a page, or on selected fields. Keep English fields literal and share one configuration across the fields you manage.</p>
        <a class="sahaj-text-link" :href="withBase('/docs/package/integration-recipes.html')">Explore integration recipes</a>
      </div>
      <div class="sahaj-code-example">
        <div class="sahaj-code-heading">
          <span>Install the developer alpha</span>
          <span>npm</span>
        </div>
        <pre aria-label="Install the verified Nepali developer alpha"><code>npm install --save-exact sahajlipi@0.1.0-alpha.2</code></pre>
        <div class="sahaj-code-heading">
          <span>One initializer for your app</span>
          <span>JavaScript</span>
        </div>
        <pre aria-label="Initialize Nepali typing across supported fields"><code>{{ quickstart }}</code></pre>
        <p>Supports textareas and text/search inputs. Add <code>data-sahajlipi-ignore</code> to an English field. The getting-started guide covers npm installation and source checkouts.</p>
      </div>
    </section>

    <section class="sahaj-capabilities" aria-labelledby="capabilities-title">
      <h2 id="capabilities-title">A small engine, useful controls.</h2>
      <div class="sahaj-capability-list">
        <article class="sahaj-capability">
          <h3>Direct phonetic typing</h3>
          <p>Convert the keys as a word takes shape. Ordered spelling alternatives are available for selected entries, without a mandatory choice on every word.</p>
          <a :href="withBase('/docs/package/typing-reference.html')">Typing reference</a>
        </article>
        <article class="sahaj-capability">
          <h3>Mixed text and digit styles</h3>
          <p>Recognizable URLs and ordinary ASCII email addresses stay literal. Use Nepali digits by default, or configure Latin digits for your app.</p>
          <a :href="withBase('/docs/package/api.html')">Engine options</a>
        </article>
        <article class="sahaj-capability">
          <h3>Core and browser entry points</h3>
          <p>Convert strings without a DOM, or attach the browser adapter. TypeScript declarations and runnable JavaScript and React examples help you integrate.</p>
          <a :href="withBase('/docs/package/getting-started.html')">Developer guide</a>
        </article>
      </div>
    </section>

    <section class="sahaj-project" aria-labelledby="project-title">
      <div>
        <h2 id="project-title">Built in the open.</h2>
        <p>Nepali is the implemented language today. The prototype is evolving, and unknown spellings can produce incorrect results. We publish the architecture, test methods, dated benchmarks, and review limits so you can understand its behavior before using it.</p>
      </div>
      <ul class="sahaj-project-links">
        <li><a :href="withBase('/docs/package/architecture.html')">Project architecture</a><span>How the engine and adapters work</span></li>
        <li><a :href="withBase('/docs/package/benchmarks.html')">Benchmarks and review</a><span>Methods, recorded results, and limits</span></li>
        <li><a :href="withBase('/docs/contributing.html')">Contribute to SahajLipi</a><span>Code, language review, and issue reports</span></li>
      </ul>
    </section>
  </main>
</template>
