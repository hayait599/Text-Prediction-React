import React from 'react';
import '../statics/editor.css';

class DropDown extends React.Component {

  constructor(props) {
    super(props)
    this.dropDownRef = React.createRef();
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.moveStep = this.moveStep.bind(this)
    this.rows = []
    this.index = 0
    this.oldIndex = -1
    this.selectedRow = 0
  }

  componentDidMount() {
    const { distanceToBottom, distanceToTop, bounds, hintsArray } = this.props.properties;
    for (let i = 0; i < hintsArray.length; i++) {
      let rowItem = document.createElement('div');
      rowItem.hint = hintsArray[i];
      rowItem.innerHTML = `<div>${hintsArray[i]}</div>`;
      this.rows.push(rowItem);
      this.dropDownRef.appendChild(rowItem);
    }

    if (distanceToTop > distanceToBottom * 3) {
      this.dropDownRef.style.maxHeight = `${distanceToTop}px`;
      this.dropDownRef.style.top = `${bounds.top}px`;
      this.dropDownRef.style.left = `${bounds.left + 2}px`;
    } else {
      this.dropDownRef.style.top = `${bounds.top}px`;
      this.dropDownRef.style.left = `${bounds.left + 2}px`;
      this.dropDownRef.style.maxHeight = `${distanceToBottom}px`;
    }
  }

  highLightRow(index) {
    if (this.oldIndex !== -1 && this.rows[this.oldIndex]) {
      this.rows[this.oldIndex].style.backgroundColor = '#ffffff';
    }
    this.rows[index].style.backgroundColor = '#e5e5e5';
    this.oldIndex = index;
  }

  moveStep(step) {
    if (this.index + step === -1 || this.index + step === this.rows.length) {
      return this.rows[this.index];
    }
    this.index += step;
    this.highLightRow(this.index);
    this.selectedRow = this.index
  }

  onKeyDown(e) {
    this.moveStep(+1)
  }

  onKeyUp(e) {
    this.moveStep(-1)
  }

  render() {
    return (
      <div
        className="DropDown"
        ref={elm => this.dropDownRef = elm}
      />
    );
  }
}

export default DropDown
