import React, { useState, useRef } from 'react';
import Modal from '../Modal';
import './uploadModal.scss';
function UploadModal(props) {
  const {
    maxFileSize = 1000000,
    maxFileUploads = 5,
    closeModal,
    allowedFileType = [],
    onFileupload,
    addDatatoParent,
    instructions = [
      'Only Allowed Resolution 1024 x 1024'
    ]
  } = props;

  const [isUploadAllowed, setUploadAllowed] = useState(true);
  const [isDragging, updateIsDragging] = useState(false);
  const [isSaveDisabled, setSaveDisabled] = useState(false);
  const [currentFiles, updateCurrentFiles] = useState([]);
  const [droppedFileCount, setDroppedFileCount] = useState(0);
  const fileInputRef = useRef(null);

  const dragenterListener = event => {
    overrideEventDefaults(event);
    if (event.dataTransfer.items && event.dataTransfer.items[0]) {
      updateIsDragging(true);
    } else if (
      event.dataTransfer.types &&
      event.dataTransfer.types[0] === 'Files'
    ) {
      // for IE browser
      updateIsDragging(true);
    }
  };

  const dragleaveListener = event => {
    overrideEventDefaults(event);
  };

  const dropListener = event => {
    overrideEventDefaults(event);
    updateIsDragging(false);
    if (!isUploadAllowed || currentFiles.length === maxFileUploads) return;

    if (event.dataTransfer.files) {
      const ArrayLength = event.dataTransfer.files.length;
      if (ArrayLength + currentFiles.length > maxFileUploads) {
        // display error message.
        return;
      }
      for (let index = 0; index < ArrayLength; index++) {
        let file = event.dataTransfer.files[index];
        if (
          file &&
          file.size < maxFileSize &&
          (allowedFileType.length === 0 || allowedFileType.includes(file.type))
        ) {
          updateCurrentFiles(prevState => {
            const newFileArray = [
              ...prevState,
              {
                file,
                description: file.name
                  .split('.')
                  .slice(0, -1)
                  .join('.'),
                status: 'ready',
                error: ''
              }
            ];
            return newFileArray;
          });
        } else {
          setDroppedFileCount(prev => prev + 1);
          return;
        }
      }
    }
  };

  const overrideEventDefaults = event => {
    event.preventDefault();
  };

  const onSelectFileClick = () => {
    fileInputRef && fileInputRef.current.click();
  };

  const onFileChanged = event => {
    setDroppedFileCount(0);
    if (event.target.files) {
      const ArrayLength = event.target.files.length;
      if (ArrayLength + currentFiles.length > maxFileUploads) {
        // display error message.
        return;
      }
      for (let index = 0; index < ArrayLength; index++) {
        let file = event.target.files[index];
        if (file && file.size < maxFileSize) {
          updateCurrentFiles(prevState => {
            const newFileArray = [
              ...prevState,
              {
                file,
                description: file.name
                  .split('.')
                  .slice(0, -1)
                  .join('.'),
                status: 'ready',
                error: ''
              }
            ];
            return newFileArray;
          });
        } else {
          setDroppedFileCount(prev => prev + 1);
          return;
        }
      }
    }
  };

  const retrySingleFile = (uploadContent, contentIndex) => {
    let newArray = currentFiles.filter((el, itemIndex) => {
      if (itemIndex === contentIndex) {
        el.error = '';
        el.status = 'loading';
      }
      return el;
    });
    updateCurrentFiles(newArray);
    let callPromise = onFileupload(uploadContent);
    callPromise
      .then(response => {
        const { data } = response;
        const currentFileResponse = data.files[0];
        if (currentFileResponse.error === undefined) {
          // set error.
          uploadContent.status = 'success';
          const newImageResponse = {
            caption: currentFileResponse.caption,
            url: currentFileResponse.url,
            is_active: true,
            id: currentFileResponse.id
          };
          addDatatoParent(newImageResponse);
        } else {
          uploadContent.status = 'error';
          uploadContent.error = currentFileResponse.error;
          // continue success.
        }
        let responseArray = newArray.filter(el => {
          if (el.uniqueId === contentIndex) {
            return uploadContent;
          } else {
            return el;
          }
        });

        updateCurrentFiles(responseArray);
      })
      .catch();
  };

  const uploadAPICall = () => {
    if (currentFiles.length === 0) return;
    setUploadAllowed(false);
    setSaveDisabled(true);

    let newArray = currentFiles.map(el => {
      if (el.status !== 'success') {
        el.error = '';
        el.status = 'loading';
      }
      return el;
    });
    updateCurrentFiles(newArray);

    newArray.forEach((fileObj, index) => {
      if (fileObj.status !== 'success') {
        let callPromise = onFileupload(fileObj);
        callPromise
          .then(response => {
            const { data } = response;
            const currentFileResponse = data.files[0];
            if (currentFileResponse.error === undefined) {
              // set error.
              fileObj.status = 'success';
              const newImageResponse = {
                caption: currentFileResponse.caption,
                width: '',
                url: currentFileResponse.url,
                height: '',
                is_active: true,
                id: currentFileResponse.id
              };
              addDatatoParent(newImageResponse);
            } else {
              fileObj.status = 'error';
              fileObj.error = currentFileResponse.error;
              // continue success.
            }

            let responseArray = newArray.filter((value, itemIndex) => {
              if (itemIndex === index) {
                return fileObj;
              } else {
                return value;
              }
            });

            updateCurrentFiles(responseArray);
          })
          .catch();
      }
    });
  };

  const removeFile = itemUniqueId => {
    const newArray = currentFiles.filter((value, fileIndex) => {
      return fileIndex !== itemUniqueId;
    });
    updateCurrentFiles(newArray);
  };

  const convetToImage = itemUniqueId => {
    let file;
    currentFiles.forEach((element, fileIndex) => {
      if (fileIndex === itemUniqueId) {
        file = element.file;
      }
    });
    if (file !== null && /^image\//.test(file.type)) {
      return URL.createObjectURL(file);
    }
    return false;
  };

  const setDescription = (data, elementUniqueId) => {
    let newArray = currentFiles.map((elm, fileIndex) => {
      if (elementUniqueId === fileIndex) {
        elm.description = data;
      }
      return elm;
    });
    updateCurrentFiles(newArray);
  };

  return (
    <Modal>
      <div className="popModal zoom popShow">
        <div className="popContent" style={{ width: '80%' }}>
          <div className="width100 dib whiteBg  pad20 borderTop">
            <section
              className="width100 dib padLR30 padTB15"
              style={{ display: 'flex' }}
            >
              <div
                style={{ verticalAlign: 'top', userSelect: 'none' }}
                className="width20 dib"
              >
                <ul style={{ padding: 0 }}>
                  <li>
                    <p className="borderBtm width100 padTB10 black ico20">
                      Instructions
                    </p>
                    <div className="width100 dib marginT5">
                      <ul style={{ paddingLeft: 0 }}>
                        {instructions.map((el, index) => (
                          <li
                            key={index}
                            className="instructionList width100 dib padTB10 borderBtm black flexWrap"
                          >
                            {el}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>

              <div
                className="dib padTB20 padLR20 photo-wrapper"
                style={
                  isDragging && isUploadAllowed
                    ? { backgroundColor: '#d2cdcd' }
                    : null
                }
                onDrag={overrideEventDefaults}
                onDragStart={overrideEventDefaults}
                onDragEnd={overrideEventDefaults}
                onDragOver={overrideEventDefaults}
                onDragEnter={dragenterListener}
                onDragLeave={dragleaveListener}
                onDrop={dropListener}
              >
                <div>
                  <span className="width100 dib txtCenter">
                    <i className="icon-photo-review ico20 greyLt dib padR5" />
                    <span className="dib ico16 greyDr">File Uploader</span>
                  </span>
                  <span className="width100 dib padT10 padB15 txtCenter ico13 greyLt lh1-2">
                    Drag and drop your files anywhere or
                  </span>
                  {droppedFileCount !== 0 && (
                    <span
                      style={{ color: 'red' }}
                      className="width100 dib padT10 padB15 txtCenter ico13 greyLt lh1-2"
                    >
                      {droppedFileCount} file dropped because of improper size
                      or type.
                    </span>
                  )}
                  <div className="width100 dib txtCenter marginB20">
                    <div className="dib txtCenter">
                      <div
                        className="dib txtCenter ButtonStyle"
                        style={
                          !isUploadAllowed ||
                          currentFiles.length === maxFileUploads
                            ? { backgroundColor: '#D3D3D3' }
                            : null
                        }
                        onClick={onSelectFileClick}
                      >
                        Upload File
                      </div>
                      <input
                        style={{ display: 'none' }}
                        disabled={
                          !isUploadAllowed ||
                          currentFiles.length === maxFileUploads
                        }
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="file-uploader__input"
                        onChange={onFileChanged}
                        accept={allowedFileType}
                        name="photo"
                        id="photo"
                      />
                    </div>
                  </div>
                </div>

                <div className="imageContainer">
                  {currentFiles.map((el, fileIndex) => (
                    <div
                      className="width30 box"
                      style={{ position: 'relative', maxWidth: '215px' }}
                      key={fileIndex}
                    >
                      {el.status !== 'success' && el.status !== 'loading' && (
                        <button
                          className="x-close"
                          onClick={() => removeFile(fileIndex)}
                        >
                          <span
                            className="glyphicon glyphicon-remove"
                            aria-hidden="true"
                            style={{ fontSize: '18px' }}
                          />
                        </button>
                      )}
                      {el.status === 'success' && (
                        <button
                          className="x-close"
                          style={{ background: 'green' }}
                        >
                          <span
                            className="glyphicon glyphicon-ok"
                            aria-hidden="true"
                            style={{ fontSize: '18px' }}
                          />
                        </button>
                      )}
                      {el.status === 'error' && (
                        <div
                          className="overlayBox"
                          style={{ border: '2px solid red' }}
                        >
                          <span
                            className="glyphicon glyphicon-repeat"
                            aria-hidden="true"
                            style={{ fontSize: '45px', cursor: 'pointer' }}
                            onClick={() => retrySingleFile(el, fileIndex)}
                          />
                        </div>
                      )}
                      {el.status === 'loading' && (
                        <div
                          className="overlayBox loading"
                          style={{ margin: 0 }}
                        >
                          <div className="lds-facebook">
                            <div />
                            <div />
                            <div />
                          </div>
                        </div>
                      )}
                      {convetToImage(fileIndex) ? (
                        <img
                          style={
                            el.status === 'error'
                              ? { border: '3px solid red' }
                              : null
                          }
                          src={convetToImage(fileIndex)}
                          alt={el.file.name}
                          className="img-thumbnail"
                        />
                      ) : (
                        <div className="img-thumbnail">
                          <span
                            className="glyphicon glyphicon-envelope"
                            aria-hidden="true"
                            style={{ fontSize: '22px' }}
                          />
                        </div>
                      )}
                      <input
                        disabled={isSaveDisabled}
                        type="text"
                        style={{ width: '200px' }}
                        className="inputFiled"
                        value={el.description}
                        onChange={e =>
                          setDescription(e.target.value, fileIndex)
                        }
                      />
                      <div
                        style={
                          el.error === ''
                            ? { color: 'red', visibility: 'hidden' }
                            : { color: 'red' }
                        }
                      >
                        {el.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="width100 dib padLR30">
              <div className="width100 dib">
                <span className="dib fr">
                  <button
                    className="ButtonStyle marginR5"
                    onClick={() => closeModal()}
                  >
                    {isUploadAllowed ? 'Cancel' : 'Close'}
                  </button>
                  <button
                    className="ButtonStyle marginR5"
                    style={
                      isSaveDisabled ? { backgroundColor: '#D3D3D3' } : null
                    }
                    disabled={isSaveDisabled}
                    onClick={() => uploadAPICall()}
                  >
                    Save
                  </button>
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UploadModal;
