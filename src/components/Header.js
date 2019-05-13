import React from 'react';
import wixLogo from "../images/wix-logo.png";
import '../statics/header.css';

export default function Header(props) {
  return (
    <div className="Img_container">
      <img
        className="Img_logo"
        src={wixLogo}
        alt="wix-logo"
      />
      <p className="Title">Text Prediction</p>
    </div>
  );
};


