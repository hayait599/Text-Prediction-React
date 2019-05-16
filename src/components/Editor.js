import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill, { Quill } from 'react-quill';
import DropDown from './DropDown';
import Api from '../api/EditorAPI';
import '../statics/editor.css';
import 'react-quill/dist/quill.bubble.css';

class Editor extends React.Component {

  constructor(props) {
    super(props)
    this.quillRef = React.createRef();
    this.editorRef = React.createRef();
    this.dropDownRef = React.createRef();
    this.hintVisible = false
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onClick = this.onClick.bind(this)
    this.getBlot = this.getBlot.bind(this)
    this.getDictionary = this.getDictionary.bind(this)
    this.state = {
      passToDrop: {
        visible: false
      }
    }
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
    this.editorRef = this.quillRef.getEditor();
    const range = this.editorRef.getSelection();
    this.editorRef.insertText(
      range,
      text,
      { color: '#848484' },
      'api'
    );
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
            if (hints.length > 2) {
              const height = (window.innerHeight || document.documentElement.clientHeight);
              const parentNode = ReactDOM.findDOMNode(this.quillRef).getBoundingClientRect();
              const distanceToTop = parentNode.top - 6;
              const distanceToBottom = height - parentNode.bottom - 6;
              this.editorRef = this.quillRef.getEditor()
              const range = this.editorRef.getSelection();
              const bounds = this.editorRef.getBounds(range);
              const hintsArray = hints.map(item => item.word)
              this.setState({
                passToDrop: {
                  ...this.state.passToDrop,
                  visible: true,
                  bounds,
                  distanceToBottom,
                  distanceToTop,
                  hintsArray
                }
              })
              return
            }
            this.insertHint(hints[hints.length - 1].word)
          }
        }
      }
    }
  }

  async getDictionary() {
    const blot = this.getBlot();
    const range = this.editorRef.getSelection();
    if (blot) {
      const text = blot.text;
      if (typeof text !== "undefined") {
        const lastWord = text.trim().split(' ').splice(-1).join(' ');
        const dicPredictions = await Api.getDictionaryPrediction({ lastWord })
      }
    }
  }

  onKeyDown(event) {
    const keyCode = event.keyCode;
    const upCode = 38;
    const downCode = 40;
    const spaceCode = 32;
    const tabCode = 9;
    const enterCode = 13;

    if (keyCode === downCode && this.state.passToDrop.visible) {
      event.preventDefault();
      event.stopPropagation();
      this.dropDownRef.onKeyDown();
      return;
    }

    if (keyCode === upCode && this.state.passToDrop.visible) {
      event.preventDefault();
      event.stopPropagation();
      this.dropDownRef.onKeyUp();
      return;
    }

    this.setState({
      passToDrop: {
        ...this.state.passToDrop,
        visible: false
      }
    })
    
    if (keyCode === enterCode) {
      return
    }

    if (keyCode === spaceCode) {
      this.getHints();
    }

    if (keyCode === tabCode) {
      if (this.hintVisible) {
        this.addHint();
      }
      return
    }

    if (this.hintVisible) {
      this.deleteHint(this.hintVisible);
    }
  }

  onClick(e) {
    this.setState({
      passToDrop: {
        ...this.state.passToDrop,
        visible: false
      }
    })
    if (this.hintVisible) {
      this.deleteHint(this.hintVisible);
    }
  }

  renderDropDown() {
    if (this.state.passToDrop.visible) {
      return (
        <DropDown
          properties={this.state.passToDrop}
          ref={elm => this.dropDownRef = elm}
        />
      )
    }
    return <div />
  }

  render() {
    return (
      <div className="Editor_container"   >
        <ReactQuill
          theme='bubble'
          modules={{
            toolbar: false,
          }}
          className='Editor_wrapper'
          onKeyDown={this.onKeyDown}
          onChange={this.getDictionary}
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
        {this.renderDropDown()}
      </div>
    );
  }
}

export default Editor;
