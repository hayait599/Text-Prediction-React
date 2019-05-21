import React from 'react';
import Checkbox from 'react-simple-checkbox';
import '../statics/checkbox.css';

export default function CheckboxSection(props) {
  return (
    <div className="CheckBox_container">
          <div className="CheckBox_item">
            <Checkbox
              size={2}
              color='#4b0082'
              checked={props.enableLanguagePrediction}
              onChange={props.onLanguageChange}
            />
            <label>Language Prediction</label>
          </div>
          <div className="CheckBox_item">
            <Checkbox
              size={2}
              color='#4b0082'
              checked={props.enableDictionaryPrediction}
              onChange={props.onDictionaryChange}
            />
            <label>Dictionary Prediction</label>
          </div>
        </div>
  );
};


