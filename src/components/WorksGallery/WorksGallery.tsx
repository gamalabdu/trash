// import React, { useEffect, useState } from 'react'
// import { CSSTransition, SwitchTransition } from 'react-transition-group'
// import './styles.css'

// interface WorksGalleryProps {
// 	data: {
// 		image: any
// 		type: string
// 	}[]
// 	categories: string[]
// }

// const WorksGallery = (props: WorksGalleryProps) => {
    
// 	const { data, categories } = props

// 	return (
// 		<div className='works-gallery-container'>
// 			{
                
//                 data.map((item, i) => {
				
//                 return (
// 					// <div key={i} className={`image-container ${state.status}`}>
					
// 								<div key={i} className={'image-container'}>
// 									<img className='image' src={item.image} alt='pic' />
// 								</div>
			

// 					// <div key={i} className='image-container'>
// 					// 	<img className='image'  src={item.image} alt='pic' />
// 					// </div>
// 				)
// 			})}
// 		</div>
// 	)
// }

// export default WorksGallery






import React, { useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
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
      <TransitionGroup>
        {
          galleryData.map((item, i) => (

          <CSSTransition key={i} classNames='fade' timeout={400}>
              <img  className='image' src={item.image} alt='pic' />
          </CSSTransition>

        ))}
      </TransitionGroup>
    </div>
  );
};

export default WorksGallery;
