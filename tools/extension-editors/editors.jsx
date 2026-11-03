import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ContentState, Editor as DraftEditor, EditorState } from 'draft-js';
import { $getRoot, createEditor as createLexical } from 'lexical';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { EditorState as PmState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import Quill from 'quill';
import { createEditor as createSlate, Node as SlateNode } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';

// Each editor publishes editorText(): the text in its own model, which is what a
// site would save or post. The DOM alone can show text the model never accepted.
const mount = document.getElementById('editor');

function DraftFixture() {
  const [state, setState] = useState(() => EditorState.createWithContent(ContentState.createFromText('')));
  globalThis.editorText = () => state.getCurrentContent().getPlainText('\n');
  return <DraftEditor editorState={state} onChange={setState} />;
}

function SlateFixture() {
  const editor = useMemo(() => withHistory(withReact(createSlate())), []);
  globalThis.editorText = () => editor.children.map((node) => SlateNode.string(node)).join('\n');
  return (
    <Slate editor={editor} initialValue={[{ type: 'paragraph', children: [{ text: '' }] }]}>
      <Editable />
    </Slate>
  );
}

const editors = {
  draft: () => createRoot(mount).render(<DraftFixture />),
  slate: () => createRoot(mount).render(<SlateFixture />),
  lexical() {
    const root = document.createElement('div');
    root.contentEditable = 'true';
    mount.append(root);
    const editor = createLexical({ namespace: 'fixture', nodes: [HeadingNode, QuoteNode], onError(error) { throw error; } });
    editor.setRootElement(root);
    registerRichText(editor);
    registerHistory(editor, createEmptyHistoryState(), 300);
    globalThis.editorText = () => editor.getEditorState().read(() => $getRoot().getTextContent());
  },
  prosemirror() {
    const schema = new Schema({ nodes: basicSchema.spec.nodes, marks: basicSchema.spec.marks });
    const view = new EditorView(mount, {
      state: PmState.create({ schema, plugins: exampleSetup({ schema, menuBar: false }) }),
    });
    globalThis.editorText = () => view.state.doc.textBetween(0, view.state.doc.content.size, '\n');
  },
  quill() {
    const quill = new Quill(mount);
    globalThis.editorText = () => quill.getText().replace(/\n$/, '');
  },
  plain() {
    mount.innerHTML = '<div contenteditable="true"></div>';
    const root = mount.firstChild;
    globalThis.editorText = () => root.innerText.replace(/\n$/, '');
  },
};

editors[new URLSearchParams(location.search).get('editor')]();
