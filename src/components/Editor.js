import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill, { Quill } from 'react-quill';
import DropDown from './DropDown';
import CheckboxSection from './CheckboxSection';
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
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onClick = this.onClick.bind(this)
    this.getBlot = this.getBlot.bind(this)
    this.getDictionary = this.getDictionary.bind(this)
    this.getHints = this.getHints.bind(this)
    this.addHintFromDropDown = this.addHintFromDropDown.bind(this)
    this.state = {
      enableDictionaryPrediction: false,
      enableLanguagePrediction: true,
      dictionary: false,
      passToDrop: {
        visible: false
      }
    }
  }

  componentWillMount() {
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
    this.editorRef = this.quillRef.getEditor();
    this.editorRef.deleteText(rangeFrom.index, word.length, Quill.sources.API);
    this.hintVisible = null
  }

  deleteEnerHint({ rangeFrom, word }) {
    this.editorRef = this.quillRef.getEditor();
    this.editorRef.deleteText(rangeFrom.index, word.length + 1, Quill.sources.API);
    this.editorRef.insertText(
      rangeFrom,
      '\n',
      'api'
    );
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
    this.editorRef.deleteText(cursorPosition - 1, 1, Quill.sources.API);
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
    if (this.state.dictionary) {
      text = `${text.slice(lastWord.length, text.length)}`
      this.editorRef.insertText(cursorPosition - 1, `${text}`, Quill.sources.API)
    } else {
      this.editorRef.insertText(cursorPosition - 1, `${text}`, Quill.sources.API);
    }

    this.editorRef.setSelection(cursorPosition + `${text}`.length - 1, Quill.sources.API);
    this.editorRef.deleteText(cursorPosition + `${text}`.length - 1, 1, Quill.sources.API);
  };

  findLine() {
    this.editorRef = this.quillRef.getEditor();
    const cursorPosition = this.editorRef.selection.getNativeRange().end.offset;
    const Parchment = Quill.import('parchment');
    const selection = document.getSelection();
    const node = selection.getRangeAt(0).startContainer
    const blot = Parchment.find(node)
    let block = blot;
    while (block.statics.blotName !== 'block' && block.parent) {
      block = block.parent;
    }
    const root = block.parent;
    let cur;
    const next = root.children.iterator();
    let index = 0;
    while (cur = next()) {
      index++;
      if (cur === block) break;
    }
    return {
      index,
      cursorPosition
    };
  };

  async getHints() {
    const blot = this.getBlot();
    if (blot) {
      const text = blot.text;
      if (text) {
        const space = text.split(' ');
        if (space[space.length - 1] !== '') {
          const hintText = text.trim().split(' ').splice(-1).join(' ');
          const { cursorPosition, index } = this.findLine();
          const hints = await Api.getHints({ hintText, cursorPosition, index })
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
            this.insertHint(hints[0].word)
          }
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
        const dicPredicts = dicPredictions.slice(0, 5);
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

  onKeyUp(event) {
    if (!this.state.enableDictionaryPrediction) {
      return
    }
    const keyCode = event.keyCode;
    const ignoreCodes = [32, 39, 35, 9, 8]

    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    if (!ignoreCodes.includes(keyCode)) {
      this.timer = setTimeout(() => this.getDictionary(), 500);
    } else {
      this.setState({
        passToDrop: {
          ...this.state.passToDrop,
          visible: false
        }
      })
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
      event.preventDefault();
      event.stopPropagation();
      if (this.hintVisible) {
        this.deleteEnerHint(this.hintVisible);
      }
      return
    }

    if (!this.state.enableLanguagePrediction) {
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
      this.getHints()
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

  componentDidMount() {
    this.timer = null;
  }

  render() {
    return (
      <div className="Main_container">
        <CheckboxSection
          enableLanguagePrediction={this.state.enableLanguagePrediction}
          enableDictionaryPrediction={this.state.enableDictionaryPrediction}
          onLanguageChange={() => this.setState({ enableLanguagePrediction: !this.state.enableLanguagePrediction })}
          onDictionaryChange={() => this.setState({ enableDictionaryPrediction: !this.state.enableDictionaryPrediction })}
        />
        <div className="Editor_container">
          <ReactQuill
            theme='bubble'
            modules={{
              toolbar: false,
            }}
            className='Editor_wrapper'
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp}
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
      </div>
    );
  }
}

export default Editor;
