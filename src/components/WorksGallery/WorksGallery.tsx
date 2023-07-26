
import React, { useEffect, useState } from 'react';
import './styles.css';

interface WorksGalleryProps {
  data: {
    image: any;
    type: string;
  }[];
  categories: string[];
}

const WorksGallery = (props: WorksGalleryProps) => {

  const { data, categories } = props;
  const [galleryData, setGalleryData] = useState(data);

  useEffect(() => {
    setGalleryData(data);
  }, [data]);

  return (
    <div className='works-gallery-container'>

        {
          galleryData.map((item, i) => (


              <img  className='image' src={item.image} alt='pic' />


        ))}
    </div>
  );
};

export default WorksGallery;
