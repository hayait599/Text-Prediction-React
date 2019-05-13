import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import Api from '../api/EditorAPI';
import '../statics/editor.css';
import 'react-quill/dist/quill.bubble.css';

class Editor extends React.Component {

  constructor(props) {
    super(props)
    this.quillRef = React.createRef();
    this.editorRef = React.createRef();
    this.hintVisible = false
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onClick = this.onClick.bind(this)
    
  }

  componentDidMount() {
    this.editorRef = this.quillRef.getEditor()
  }

  getBlot() {
    const Parchment = Quill.import('parchment');
    const selection = document.getSelection();
    const node = selection.getRangeAt(0).startContainer;
    const blot = Parchment.find(node);
    return blot;
  }

  insertHint(text) {
    const range = this.editorRef.getSelection();
    this.editorRef.insertText(
      range,
      text,
      { color: '#848484' },
      'api'
    );
    return
    this.hintVisible = { rangeFrom: range, word: text }
    this.editorRef.setSelection(range, Quill.sources.API);
  }

  deleteHint({ rangeFrom, word }) {
    this.editorRef.deleteText(rangeFrom.index, word.length);
    this.hintVisible = null
  }

  addHint() {
    const cursorPosition = this.editorRef.getSelection().index;
    const { rangeFrom, word } = this.hintVisible
    this.editorRef.formatText(
      rangeFrom.index,
      word.length + 1, {
        'color': '#000000'
      });
    this.editorRef.deleteText(cursorPosition - 1, 1, Quill.sources.USER);
    this.editorRef.setSelection(cursorPosition + `${word}`.length - 1, Quill.sources.API);
    this.hintVisible = null
  }

  async getHints() {
    const blot = this.getBlot();
    if (blot) {
      const text = blot.text;
      if (text) {
        const space = text.split(' ');
        if (space[space.length - 1] !== '') {
          const hintText = text.trim().split(' ').splice(-1).join(' ');
          const hints = await Api.getHints({ hintText })
          if (hints) {
            this.insertHint(hints[hints.length - 1].word)
          }
        }
      }
    }
  }

  onKeyDown(event) {
    const keyCode = event.keyCode;
    const upCode = 38;
    const downCode = 40;
    const spaceCode = 32
    const tabCode = 9
    const enterCode = 13

    if (keyCode === enterCode) {
      return;
    }

    if (keyCode === spaceCode) {
      this.getHints()
    }
    if (keyCode === tabCode) {

      if (this.hintVisible) {
        this.addHint()
      }
      return
    }

    if (this.hintVisible) {
      this.deleteHint(this.hintVisible)
    }
  }
  onClick(e) {
    console.log(e)
    if (this.hintVisible) {
      this.deleteHint(this.hintVisible)
    }
  }
  render() {
    return (
      <ReactQuill
        theme='bubble'
        modules={{
          toolbar: false,
        }}
        className='Editor_container'
        onKeyDown={this.onKeyDown}
        ref={(elm) => { this.quillRef = elm }}
      >
        <div
          key='editor'
          ref='editor'
          className="quill-contents Editor"
          onClick={this.onClick}
          onContextMenu={this.onClick}
        />
      </ReactQuill>
    );
  }
}

export default Editor;
