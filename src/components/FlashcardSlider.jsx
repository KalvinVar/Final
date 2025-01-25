import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Flashcard from './Flashcard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../app.css';
import './styles.css';
import { Pagination, Navigation } from 'swiper/modules';

export default function FlashcardSlider({ flashcards }) {
  const [flipStates, setFlipStates] = useState(flashcards.map(() => false));

  const handleSlideChange = () => {
    setFlipStates(flipStates.map(() => false));
  };

  const handleFlip = (index) => {
    setFlipStates(flipStates.map((flip, i) => (i === index ? !flip : flip)));
  };

  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      loop={true}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Pagination, Navigation]}
      className="mySwiper"
      onSlideChange={handleSlideChange}
    >
      {flashcards.map((flashcard, index) => (
        <SwiperSlide key={flashcard.id}>
          <Flashcard
            flashcard={flashcard}
            flip={flipStates[index]}
            onFlip={() => handleFlip(index)}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// Define propTypes for FlashcardSlider
FlashcardSlider.propTypes = {
  flashcards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      ans: PropTypes.string.isRequired,
      option: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
};
