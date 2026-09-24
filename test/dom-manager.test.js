import test from "node:test";
import assert from "node:assert/strict";
import { attachNepaliInput, attachNepaliInputs } from "../src/dom.js";

const activeObservers = new Set();

class FakeMutationObserver {
  constructor(callback) {
    this.callback = callback;
    this.records = [];
    this.scheduled = false;
  }

  observe(target, options) {
    this.target = target;
    this.options = options;
    activeObservers.add(this);
  }

  disconnect() {
    activeObservers.delete(this);
    this.records = [];
  }

  static notify(record) {
    for (const observer of activeObservers) {
      const inScope = record.target === observer.target ||
        (observer.options.subtree && observer.target.contains(record.target));
      if (!inScope || !observer.options[record.type]) continue;
      if (record.type === "attributes" && observer.options.attributeFilter &&
          !observer.options.attributeFilter.includes(record.attributeName)) continue;
      observer.records.push(record);
      if (observer.scheduled) continue;
      observer.scheduled = true;
      queueMicrotask(() => {
        observer.scheduled = false;
        const records = observer.records.splice(0);
        if (activeObservers.has(observer) && records.length) observer.callback(records, observer);
      });
    }
  }
}

class FakeNode extends EventTarget {
  constructor(tagName, ownerDocument = null) {
    super();
    this.tagName = tagName.toUpperCase();
    this.nodeName = this.tagName;
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
  }

  appendChild(child) {
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument ?? this;
    this.children.push(child);
    FakeMutationObserver.notify({ type: "childList", target: this, addedNodes: [child], removedNodes: [] });
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index < 0) throw new Error("Child is missing");
    this.children.splice(index, 1);
    child.parentNode = null;
    FakeMutationObserver.notify({ type: "childList", target: this, addedNodes: [], removedNodes: [child] });
    return child;
  }

  contains(node) {
    if (this === node) return true;
    return this.children.some((child) => child.contains(node));
  }

  setAttribute(name, value = "") {
    this.attributes.set(name, String(value));
    FakeMutationObserver.notify({ type: "attributes", target: this, attributeName: name });
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    FakeMutationObserver.notify({ type: "attributes", target: this, attributeName: name });
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  matches(selector) {
    return selector.split(",").some((part) => {
      let term = part.trim().toLowerCase();
      const negated = [...term.matchAll(/:not\(\[([a-z][a-z0-9-]*)\]\)/g)];
      if (negated.some(([, name]) => this.hasAttribute(name))) return false;
      term = term.replace(/:not\(\[[a-z][a-z0-9-]*\]\)/g, "");
      const tag = term.match(/^[a-z]+/)?.[0];
      if (tag && this.tagName.toLowerCase() !== tag) return false;
      const attributes = [...term.matchAll(/\[([a-z][a-z0-9-]*)(?:=["']?([a-z0-9-]+)["']?)?\]/g)];
      if (!tag && !attributes.length) return false;
      return attributes.every(([, name, value]) => {
        if (name === "type") return this.tagName === "INPUT" &&
          (value === undefined ? this.hasAttribute(name) : this.type === value);
        return this.hasAttribute(name) &&
          (value === undefined || this.attributes.get(name).toLowerCase() === value);
      });
    });
  }

  querySelectorAll(selector) {
    const found = [];
    for (const child of this.children) {
      if (child.matches(selector)) found.push(child);
      found.push(...child.querySelectorAll(selector));
    }
    return found;
  }
}

class FakeDocument extends FakeNode {
  constructor() {
    super("#document");
    this.ownerDocument = this;
    this.activeElement = null;
    this.defaultView = { MutationObserver: FakeMutationObserver };
    this.documentElement = this;
  }
}

class FakeField extends FakeNode {
  constructor(tagName = "textarea", type = "text") {
    super(tagName);
    this.type = type;
    this.value = "";
    this.selectionStart = 0;
    this.selectionEnd = 0;
  }

  setSelectionRange(start, end) {
    this.selectionStart = start;
    this.selectionEnd = end;
  }

  setRangeText(text, start, end, selectionMode = "preserve") {
    this.value = this.value.slice(0, start) + text + this.value.slice(end);
    if (selectionMode === "end") this.setSelectionRange(start + text.length, start + text.length);
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }
}

function setup({ observer = true } = {}) {
  const previousDocument = globalThis.document;
  const previousObserver = globalThis.MutationObserver;
  const document = new FakeDocument();
  if (!observer) delete document.defaultView.MutationObserver;
  globalThis.document = document;
  if (observer) globalThis.MutationObserver = FakeMutationObserver;
  else delete globalThis.MutationObserver;
  document.cleanup = () => {
    for (const instance of [...activeObservers]) instance.disconnect();
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousObserver === undefined) delete globalThis.MutationObserver;
    else globalThis.MutationObserver = previousObserver;
  };
  return document;
}

function field(document, tagName = "textarea", type = "text", marked = false) {
  const element = new FakeField(tagName, type);
  if (marked) element.setAttribute("data-sahajlipi");
  document.appendChild(element);
  return element;
}

function beforeInput(element, inputType, data = null) {
  element.focus();
  const event = new Event("beforeinput", { cancelable: true });
  Object.defineProperties(event, {
    inputType: { value: inputType },
    data: { value: data },
  });
  element.dispatchEvent(event);
  if (!event.defaultPrevented && inputType === "insertText" && typeof data === "string") {
    element.setRangeText(data, element.selectionStart, element.selectionEnd, "end");
    const input = new Event("input");
    Object.defineProperty(input, "inputType", { value: inputType });
    element.dispatchEvent(input);
  }
  return event;
}

function type(element, text) {
  for (const character of text) beforeInput(element, "insertText", character);
}

async function mutationsFlush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

test("a single field uses built-in conversion without passing engine functions", (t) => {
  const document = setup();
  const textarea = field(document);
  const controller = attachNepaliInput(textarea);
  t.after(() => { controller.destroy(); document.cleanup(); });

  type(textarea, "pani|");
  assert.equal(textarea.value, "पनि।");
  assert.equal(controller.getState().text, "पनि।");
});

test("text and search inputs convert Nepali while keeping Enter single-line", (t) => {
  const document = setup();
  const controllers = [];
  t.after(() => { controllers.forEach((controller) => controller.destroy()); document.cleanup(); });
  for (const inputType of ["text", "search"]) {
    const input = field(document, "input", inputType);
    const controller = attachNepaliInput(input);
    controllers.push(controller);
    type(input, "pani");
    assert.equal(input.value, "पनि", inputType);
    beforeInput(input, "insertLineBreak");
    assert.equal(input.value, "पनि", `${inputType} gained a newline`);
  }
});


test("a text input supports selection replacement, paste, undo, and redo", (t) => {
  const document = setup();
  const input = field(document, "input", "text");
  const controller = attachNepaliInput(input);
  t.after(() => { controller.destroy(); document.cleanup(); });

  type(input, "paani");
  assert.equal(input.value, "पानी");
  input.setSelectionRange(0, input.value.length);
  type(input, "pani");
  assert.equal(input.value, "पनि");

  const paste = new Event("paste", { cancelable: true });
  Object.defineProperty(paste, "clipboardData", {
    value: { getData: () => " ghar" },
  });
  input.dispatchEvent(paste);
  assert.equal(paste.defaultPrevented, true);
  assert.equal(input.value, "पनि घर");
  controller.undo();
  assert.equal(input.value, "पनि");
  controller.redo();
  assert.equal(input.value, "पनि घर");
});

test("an element root and custom selector keep conversion inside that scope", (t) => {
  const document = setup();
  const section = new FakeNode("section");
  document.appendChild(section);
  const inside = new FakeField("input", "text");
  inside.setAttribute("data-nepali-input");
  section.appendChild(inside);
  const outside = field(document, "input", "text");
  outside.setAttribute("data-nepali-input");

  const manager = attachNepaliInputs(section, { selector: "[data-nepali-input]" });
  t.after(() => { manager.destroy(); document.cleanup(); });
  assert.ok(manager.getController(inside));
  assert.equal(manager.getController(outside), null);
  type(inside, "pani");
  type(outside, "pani");
  assert.equal(inside.value, "पनि");
  assert.equal(outside.value, "pani");
});

test("unsupported input types are rejected even if they expose setRangeText", (t) => {
  const document = setup();
  t.after(() => document.cleanup());
  for (const inputType of ["email", "password", "number"]) {
    const input = field(document, "input", inputType);
    assert.throws(() => attachNepaliInput(input), TypeError, inputType);
  }
});

test("one call attaches only marked supported fields and keeps their state separate", (t) => {
  const document = setup();
  const textarea = field(document, "textarea", "text", true);
  const search = field(document, "input", "search", true);
  const ordinary = field(document, "input", "text");
  const email = field(document, "input", "email", true);
  const updates = [];
  const manager = attachNepaliInputs(document, {
    onStateChange: (state, element) => updates.push({ state, element }),
  });
  t.after(() => { manager.destroy(); document.cleanup(); });

  assert.ok(manager.getController(textarea));
  assert.ok(manager.getController(search));
  assert.equal(manager.getController(ordinary), null);
  assert.equal(manager.getController(email), null);

  type(textarea, "kam");
  type(search, "pani");
  type(ordinary, "pani");
  type(email, "pani");
  assert.equal(textarea.value, "कम");
  assert.equal(search.value, "पनि");
  assert.equal(ordinary.value, "pani");
  assert.equal(email.value, "pani");
  assert.deepEqual(manager.getController(textarea).getState().candidates, ["कम", "काम"]);
  assert.equal(manager.getController(search).getState().activeRoman, "pani");
  assert.ok(updates.some(({ state, element }) => element === textarea && state.text === "कम"));
  assert.ok(updates.some(({ state, element }) => element === search && state.text === "पनि"));
});

test("marked fields added later attach, and unmarking or removing them detaches", async (t) => {
  const document = setup();
  const manager = attachNepaliInputs();
  t.after(() => { manager.destroy(); document.cleanup(); });
  const dynamic = field(document, "input", "text", true);
  await mutationsFlush();
  assert.ok(manager.getController(dynamic));
  type(dynamic, "pani");
  assert.equal(dynamic.value, "पनि");

  dynamic.removeAttribute("data-sahajlipi");
  await mutationsFlush();
  assert.equal(manager.getController(dynamic), null);
  dynamic.value = "";
  dynamic.setSelectionRange(0, 0);
  type(dynamic, "pani");
  assert.equal(dynamic.value, "pani");

  dynamic.setAttribute("data-sahajlipi");
  await mutationsFlush();
  assert.ok(manager.getController(dynamic));
  document.removeChild(dynamic);
  await mutationsFlush();
  assert.equal(manager.getController(dynamic), null);
});

test("refresh attaches fields when MutationObserver is unavailable", (t) => {
  const document = setup({ observer: false });
  const manager = attachNepaliInputs(document);
  t.after(() => { manager.destroy(); document.cleanup(); });
  const added = field(document, "textarea", "text", true);
  assert.equal(manager.getController(added), null);
  manager.refresh();
  assert.ok(manager.getController(added));
  type(added, "pani");
  assert.equal(added.value, "पनि");
});

test("destroy removes handlers and stops observing later fields", async (t) => {
  const document = setup();
  const first = field(document, "textarea", "text", true);
  const manager = attachNepaliInputs(document);
  t.after(() => document.cleanup());
  assert.ok(manager.getController(first));
  manager.destroy();
  assert.equal(manager.getController(first), null);
  type(first, "pani");
  assert.equal(first.value, "pani");

  const later = field(document, "input", "text", true);
  await mutationsFlush();
  assert.equal(manager.getController(later), null);
  type(later, "pani");
  assert.equal(later.value, "pani");
});

test("a custom converter still works with the single-field adapter", (t) => {
  const document = setup();
  const textarea = field(document);
  const controller = attachNepaliInput(textarea, {
    convertWord: (roman) => ({ text: `«${roman}»`, candidates: [`«${roman}»`], ambiguous: false }),
    convertText: (text) => `[${text}]`,
  });
  t.after(() => { controller.destroy(); document.cleanup(); });
  type(textarea, "ab");
  assert.equal(textarea.value, "«ab»");
});

for (const teardown of ["destroy", "remove", "unmark"]) {
  test(`queued composition does not update a field after ${teardown}`, async (t) => {
    const document = setup();
    const input = field(document, "input", "text", true);
    const updates = [];
    const manager = attachNepaliInputs(document, {
      onStateChange: (state, element) => updates.push({ state, element }),
    });
    t.after(() => { manager.destroy(); document.cleanup(); });

    input.dispatchEvent(new Event("compositionstart"));
    input.setRangeText("pani", 0, 0, "end");
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("compositionend"));

    if (teardown === "destroy") manager.destroy();
    else if (teardown === "remove") document.removeChild(input);
    else input.removeAttribute("data-sahajlipi");
    const countAtTeardown = updates.length;

    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(manager.getController(input), null);
    assert.equal(input.value, "pani");
    assert.equal(updates.length, countAtTeardown);
  });
}

test("a dynamic field's initial state callback can retrieve its controller", async (t) => {
  const document = setup();
  const input = new FakeField("input", "text");
  input.setAttribute("data-sahajlipi");
  let initialController = null;
  let manager;
  manager = attachNepaliInputs(document, {
    onStateChange: (state, element) => {
      if (element === input && state.text === "") {
        initialController = manager.getController(element);
      }
    },
  });
  t.after(() => { manager.destroy(); document.cleanup(); });

  document.appendChild(input);
  await mutationsFlush();
  assert.ok(initialController);
  assert.equal(initialController, manager.getController(input));
});

test("unrelated attribute changes do not rescan marked fields", async (t) => {
  const document = setup();
  const input = field(document, "input", "text", true);
  const querySelectorAll = document.querySelectorAll.bind(document);
  let scans = 0;
  document.querySelectorAll = (selector) => {
    scans++;
    return querySelectorAll(selector);
  };
  const manager = attachNepaliInputs(document);
  t.after(() => { manager.destroy(); document.cleanup(); });
  const scansAfterSetup = scans;

  input.setAttribute("aria-label", "Nepali title");
  await mutationsFlush();
  assert.equal(scans, scansAfterSetup);
  assert.ok(manager.getController(input));
});

test("unmarked DOM subtrees do not rescan the default selector", async (t) => {
  const document = setup();
  const querySelectorAll = document.querySelectorAll.bind(document);
  let scans = 0;
  document.querySelectorAll = (selector) => {
    scans++;
    return querySelectorAll(selector);
  };
  const manager = attachNepaliInputs(document);
  t.after(() => { manager.destroy(); document.cleanup(); });
  const scansAfterSetup = scans;

  const section = new FakeNode("section");
  section.appendChild(new FakeField("input", "text"));
  document.appendChild(section);
  await mutationsFlush();
  assert.equal(scans, scansAfterSetup, "adding an unrelated subtree triggered a rescan");

  document.removeChild(section);
  await mutationsFlush();
  assert.equal(scans, scansAfterSetup, "removing an unrelated subtree triggered a rescan");
});


test("a single field can start disabled and enable without rewriting existing text", (t) => {
  const document = setup();
  const input = field(document, "input", "text");
  const controller = attachNepaliInput(input, { enabled: false });
  t.after(() => { controller.destroy(); document.cleanup(); });

  assert.equal(controller.getState().enabled, false);
  type(input, "pani");
  assert.equal(input.value, "pani");
  controller.setEnabled(true);
  assert.equal(input.value, "pani");
  type(input, " paani");
  assert.equal(input.value, "pani पानी");
});

test("a manager starts disabled and bulk toggles all current fields", (t) => {
  const document = setup();
  const textarea = field(document, "textarea", "text", true);
  const search = field(document, "input", "search", true);
  const manager = attachNepaliInputs(document, { enabled: false });
  t.after(() => { manager.destroy(); document.cleanup(); });

  assert.equal(manager.getEnabled(), false);
  assert.equal(manager.getController(textarea).getState().enabled, false);
  assert.equal(manager.getController(search).getState().enabled, false);
  type(textarea, "pani");
  type(search, "ghar");
  assert.equal(textarea.value, "pani");
  assert.equal(search.value, "ghar");

  manager.setEnabled(true);
  assert.equal(manager.getEnabled(), true);
  assert.equal(manager.getController(textarea).getState().enabled, true);
  assert.equal(manager.getController(search).getState().enabled, true);
  assert.equal(textarea.value, "pani", "toggling must leave existing text alone");
  assert.equal(search.value, "ghar", "toggling must leave existing text alone");
  type(textarea, " paani");
  type(search, " pani");
  assert.equal(textarea.value, "pani पानी");
  assert.equal(search.value, "ghar पनि");

  manager.setEnabled(false);
  type(textarea, " ghar");
  assert.equal(textarea.value, "pani पानी ghar");
});

test("fields added later inherit the manager's current mode", async (t) => {
  const document = setup();
  const manager = attachNepaliInputs(document, { enabled: false });
  t.after(() => { manager.destroy(); document.cleanup(); });

  const first = field(document, "input", "text", true);
  await mutationsFlush();
  assert.equal(manager.getController(first).getState().enabled, false);
  type(first, "pani");
  assert.equal(first.value, "pani");

  manager.setEnabled(true);
  const second = field(document, "textarea", "text", true);
  await mutationsFlush();
  assert.equal(manager.getController(second).getState().enabled, true);
  type(second, "pani");
  assert.equal(second.value, "पनि");
});

test("root managers have independent modes and a field can still be toggled alone", (t) => {
  const document = setup();
  const firstRoot = new FakeNode("section");
  const secondRoot = new FakeNode("section");
  document.appendChild(firstRoot);
  document.appendChild(secondRoot);
  const first = new FakeField("input", "text");
  first.setAttribute("data-sahajlipi");
  firstRoot.appendChild(first);
  const second = new FakeField("input", "text");
  second.setAttribute("data-sahajlipi");
  secondRoot.appendChild(second);
  const firstManager = attachNepaliInputs(firstRoot);
  const secondManager = attachNepaliInputs(secondRoot);
  t.after(() => { firstManager.destroy(); secondManager.destroy(); document.cleanup(); });

  firstManager.setEnabled(false);
  assert.equal(firstManager.getEnabled(), false);
  assert.equal(secondManager.getEnabled(), true);
  type(first, "pani");
  type(second, "pani");
  assert.equal(first.value, "pani");
  assert.equal(second.value, "पनि");

  firstManager.getController(first).setEnabled(true);
  assert.equal(firstManager.getEnabled(), false);
  type(first, " paani");
  assert.equal(first.value, "pani पानी");
});

test("enabled must be a boolean for both adapter entry points", (t) => {
  const document = setup();
  const input = field(document, "input", "text", true);
  let controller;
  let manager;
  t.after(() => { controller?.destroy(); manager?.destroy(); document.cleanup(); });
  assert.throws(() => { controller = attachNepaliInput(input, { enabled: "false" }); }, TypeError);
  assert.throws(() => { manager = attachNepaliInputs(document, { enabled: 0 }); }, TypeError);
});

test("page scope attaches all supported fields while an ignore marker leaves English fields alone", (t) => {
  const document = setup();
  const textarea = field(document, "textarea");
  const textInput = field(document, "input", "text");
  const search = field(document, "input", "search");
  const english = field(document, "input", "text");
  english.setAttribute("data-sahajlipi-ignore");
  const email = field(document, "input", "email");
  const manager = attachNepaliInputs(document, { scope: "all" });
  t.after(() => { manager.destroy(); document.cleanup(); });

  assert.ok(manager.getController(textarea));
  assert.ok(manager.getController(textInput));
  assert.ok(manager.getController(search));
  assert.equal(manager.getController(english), null);
  assert.equal(manager.getController(email), null);
  for (const input of [textarea, textInput, search, english, email]) type(input, "pani");
  for (const input of [textarea, textInput, search]) assert.equal(input.value, "पनि");
  assert.equal(english.value, "pani");
  assert.equal(email.value, "pani");
});

test("page scope on an element stays inside that root", (t) => {
  const document = setup();
  const section = new FakeNode("section");
  document.appendChild(section);
  const inside = new FakeField("input", "text");
  section.appendChild(inside);
  const outside = field(document, "input", "text");
  const manager = attachNepaliInputs(section, { scope: "all" });
  t.after(() => { manager.destroy(); document.cleanup(); });

  assert.ok(manager.getController(inside));
  assert.equal(manager.getController(outside), null);
  type(inside, "pani");
  type(outside, "pani");
  assert.equal(inside.value, "पनि");
  assert.equal(outside.value, "pani");
});

test("page scope notices dynamic fields and ignore marker changes", async (t) => {
  const document = setup();
  const manager = attachNepaliInputs(document, { scope: "all" });
  t.after(() => { manager.destroy(); document.cleanup(); });
  const dynamic = field(document, "input", "text");
  await mutationsFlush();
  assert.ok(manager.getController(dynamic));
  type(dynamic, "pani");
  assert.equal(dynamic.value, "पनि");

  dynamic.setAttribute("data-sahajlipi-ignore");
  await mutationsFlush();
  assert.equal(manager.getController(dynamic), null);
  dynamic.value = "";
  dynamic.setSelectionRange(0, 0);
  type(dynamic, "pani");
  assert.equal(dynamic.value, "pani");

  dynamic.removeAttribute("data-sahajlipi-ignore");
  await mutationsFlush();
  assert.ok(manager.getController(dynamic));
  dynamic.value = "";
  dynamic.setSelectionRange(0, 0);
  type(dynamic, "pani");
  assert.equal(dynamic.value, "पनि");
});

test("custom selector controls discovery in page scope and a custom exclusion still applies", (t) => {
  const document = setup();
  const selected = field(document, "input", "text");
  selected.setAttribute("data-nepali-input");
  const excluded = field(document, "input", "text");
  excluded.setAttribute("data-nepali-input");
  excluded.setAttribute("data-english-input");
  const ordinary = field(document, "input", "text");
  const manager = attachNepaliInputs(document, {
    scope: "all",
    selector: "[data-nepali-input]",
    excludeSelector: "[data-english-input]",
  });
  t.after(() => { manager.destroy(); document.cleanup(); });

  assert.ok(manager.getController(selected));
  assert.equal(manager.getController(excluded), null);
  assert.equal(manager.getController(ordinary), null);
});

test("page scope options reject invalid scope and exclusion selector", (t) => {
  const document = setup();
  let manager;
  t.after(() => { manager?.destroy(); document.cleanup(); });
  assert.throws(() => { manager = attachNepaliInputs(document, { scope: "everything" }); }, TypeError);
  assert.throws(() => { manager = attachNepaliInputs(document, { excludeSelector: "" }); }, TypeError);
  assert.throws(() => { manager = attachNepaliInputs(document, { excludeSelector: 1 }); }, TypeError);
});


test("a second manager rejects overlapping fields before attaching any other field", (t) => {
  const document = setup();
  const fresh = field(document, "input", "text");
  const section = new FakeNode("section");
  document.appendChild(section);
  const shared = new FakeField("input", "text");
  section.appendChild(shared);
  const first = attachNepaliInputs(section, { scope: "all" });
  let second;
  t.after(() => { second?.destroy(); first.destroy(); document.cleanup(); });

  let freshListeners = 0;
  const addFreshListener = fresh.addEventListener.bind(fresh);
  fresh.addEventListener = (...args) => {
    freshListeners++;
    return addFreshListener(...args);
  };
  assert.throws(
    () => { second = attachNepaliInputs(document, { scope: "all" }); },
    (error) => error instanceof TypeError && /already (attached|managed)|already has/i.test(error.message),
  );
  assert.equal(second, undefined);
  assert.equal(freshListeners, 0, "failed setup installed listeners on another field");
  type(fresh, "pani");
  type(shared, "pani");
  assert.equal(fresh.value, "pani");
  assert.equal(shared.value, "पनि", "the first manager must remain active");
});

test("a directly attached field cannot be attached twice and is released on destroy", (t) => {
  const document = setup();
  const input = field(document, "input", "text");
  const first = attachNepaliInput(input);
  let second;
  t.after(() => { second?.destroy(); first.destroy(); document.cleanup(); });

  let extraListeners = 0;
  const addListener = input.addEventListener.bind(input);
  input.addEventListener = (...args) => {
    extraListeners++;
    return addListener(...args);
  };
  assert.throws(
    () => { second = attachNepaliInput(input); },
    (error) => error instanceof TypeError && /already (attached|managed)|already has/i.test(error.message),
  );
  assert.equal(second, undefined);
  assert.equal(extraListeners, 0);
  type(input, "pani");
  assert.equal(input.value, "पनि");

  first.destroy();
  second = attachNepaliInput(input);
  type(input, " paani");
  assert.equal(input.value, "पनि पानी");
});
