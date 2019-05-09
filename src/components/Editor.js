import React from 'react';
<<<<<<< HEAD
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';

class Editor extends React.Component {

  constructor(props) {

    super(props)

    this.state = { editorHtml: '', theme: 'snow' }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(html) {
    this.setState({ editorHtml: html });
  }

  handleThemeChange(newTheme) {
    if (newTheme === "core") newTheme = null;
    this.setState({ theme: newTheme })
  }

  render() {
    return (
      <div>
        <ReactQuill
          theme='bubble'
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={Editor.modules}
          formats={Editor.formats}
          bounds={'.app'}

        />
      </div>
    )
  }
}
/* 
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
Editor.modules = {
  toolbar: false,
}
/* 
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
]


export default Editor;
=======
import '../statics/editor.css';

export default function Editor(props) {
  return (
    <div className="Editor_container">
      <textarea className="Editor" />
    </div>
  );
};


>>>>>>> 0391aae9c38a8470093fa50cd1dd595b9881ed9c
