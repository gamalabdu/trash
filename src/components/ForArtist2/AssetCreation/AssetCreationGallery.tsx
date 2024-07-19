import React from 'react';
import './styles.css'

interface Props {
    images : {
        title: string,
        subtitle: string
        imageSrc: string
      }[]
}

const AssetCreationGallery: React.FC<Props> = ({ images }) => {

  const preventLinkClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
  };

  return (
    <section className='gallery'>
      {images.map((image, index) => (
        <div key={index} className='image'>
          <a href={image.imageSrc} onClick={preventLinkClick} className='non-clickable-link'>
            <img src={image.imageSrc} alt={image.title} style={{ filter:"brightness(1.2)"}} />
          </a>
        </div>
      ))}
    </section>
  );
};

export default AssetCreationGallery;
