// import React from 'react';
// import './styles.css'

// interface Props {
//     images : {
//         title: string,
//         subtitle: string
//         imageSrc: string
//       }[]
// }

// const AssetCreationGallery: React.FC<Props> = ({ images }) => {

//   const preventLinkClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
//     event.preventDefault();
//   };

//   return (
//     <section className='gallery'>
//       {images.map((image, index) => (
//         <div key={index} className='image'>
//           <a href={image.imageSrc} onClick={preventLinkClick} className='non-clickable-link'>
//             <img src={image.imageSrc} alt={image.title} style={{ filter:"brightness(1.2)"}} />
//           </a>
//         </div>
//       ))}
//     </section>
//   );
// };

// export default AssetCreationGallery;











// import React from 'react';
// import './styles.css';

// interface Props {
//   media: {
//     title: string;
//     subtitle: string;
//     src: string;
//     type: "photo" | "video";
//   }[];
// }

// const AssetCreationGallery: React.FC<Props> = ({ media }) => {
//   const preventLinkClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
//     event.preventDefault();
//   };

//   return (
//     <section className='gallery'>
//       {media.map((item, index) => (
//         <div key={index} className='image'>
//           {item.type === "photo" ? (
//             <a href={item.src} onClick={preventLinkClick} className='non-clickable-link'>
//               <img src={item.src} alt={item.title} style={{ filter: "brightness(1.2)" }} />
//             </a>
//           ) : (
//             <video
//               src={item.src}
//               className="gallery-video"
//               muted
//               onMouseEnter={(e) => e.currentTarget.play()}
//               onMouseLeave={(e) => {
//                 e.currentTarget.pause();
//                 e.currentTarget.currentTime = 0;
//               }}
//               loop
//               style={{ filter: "brightness(1.2)", width: "100%" }}
//             />
//           )}
//         </div>
//       ))}
//     </section>
//   );
// };

// export default AssetCreationGallery;









import React from 'react';
import './styles.css';

interface Props {
  media: {
    title: string;
    subtitle: string;
    src: string;
    type: "photo" | "video";
  }[];
}

const AssetCreationGallery: React.FC<Props> = ({ media }) => {
  const preventLinkClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.play().catch((error) => {
      // Handle any play() errors here
      console.error("Play was prevented", error);
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setTimeout(() => {
      video.pause();
      video.currentTime = 0;
    }, 100); // Slight delay to avoid play/pause interruption
  };

  return (
    <section className='gallery'>
      {media.map((item, index) => (
        <div key={index} className='image'>
          {item.type === "photo" ? (
            <a href={item.src} onClick={preventLinkClick} className='non-clickable-link'>
              <img src={item.src} alt={item.title} style={{ filter: "brightness(1.2)" }} />
            </a>
          ) : (
            <video
              src={item.src}
              className="gallery-video"
              muted
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              loop
              style={{ filter: "brightness(1.2)", width: "100%" }}
            />
          )}
        </div>
      ))}
    </section>
  );
};

export default AssetCreationGallery;
