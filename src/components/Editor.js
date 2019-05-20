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
    this.getHints = this.getHints.bind(this)
    this.addHintFromDropDown = this.addHintFromDropDown.bind(this)
    this.state = {
      dictionary: false,
      passToDrop: {
        visible: false
      }
    }
  }

  componentDidMount() {
    this.editorRef = this.quillRef.getEditor();
    window.onclick = this.onClick;
    window.oncontextmenu = this.onClick;
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
    // let toDelete = document.getElementsByTagName('span')[0]
    // if (toDelete) {
    //   toDelete.remove();
    //   this.hintVisible = null
    // }
    this.editorRef.deleteText(rangeFrom.index, word.length);
    this.hintVisible = null
  }

  addHint() {
    this.editorRef = this.quillRef.getEditor();
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

  addHintFromDropDown(text) {
    this.setState({
      passToDrop: {
        ...this.state.passToDrop,
        visible: false
      }
    })
    const blott = this.getBlot()
    const blotText = blott.text
    const lastWord = blotText.trim().split(' ').splice(-1).join(' ');
    this.editorRef = this.quillRef.getEditor();
    const cursorPosition = this.editorRef.getSelection().index;
    {
      this.state.dictionary ?
        this.editorRef.insertText(cursorPosition - 1, `${text.slice(lastWord.length, text.length)}`, Quill.sources.USER)
        :
        this.editorRef.insertText(cursorPosition - 1, `${text}`, Quill.sources.USER);
    }
    this.editorRef.setSelection(cursorPosition + `${text}`.length - 1, Quill.sources.USER);
    this.editorRef.deleteText(cursorPosition + `${text}`.length - 1, 1, Quill.sources.USER);
  };

  async getHints() {
    const blot = this.getBlot();
    if (blot) {
      const text = blot.text;
      if (text) {
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
              dictionary: false,
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

  async getDictionary() {
    const blot = this.getBlot();
    if (blot) {
      const text = blot.text;
      if (typeof text !== "undefined") {
        const lastWord = text.trim().split(' ').splice(-1).join(' ');
        const dicPredictions = await Api.getDictionaryPrediction({ lastWord })
        const dicPredicts = dicPredictions.slice(0, 4);
        if (dicPredicts) {
          if (dicPredicts.length > 2) {
            const height = (window.innerHeight || document.documentElement.clientHeight);
            const parentNode = ReactDOM.findDOMNode(this.quillRef).getBoundingClientRect();
            const distanceToTop = parentNode.top - 6;
            const distanceToBottom = height - parentNode.bottom - 6;
            this.editorRef = this.quillRef.getEditor()
            const range = this.editorRef.getSelection();
            const bounds = this.editorRef.getBounds(range);
            const hintsArray = dicPredicts
            this.setState({
              dictionary: true,
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
        }
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

    if (keyCode === tabCode && this.state.passToDrop.visible) {
      event.preventDefault();
      event.stopPropagation();
      this.dropDownRef.onWordSelection();
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

    if (keyCode === tabCode) {
      event.preventDefault();
      event.stopPropagation();
      if (this.hintVisible) {
        this.addHint();
      }
      return
    }

    if (this.hintVisible) {
      this.deleteHint(this.hintVisible);
    }

    if (keyCode === spaceCode) {
      this.getHints();
    } else {
      this.getDictionary();
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
          addHint={this.addHintFromDropDown}
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
          onKeyUp={this.onKeyDown}
          ref={(elm) => { this.quillRef = elm }}
        >
          <div
            key='editor'
            ref='editor'
            className="quill-contents Editor"
          />
        </ReactQuill>
        {this.renderDropDown()}
      </div>
    );
  }
}

export default Editor;
