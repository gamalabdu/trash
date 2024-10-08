
// import React, { useState } from 'react';
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
//   const [selectedMedia, setSelectedMedia] = useState<null | {
//     title: string;
//     subtitle: string;
//     src: string;
//     type: "photo" | "video";
//   }>(null);

//   const handleMediaClick = (item: { title: string; subtitle: string; src: string; type: "photo" | "video" }) => {
//     setSelectedMedia(item);
//   };

//   const closeModal = () => {
//     setSelectedMedia(null);
//   };

//   const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
//     if (e.target === e.currentTarget) {
//       closeModal(); // Close the modal if the background (outside content) is clicked
//     }
//   };

//   return (
//     <>
//       <section className='gallery'>
//         {media.map((item, index) => (
//           <div key={index} className='image' onClick={() => handleMediaClick(item)}>
//             {item.type === "photo" ? (
//               <img src={item.src} alt={item.title} style={{ filter: "brightness(1.2)" }} />
//             ) : (
//               <video
//                 src={item.src}
//                 className="gallery-video"
//                 muted
//                 onMouseEnter={(e) => e.currentTarget.play()}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.pause();
//                   e.currentTarget.currentTime = 0;
//                 }}
//                 loop
//                 playsInline
//                 style={{ filter: "brightness(1.2)", width: "100%" }}
//               />
//             )}
//           </div>
//         ))}
//       </section>

//       {selectedMedia && (
//         <div className="modal" onClick={handleBackgroundClick}>
//           <div className="modal-content">
//             <span className="close-button" onClick={closeModal}>&times;</span>
//             {selectedMedia.type === "photo" ? (
//               <img src={selectedMedia.src} alt={selectedMedia.title}  />
//             ) : (
//               <video src={selectedMedia.src} controls={false} loop autoPlay muted playsInline/>
//             )}
//             <p>{selectedMedia.title} - {selectedMedia.subtitle}</p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AssetCreationGallery;




import React, { useState } from 'react';
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
  const [selectedMedia, setSelectedMedia] = useState<null | {
    title: string;
    subtitle: string;
    src: string;
    type: "photo" | "video";
  }>(null);

  const handleMediaClick = (item: { title: string; subtitle: string; src: string; type: "photo" | "video" }) => {
    setSelectedMedia(item);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      closeModal(); // Close the modal if the background (outside content) is clicked
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.play().catch((error) => {
      // Handle any play() errors here, such as user interaction required
      console.error("Play was prevented", error);
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setTimeout(() => {
      if (!video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    }, 100); // Adding a small delay to avoid conflicts
  };

  return (
    <>
      <section className='gallery'>
        {media.map((item, index) => (
          <div key={index} className='image' onClick={() => handleMediaClick(item)}>
            {item.type === "photo" ? (
              <img src={item.src} alt={item.title} style={{ filter: "brightness(1.2)" }} />
            ) : (
              <video
                src={item.src}
                className="gallery-video"
                muted
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                loop
                playsInline
                style={{ filter: "brightness(1.2)", width: "100%" }}
              />
            )}
          </div>
        ))}
      </section>

      {selectedMedia && (
        <div className="modal" onClick={handleBackgroundClick}>
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            {selectedMedia.type === "photo" ? (
              <img src={selectedMedia.src} alt={selectedMedia.title}  />
            ) : (
              <video src={selectedMedia.src} controls={false} loop autoPlay muted playsInline/>
            )}
            <p>{selectedMedia.title} - {selectedMedia.subtitle}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AssetCreationGallery;
