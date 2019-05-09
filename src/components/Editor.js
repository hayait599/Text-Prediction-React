import React from 'react';
import ReactQuill from 'react-quill';
import '../statics/editor.css';
import 'react-quill/dist/quill.bubble.css';

class Editor extends React.Component {

  render() {
    return (
      <ReactQuill
        theme='bubble'
        modules={{
          toolbar: false,
        }}
        toolbar={false}
        className='Editor_container'
      >
        <div
          key="editor"
          ref="editor"
          className="quill-contents Editor"
        />
      </ReactQuill>
    );
  }
}

export default Editor;
