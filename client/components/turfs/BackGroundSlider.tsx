import { useState, useEffect } from 'react';
import { VENUES_SLIDER_IMAGES } from '@/constants';

export const BackgroundSlider = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % VENUES_SLIDER_IMAGES.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {VENUES_SLIDER_IMAGES.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ))}
    </>
  );
};