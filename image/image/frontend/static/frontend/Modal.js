import React from 'react';
import ReactDom from 'react-dom';

function Modal(props) {
  const elem = <div className="popOverlay">{props.children}</div>;
  return ReactDom.createPortal(
    elem,
    document.getElementById('boost-performance-react-portal')
  );
}

export default Modal;
