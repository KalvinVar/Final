import React, { useRef, useEffect } from 'react';

const useAudioService = () => {
  // Button click sound
  const buttonClickSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/107/107152_1838182-lq.mp3'));
  // Swipe sound
  const swipeSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/240/240777_4107740-lq.mp3'));
  // Generate flashcards sound
  const generateFlashcardsSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/630/630498_10616645-lq.mp3'));
  // Card flip sound
  const cardFlipSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/554/554208_12395540-lq.mp3'));

  // Special sounds with their original unique sounds
  const dragStartSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/448/448081_9159316-hq.mp3')); 
  const dragEndSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/448/448081_9159316-hq.mp3'));
  const optionSelectSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/475/475188_3248005-lq.mp3'));
  const highScoreSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3')); 
  const completionSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/522/522720_12280991-lq.mp3')); 

  useEffect(() => {
    // Set volumes
    buttonClickSoundRef.current.volume = 0.5;
    swipeSoundRef.current.volume = 0.3;
    generateFlashcardsSoundRef.current.volume = 0.3;
    cardFlipSoundRef.current.volume = 0.3;
    dragStartSoundRef.current.volume = 0.3;
    dragEndSoundRef.current.volume = 0.3;
    
    // Load the sounds
    dragStartSoundRef.current.load();
    dragEndSoundRef.current.load();
  }, []);

  const playSound = (audioRef) => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error("Error playing sound:", e));
      }
    } catch (e) {
      console.error("Error with audio playback:", e);
    }
  };

  const playButtonClickSound = () => playSound(buttonClickSoundRef);
  const playDragStartSound = () => playSound(dragStartSoundRef);
  const playDragEndSound = () => playSound(dragEndSoundRef);
  const playOptionSelectSound = () => playSound(optionSelectSoundRef);
  const playHighScoreSound = () => playSound(highScoreSoundRef);
  const playCompletionSound = () => playSound(completionSoundRef);
  const playGenerateFlashcardsSound = () => playSound(generateFlashcardsSoundRef);

  // Flip sound function now returns a promise
  const playCardFlipSound = () => {
    return new Promise((resolve) => {
      const audio = cardFlipSoundRef.current;
      audio.currentTime = 0; // Reset audio to start

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            resolve();
          })
          .catch(() => {
            resolve(); // Resolve even if audio fails
          });
      } else {
        resolve();
      }
    });
  };

  const playSwipeSound = () => {
    try {
      swipeSoundRef.current.currentTime = 0;
      swipeSoundRef.current.play().catch(e => console.error("Error playing swipe sound:", e));
    } catch (e) {
      console.error("Error with swipe sound playback:", e);
    }
  };

  // Create hidden audio elements for preloading
  const audioElements = (
    <div style={{ display: 'none' }}>
      <audio src='https://cdn.freesound.org/previews/107/107152_1838182-lq.mp3' preload='auto' />
      <audio src='https://cdn.freesound.org/previews/242/242503_4414128-lq.mp3' preload='auto' />
      <audio src='https://cdn.freesound.org/previews/448/448081_9159316-hq.mp3' preload='auto' />
      <audio src='https://cdn.freesound.org/previews/475/475188_3248005-lq.mp3' preload='auto' />
      <audio src='https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3' preload='auto' />
      <audio src='https://cdn.freesound.org/previews/522/522720_12280991-lq.mp3' preload='auto' />
      <audio src='https://cdn.freesound.org/previews/630/630498_10616645-lq.mp3' preload='auto' />
      <audio src='https://cdn.freesound.org/previews/554/554208_12395540-lq.mp3' preload='auto' />
      <audio src="https://cdn.freesound.org/previews/240/240777_4107740-lq.mp3" preload="auto" />
      <audio src='https://cdn.freesound.org/previews/448/448081_9159316-hq.mp3' preload='auto' id="dragStart" />
      <audio src='https://cdn.freesound.org/previews/448/448081_9159316-hq.mp3' preload='auto' id="dragEnd" />
    </div>
  );

  return {
    audioElements,
    playButtonClickSound,
    playDragStartSound,
    playDragEndSound,
    playOptionSelectSound,
    playHighScoreSound,
    playCompletionSound,
    playGenerateFlashcardsSound,
    // Map playFlipSound to playCardFlipSound so that components using playFlipSound work as expected.
    playFlipSound: playCardFlipSound,
    playSwipeSound
  };
};

export default useAudioService;