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
import useAudioService from '../services/AudioService';

export default function FlashcardSlider({ flashcards, playFlipSound }) {
  const { playSwipeSound } = useAudioService();
  const [flipStates, setFlipStates] = useState(Array(flashcards.length).fill(false));

  const handleRealSlideChange = () => {
    // Only play sound on actual slide changes, not initial load
    playSwipeSound();
    setFlipStates(prev => prev.map(() => false));
  };

  const handleFlip = (index) => {
    setFlipStates(prev => 
      prev.map((state, i) => i === index ? !state : state)
    );
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
      onSlideNextTransitionStart={handleRealSlideChange}
      onSlidePrevTransitionStart={handleRealSlideChange}
    >
      {flashcards.map((flashcard, index) => (
        <SwiperSlide key={flashcard.id || index} style={{ height: '100%' }}>
          <Flashcard
            flashcard={flashcard}
            flip={flipStates[index] || false}
            onFlip={() => handleFlip(index)}
            playFlipSound={playFlipSound}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

FlashcardSlider.propTypes = {
  flashcards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      question: PropTypes.string.isRequired,
      ans: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ]).isRequired,
      option: PropTypes.arrayOf(PropTypes.string).isRequired,
      type: PropTypes.string,
      image_link: PropTypes.string,
      reasoning: PropTypes.string,
    })
  ).isRequired,
  playFlipSound: PropTypes.func
};
