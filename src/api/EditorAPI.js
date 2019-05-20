import axios from 'axios';

class Api {

  getHints({ hintText }) {
    console.log(hintText)
    if (hintText.length !== 0 && hintText && hintText !== 'undefined') {
      return axios.get(`https://protected-mesa-89217.herokuapp.com/api/${hintText}/5/5`, {
        method: 'HEAD',
        mode: 'no-cors',
      })
        .then(res => {
          const hints = res.data;
          return hints
        })
    }
  }

  getDictionaryPrediction({ lastWord }) {
    if (lastWord !== 'undefined' && lastWord.length !== 0 && lastWord  ) {
      return axios.get(`https://protected-mesa-89217.herokuapp.com/dictionary/${lastWord}`, {
        method: 'HEAD',
        mode: 'no-cors',
      })
        .then(res => {
          return res.data
        })
    }
  }
}

export default new Api();
