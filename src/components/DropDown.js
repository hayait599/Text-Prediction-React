import React from 'react';
import '../statics/editor.css';

class DropDown extends React.Component {

  constructor(props) {
    super(props)
    this.dropDownRef = React.createRef()
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.moveStep = this.moveStep.bind(this)
    this.rows = []
    this.index = 0
    this.oldIndex = -1
    this.selectedRow = 0
  }

  componentDidMount() {
    const { distanceToBottom, distanceToTop, bounds, hintsArray } = this.props.properties
    for (let i = 0; i < hintsArray.length; i++) {
      let rowItem = document.createElement('div')
      rowItem.id = i
      rowItem.hint = hintsArray[i]
      rowItem.innerHTML = `<div>${hintsArray[i]}</div>`
      rowItem.onmousedown = () => this.onWordSelection(true)
      rowItem.onmouseover = () => this.onMouseHover(i)
      this.rows.push(rowItem)
      this.dropDownRef.appendChild(rowItem)
    }

    if (distanceToTop > distanceToBottom * 3) {
      this.dropDownRef.style.maxHeight = `${distanceToTop}px`
      this.dropDownRef.style.top = `${bounds.top}px`
      this.dropDownRef.style.left = `${bounds.left + 2}px`
    } else {
      this.dropDownRef.style.top = `${bounds.top}px`
      this.dropDownRef.style.left = `${bounds.left + 2}px`
      this.dropDownRef.style.maxHeight = `${distanceToBottom}px`
    }
    this.highLightRow(0)
  }

  highLightRow(index) {
    if (this.oldIndex !== -1 && this.rows[this.oldIndex]) {
      this.rows[this.oldIndex].style.backgroundColor = '#ffffff'
    }
    this.rows[index].style.backgroundColor = '#e5e5e5'
    this.oldIndex = index
  }

  moveStep(step) {
    if (this.index + step === -1 || this.index + step === this.rows.length) {
      return this.rows[this.index]
    }
    this.index += step
    this.highLightRow(this.index)
    const row = document.getElementById(this.index)
    this.dropDownRef.scrollTo({ top: row.offsetTop })
    this.selectedRow = this.index
  }

  onKeyDown(e) {
    this.moveStep(+1)
  }

  onKeyUp(e) {
    this.moveStep(-1)
  }

  onMouseHover(index) {
    this.selectedRow = index
    this.highLightRow(index)
  }

  onWordSelection(addSpace) {
    const word = this.rows[this.selectedRow].hint.trim()
    if (addSpace) {
      this.props.addHint(` ${word}`)
    } else {
      this.props.addHint(word)
    }
  }

  render() {
    return (
      <div
        className="DropDown"
        ref={elm => this.dropDownRef = elm}
      />
    )
  }
}

export default DropDown
