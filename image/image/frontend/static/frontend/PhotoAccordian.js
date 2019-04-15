import React, { useState, useEffect } from 'react';
import {
  updateImage,
  uploadImages,
  getAccordionlImagesInfo,
  deleteImageAPI
} from '../APIClient';
import { UploadModal } from '../../components';
import { Accordian } from '../../../../components/core';
import ImageComp from './ImagesCard';
import './Photos.scss';

function AccordionComp(props) {
  const allowedFileType = ['image/*'];
  const maxFileSize = 1000000;
  const maxFileUploads = 5;
  const {  } = props;
  const [isAccordionOpen, setAccordionOpen] = useState(isOpen);
  const [accordionlImagesInfo, updateAccordionlImagesInfo] = useState([]);
  const [uploadModalOpen, setUplaodModalOpen] = useState(false);
  useEffect(() => {
    if (isAccordionOpen) {
      let imageResponseData;
      imageResponseData
        .then(response => {
          if (response.data.success) {
            updateAccordionlImagesInfo(response.data.data);
          }
        })
        .catch(e => {
          console.error(`error occured: ${e}`);
        });
    }
    return () => {
      updateAccordionlImagesInfo([]);
    };
  }, [isAccordionOpen]);

  function onFileupload(arg) {
    let formData = new FormData();
    formData.append(
      'csrfmiddlewaretoken',
      document.getElementById('csrf_token').value
    );
    formData.append('name', args.name);
    formData.append('caption', arg.description);
    formData.append('files', arg.file);
    return uploadImages(formData);
  }

  function addDatatoParent(data) {
    updateAccordionlImagesInfo(prevState => [...prevState, data]);
  }

  function deleteImage(imageId) {
    let promiseRes = deleteImageAPI(imageId, { delete_image: true });
    promiseRes
      .then(response => {
        if (response.data.success) {
          let newArray = accordionlImagesInfo.filter(el => el.id !== imageId);
          updateAccordionlImagesInfo(newArray);
        }
      })
      .catch();
  }

  function updateImageCaption(imageId, newCaption) {
    const requestObj = { caption: newCaption, type: type };

    updateImage(imageId, requestObj);
  }

  const headerTitle = title => (
    <div className="ico16 black">
      <span className="dib padR20">
        <img src={getIconImage()} alt="" />
      </span>
      <span className="dib">{title}</span>
    </div>
  );

  const uploadImageComp = (
    <div>
      <div className="width100 dib pad20">
        <div className="addNewCard">
          <div
            style={{
              background: 'red'
            }}
          />
          <span>
            <i
              style={{ fontSize: '100px', color: 'black' }}
              className="glyphicon glyphicon-file"
            />
          </span>
          <div />
          <div
            style={{ marginTop: '10px' }}
            className="ButtonStyle dib txtCenter"
            onClick={() => {
              setUplaodModalOpen(true);
            }}
          >
            Add new file
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Accordian
        isWhiteTheme
        header={headerTitle(typeName)}
        key={typeName}
        defaultOpen={isAccordionOpen}
        onAccordianToggle={() => setAccordionOpen(true)}
      >
        <div className="flex-container">
          {uploadImageComp}
          {accordionlImagesInfo.map(el => {
            return (
              <div key={el.id} style={{ width: '320px' }}>
                <ImageComp
                  data={el}
                  updateImageCaption={updateImageCaption}
                  deleteImage={deleteImage}
                />
              </div>
            );
          })}
        </div>
      </Accordian>
      {uploadModalOpen ? (
        <UploadModal
          type={type}
          addDatatoParent={addDatatoParent}
          onFileupload={onFileupload}
          allowedFileType={allowedFileType}
          maxFileSize={maxFileSize}
          maxFileUploads={maxFileUploads}
          closeModal={() => {
            setUplaodModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

export default AccordionComp;
