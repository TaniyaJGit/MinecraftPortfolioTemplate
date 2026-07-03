const pages = ['about-page', 'projects-page', 'creative-page', 'experiences-page', 'music-page'];

const tune = document.getElementById('tune');
const musicLabel = document.getElementById('music-label');
const jukeboxImg = document.getElementById('jukebox-img');
const notesLayer = document.getElementById('notes-layer');
const nowPlayingBar = document.getElementById('now-playing-bar');
const nowPlayingText = document.getElementById('now-playing-text');

const musicVolume = document.getElementById('music-volume');
const soundVolume = document.getElementById('sound-volume');
const musicVolumeValue = document.getElementById('music-volume-value');
const soundVolumeValue = document.getElementById('sound-volume-value');
const musicSliderBox = document.getElementById('music-slider-box');
const soundSliderBox = document.getElementById('sound-slider-box');

if (tune) tune.loop = true;

const ABOUT_RECORD_VOLUME_MULTIPLIER = 0.18;

function updateMinecraftSlider(input, valueText, box) {
  if (!input || !valueText || !box) return;
  const value = Number(input.value);
  valueText.textContent = value;
  box.style.setProperty('--slider-fill', value + '%');
}

function getMusicVolume() {
  return musicVolume ? Number(musicVolume.value) / 100 : 0.8;
}

function getSoundVolume() {
  return soundVolume ? Number(soundVolume.value) / 100 : 0.32;
}

function getSoundEffectGain(type) {
  if (type === 'levelup') return 0.09;
  return 0.55;
}

function applyMusicVolume() {
  if (!musicVolume) return;
  const volume = getMusicVolume();
  tune.volume = volume;
  const aboutRecordAudio = document.getElementById('aboutMiniAlbumAudio');
  if (aboutRecordAudio) {
    aboutRecordAudio.volume = volume * ABOUT_RECORD_VOLUME_MULTIPLIER;
  }
  updateMinecraftSlider(musicVolume, musicVolumeValue, musicSliderBox);
}

function applySoundVolume() {
  updateMinecraftSlider(soundVolume, soundVolumeValue, soundSliderBox);
}

const SOUND_EFFECT_URLS = {
  click: 'sound effects/sfx-button-click.mp3',
  levelup: 'sound effects/sfx-level-up.mp3'
};

let uiAudioContext = null;
const uiSoundBuffers = {};
const htmlSoundPools = {};

function getUiAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!uiAudioContext) {
    uiAudioContext = new AudioContextClass({ latencyHint: 'interactive' });
  }

  if (uiAudioContext.state === 'suspended') {
    uiAudioContext.resume().catch(function () {});
  }

  return uiAudioContext;
}

function buildHtmlSoundPool(type) {
  const url = SOUND_EFFECT_URLS[type];
  if (!url || htmlSoundPools[type]) return;

  htmlSoundPools[type] = Array.from({ length: 8 }, function () {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.load();
    return audio;
  });
}

function preloadUiSound(type) {
  const url = SOUND_EFFECT_URLS[type];
  if (!url || uiSoundBuffers[type]) return;

  buildHtmlSoundPool(type);

  const ctx = getUiAudioContext();
  if (!ctx) return;

  fetch(url)
    .then(function (response) { return response.arrayBuffer(); })
    .then(function (arrayBuffer) { return ctx.decodeAudioData(arrayBuffer); })
    .then(function (buffer) { uiSoundBuffers[type] = buffer; })
    .catch(function () {
    });
}

function preloadAllUiSounds() {
  preloadUiSound('click');
  preloadUiSound('levelup');
}

function playHtmlSoundFallback(type) {
  buildHtmlSoundPool(type);
  const pool = htmlSoundPools[type] || htmlSoundPools.click;
  if (!pool || !pool.length) return;

  const sound = pool.find(function (audio) { return audio.paused || audio.ended; }) || pool[0];
  sound.pause();
  sound.volume = Math.min(1, getSoundVolume() * getSoundEffectGain(type));

  try {
    const clickOffset = sound.duration && sound.duration > 0.55 ? 0.5 : 0;
    sound.currentTime = type === 'click' ? clickOffset : 0;
  } catch (error) {
    sound.currentTime = 0;
  }

  sound.play().catch(function () {});
}

function playSoundEffect(type) {
  type = type || 'click';
  const volume = getSoundVolume() * getSoundEffectGain(type);
  if (volume <= 0) return;

  const ctx = getUiAudioContext();
  const buffer = uiSoundBuffers[type] || uiSoundBuffers.click;

  if (ctx && buffer) {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);

    const startOffset = type === 'click' ? Math.min(0.5, Math.max(0, buffer.duration - 0.03)) : 0;
    source.start(0, startOffset);
    return;
  }

  playHtmlSoundFallback(type);
}

function isLevelUpButton(control) {
  const label = (control.textContent || '').trim().toLowerCase();
  const inlineClick = (control.getAttribute('onclick') || '').toLowerCase();
  const ariaLabel = (control.getAttribute('aria-label') || '').toLowerCase();

  return label.includes('about me') ||
    label.includes('contact me') ||
    ariaLabel.includes('contact') ||
    inlineClick.includes("showpage('about-page')") ||
    inlineClick.includes('showpage("about-page")') ||
    inlineClick.includes("openmodal('contact')") ||
    inlineClick.includes('openmodal("contact")');
}

function shouldPlayUiSound(event) {
  if (event.button !== undefined && event.button !== 0) return false;

  const control = event.target.closest('button, a, [role="button"]');
  if (!control) return false;

  if (control.matches('input, textarea, select')) return false;
  if (event.target.closest('input[type="range"], textarea, select')) return false;

  return control;
}

document.addEventListener('pointerdown', function (event) {
  const control = shouldPlayUiSound(event);
  if (!control) return;

  preloadAllUiSounds();
  playSoundEffect(isLevelUpButton(control) ? 'levelup' : 'click');
}, true);

document.addEventListener('touchstart', preloadAllUiSounds, { once: true, passive: true });
document.addEventListener('mouseover', preloadAllUiSounds, { once: true, passive: true });
document.addEventListener('DOMContentLoaded', function () {
  buildHtmlSoundPool('click');
  buildHtmlSoundPool('levelup');
});

if (musicVolume) {
  musicVolume.addEventListener('input', applyMusicVolume);
  applyMusicVolume();
}

if (soundVolume) {
  soundVolume.addEventListener('input', applySoundVolume);
  applySoundVolume();
}

const tracks = {
  song2: {
    audio: 'music/jukebox-song-subwoofer-lullaby.mp3',
    jukebox: 'images/jukebox-playing-subwoofer-lullaby.png',
    title: 'Subwoofer Lullaby'
  },
  song3: {
    audio: 'music/jukebox-song-moog-city.mp3',
    jukebox: 'images/jukebox-playing-moog-city.png',
    title: 'Moog City'
  },
  song4: {
    audio: 'music/jukebox-song-wet-hands.mp3',
    jukebox: 'images/jukebox-playing-wet-hands.png',
    title: 'Wet Hands'
  }
};

const noteImages = [
  'images/jukebox-note-01.png', 'images/jukebox-note-02.png', 'images/jukebox-note-03.png', 'images/jukebox-note-04.png',
  'images/jukebox-note-05.png', 'images/jukebox-note-06.png', 'images/jukebox-note-07.png', 'images/jukebox-note-08.png',
  'images/jukebox-note-09.png', 'images/jukebox-note-10.png', 'images/jukebox-note-11.png', 'images/jukebox-note-12.png',
  'images/jukebox-note-13.png', 'images/jukebox-note-14.png', 'images/jukebox-note-15.png', 'images/jukebox-note-16.png',
  'images/jukebox-note-17.png', 'images/jukebox-note-18.png', 'images/jukebox-note-19.png', 'images/jukebox-note-20.png',
  'images/jukebox-note-21.png', 'images/jukebox-note-22.png', 'images/jukebox-note-23.png', 'images/jukebox-note-24.png'
];

let currentSongKey = null;
let noteTimer = null;

function selectDisc(songKey) {
  const track = tracks[songKey];
  if (!track) return;

  currentSongKey = songKey;
  startNotes();

  document.querySelectorAll('.disc-btn').forEach(button => {
    button.classList.toggle('hidden-disc', button.dataset.song === songKey);
  });

  jukeboxImg.src = track.jukebox;

  tune.loop = true;
  tune.src = track.audio;
  tune.currentTime = 0;
  if (musicLabel) musicLabel.textContent = 'Click here!';

  if (nowPlayingBar) {
    nowPlayingText.textContent = 'Now Playing: ' + track.title;
    nowPlayingBar.classList.add('is-playing');
  }

  tune.play()
    .then(() => {
      startNotes();
    })
    .catch(() => {});
}

function ejectDisc() {
  currentSongKey = null;
  tune.pause();
  tune.removeAttribute('src');
  tune.load();
  jukeboxImg.src = 'images/jukebox-idle.png';
  stopNotes();
  document.querySelectorAll('.disc-btn').forEach(button => {
    button.classList.remove('hidden-disc');
  });
  if (nowPlayingBar) {
    nowPlayingBar.classList.remove('is-playing');
    nowPlayingText.textContent = 'Select a disc to play';
  }
}

function openMusicPage() {
  showPage('music-page');
}

function createNote() {
  if (!notesLayer || !currentSongKey) return;

  const note = document.createElement('img');
  note.className = 'floating-note';
  note.src = noteImages[Math.floor(Math.random() * noteImages.length)];
  note.alt = '';

  note.style.left = (18 + Math.random() * 120) + 'px';
  note.style.top = (40 + Math.random() * 72) + 'px';
  note.style.setProperty('--note-drift', (Math.random() * 120 - 60) + 'px');
  note.onerror = () => note.remove();
  note.addEventListener('animationend', () => note.remove());

  notesLayer.appendChild(note);
}

function burstNotes(count = 6) {
  for (let i = 0; i < count; i++) {
    window.setTimeout(createNote, i * 80);
  }
}

function startNotes() {
  if (!currentSongKey || !notesLayer) return;
  if (noteTimer) return;

  notesLayer.classList.add('notes-active');
  burstNotes(10);

  noteTimer = window.setInterval(() => {
    if (!currentSongKey) {
      stopNotes();
      return;
    }
    burstNotes(4 + Math.floor(Math.random() * 3));
  }, 420);
}

function stopNotes() {
  if (noteTimer) {
    window.clearInterval(noteTimer);
    noteTimer = null;
  }
  if (notesLayer) {
    notesLayer.classList.remove('notes-active');
    notesLayer.querySelectorAll('.floating-note').forEach(note => note.remove());
  }
}

tune.addEventListener('play', () => {
  startNotes();
});

tune.addEventListener('pause', () => {
  if (currentSongKey) startNotes();
});

tune.addEventListener('ended', () => {
  if (currentSongKey) {
    tune.currentTime = 0;
    tune.play().catch(function () {});
    startNotes();
  }
});

function runSlideshows() {
  const slideshows = document.querySelectorAll('.slideshow');

  slideshows.forEach(function(show) {
    const slides = show.querySelectorAll('.slide');
    if (!slides.length) return;

    let currentIndex = 0;
    slides.forEach(function(slide, index) {
      if (slide.classList.contains('active-slide')) {
        currentIndex = index;
      }
    });

    slides[currentIndex].classList.remove('active-slide');
    const nextIndex = (currentIndex + 1) % slides.length;
    slides[nextIndex].classList.add('active-slide');
  });
}

setInterval(runSlideshows, 2600);

function showProjectCategory(categoryId, clickedTab) {
  document.querySelectorAll('.project-category-panel').forEach(panel => {
    panel.classList.toggle('active-project-category', panel.id === categoryId);
  });

  document.querySelectorAll('.project-category-tab').forEach(tab => {
    tab.classList.toggle('active-tab', tab === clickedTab);
  });
}

function showCreativeGallery(galleryId, clickedTab) {
  document.querySelectorAll('.creative-category-panel').forEach(panel => {
    panel.classList.toggle('active-creative-category', panel.id === galleryId);
  });

  document.querySelectorAll('.creative-category-switcher .project-category-tab').forEach(tab => {
    tab.classList.toggle('active-tab', tab === clickedTab);
  });
}

const aboutPage = document.getElementById('about-page');
const aboutBookTarget = document.getElementById('about-book-target');
const aboutFeatherFrame = document.getElementById('about-feather-frame');
const aboutFeatherCursor = document.getElementById('about-feather-cursor');
const aboutBookScrambleText = document.getElementById('aboutBookScrambleText');
const aboutOpenFeather = document.getElementById('aboutOpenFeather');
const aboutTypingTitle = document.querySelector('#about-page .about-typing-title');

let aboutFeatherDragging = false;
let aboutFeatherPointerId = null;
let aboutBookScrambleTimeout = null;
let aboutFeatherWritingRun = 0;
let aboutHeadingMeasureProbe = null;

function clearAboutBookScrambleTimeout() {
  if (aboutBookScrambleTimeout) {
    window.clearTimeout(aboutBookScrambleTimeout);
    aboutBookScrambleTimeout = null;
  }
}

function showFinishedAboutHeading() {
  if (!aboutBookScrambleText) return;
  aboutBookScrambleText.innerHTML = 'Hey, I\'m <span class="about-name-effect">[Name]</span>.';
}

function waitForAboutAnimation(milliseconds) {
  return new Promise(resolve => {
    aboutBookScrambleTimeout = window.setTimeout(() => {
      aboutBookScrambleTimeout = null;
      resolve();
    }, milliseconds);
  });
}

async function animateAboutFeather(keyframes, options) {
  if (!aboutOpenFeather) return;

  const finalFrame = keyframes[keyframes.length - 1] || {};

  if (typeof aboutOpenFeather.animate !== 'function') {
    if (finalFrame.transform) aboutOpenFeather.style.transform = finalFrame.transform;
    return;
  }

  aboutOpenFeather.getAnimations?.().forEach(animation => animation.cancel());

  const animation = aboutOpenFeather.animate(keyframes, {
    fill: 'forwards',
    ...options
  });

  try {
    await animation.finished;
  } catch (error) {
    return;
  }

  if (finalFrame.transform) aboutOpenFeather.style.transform = finalFrame.transform;
  animation.cancel();
}

function getAboutHeadingMeasureProbe() {
  if (aboutHeadingMeasureProbe || !aboutBookScrambleText) {
    return aboutHeadingMeasureProbe;
  }

  const computed = window.getComputedStyle(aboutBookScrambleText);
  aboutHeadingMeasureProbe = document.createElement('span');
  aboutHeadingMeasureProbe.setAttribute('aria-hidden', 'true');
  Object.assign(aboutHeadingMeasureProbe.style, {
    position: 'fixed',
    left: '-99999px',
    top: '-99999px',
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'pre',
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontStyle: computed.fontStyle,
    fontWeight: computed.fontWeight,
    letterSpacing: computed.letterSpacing,
    lineHeight: computed.lineHeight
  });
  document.body.appendChild(aboutHeadingMeasureProbe);
  return aboutHeadingMeasureProbe;
}

function measureAboutHeadingWidth(value) {
  const probe = getAboutHeadingMeasureProbe();
  if (!probe) return 0;
  probe.textContent = value;
  return probe.getBoundingClientRect().width;
}

async function runAboutFeatherWriting() {
  if (!aboutBookScrambleText || !aboutOpenFeather || !aboutTypingTitle) return;

  clearAboutBookScrambleTimeout();
  const thisRun = ++aboutFeatherWritingRun;
  const targetText = "Hey, I'm [Name].";
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  aboutOpenFeather.getAnimations?.().forEach(animation => animation.cancel());
  aboutOpenFeather.style.transform = '';
  aboutOpenFeather.classList.remove('is-writing', 'is-finished');

  if (reducedMotion) {
    showFinishedAboutHeading();
    return;
  }

  aboutBookScrambleText.textContent = '';

  await waitForAboutAnimation(440);
  if (thisRun !== aboutFeatherWritingRun || !aboutPage?.classList.contains('about-book-open')) return;

  const featherRect = aboutOpenFeather.getBoundingClientRect();
  const titleRect = aboutTypingTitle.getBoundingClientRect();

  const featherTipX = featherRect.left + featherRect.width * 0.12;
  const featherTipY = featherRect.top + featherRect.height * 0.88;
  const writingStartX = titleRect.left + 1;
  const writingStartY = titleRect.bottom - Math.max(1, titleRect.height * 0.13);

  const layoutScale = Math.max(0.001, Number(window.aboutBookLayoutScale) || 1);
  const baseX = (writingStartX - featherTipX) / layoutScale;
  const baseY = (writingStartY - featherTipY) / layoutScale;
  let currentX = 0;
  let currentY = 0;

  aboutOpenFeather.classList.add('is-writing');

  await animateAboutFeather([
    { transform: 'translate3d(0, 0, 0) scale(1)' },
    { transform: `translate3d(${baseX * 0.62}px, ${baseY * 0.62}px, 0) scale(0.82)`, offset: 0.72 },
    { transform: `translate3d(${baseX}px, ${baseY}px, 0) scale(0.68)` }
  ], {
    duration: 760,
    easing: 'cubic-bezier(.2,.82,.24,1)'
  });

  currentX = baseX;
  currentY = baseY;

  for (let index = 1; index <= targetText.length; index += 1) {
    if (thisRun !== aboutFeatherWritingRun || !aboutPage?.classList.contains('about-book-open')) return;

    const prefix = targetText.slice(0, index);
    const character = targetText[index - 1];
    const writtenWidth = measureAboutHeadingWidth(prefix);
    const nextX = baseX + writtenWidth;
    const nextY = baseY + (index % 2 === 0 ? -1.5 : 1.5);
    const duration = character === ' ' ? 55 : (character === ',' || character === '.' ? 115 : 82);

    await animateAboutFeather([
      { transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(0.68)` },
      { transform: `translate3d(${nextX}px, ${nextY}px, 0) scale(0.68)` }
    ], {
      duration,
      easing: 'ease-in-out'
    });

    aboutBookScrambleText.textContent = prefix;
    currentX = nextX;
    currentY = nextY;
  }

  showFinishedAboutHeading();
  await waitForAboutAnimation(180);
  if (thisRun !== aboutFeatherWritingRun || !aboutPage?.classList.contains('about-book-open')) return;

  const settledX = currentX + 5;
  const settledY = currentY - 2;
  const settledTransform = `translate3d(${settledX}px, ${settledY}px, 0) scale(0.68)`;

  await animateAboutFeather([
    { transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(0.68)` },
    { transform: settledTransform }
  ], {
    duration: 220,
    easing: 'ease-out'
  });

  if (thisRun !== aboutFeatherWritingRun || !aboutPage?.classList.contains('about-book-open')) return;

  aboutOpenFeather.style.transform = settledTransform;
  aboutOpenFeather.classList.remove('is-writing');
  aboutOpenFeather.classList.add('is-finished');
}

function forceAboutFeatherHome() {
  if (!aboutOpenFeather) return;

  aboutOpenFeather.getAnimations?.().forEach(animation => animation.cancel());
  aboutOpenFeather.classList.remove('is-writing', 'is-finished');
  aboutOpenFeather.style.transform = 'translate3d(0, 0, 0) scale(1)';

  window.requestAnimationFrame(() => {
    if (!aboutOpenFeather.classList.contains('is-writing')) {
      aboutOpenFeather.style.transform = '';
    }
  });
}

function runAboutBookScramble() {
  runAboutFeatherWriting();
}

function resetAboutBookHeading() {
  clearAboutBookScrambleTimeout();
  aboutFeatherWritingRun += 1;

  forceAboutFeatherHome();

  if (!aboutBookScrambleText) return;
  aboutBookScrambleText.textContent = '';
}

function positionAboutFeather(clientX, clientY) {
  if (!aboutFeatherCursor) return;
  aboutFeatherCursor.style.left = clientX + 'px';
  aboutFeatherCursor.style.top = clientY + 'px';
}

function pointerIsOverAboutBook(clientX, clientY) {
  if (!aboutBookTarget) return false;
  const rect = aboutBookTarget.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function finishAboutFeatherDrag(openBook, event) {
  if (!aboutFeatherDragging) return;

  aboutFeatherDragging = false;
  document.body.classList.remove('dragging-about-feather');
  aboutBookTarget?.classList.remove('drop-ready');

  if (
    event &&
    aboutFeatherFrame &&
    aboutFeatherPointerId !== null &&
    aboutFeatherFrame.hasPointerCapture?.(aboutFeatherPointerId)
  ) {
    aboutFeatherFrame.releasePointerCapture(aboutFeatherPointerId);
  }

  aboutFeatherPointerId = null;

  if (openBook) {
    aboutPage?.classList.add('about-book-open');
    resetAboutBookHeading();
    runAboutBookScramble();
  }

  if (aboutFeatherFrame) {
    aboutFeatherFrame.src = 'images/featherframe.jpg';
  }
}

function resetAboutInteraction() {
  if (!aboutPage) return;

  aboutPage.classList.add('about-book-open');
  aboutFeatherDragging = false;
  aboutFeatherPointerId = null;
  document.body.classList.remove('dragging-about-feather');

  resetAboutBookHeading();
  runAboutBookScramble();
}

if (aboutFeatherFrame) {
  aboutFeatherFrame.addEventListener('pointerdown', event => {
    if (aboutPage?.classList.contains('about-book-open')) return;

    event.preventDefault();
    aboutFeatherDragging = true;
    aboutFeatherPointerId = event.pointerId;
    aboutFeatherFrame.setPointerCapture?.(event.pointerId);
    aboutFeatherFrame.src = 'images/frame.jpg';
    document.body.classList.add('dragging-about-feather');
    positionAboutFeather(event.clientX, event.clientY);
  });
}

window.addEventListener('pointermove', event => {
  if (!aboutFeatherDragging || event.pointerId !== aboutFeatherPointerId) return;

  event.preventDefault();
  positionAboutFeather(event.clientX, event.clientY);
  aboutBookTarget?.classList.toggle(
    'drop-ready',
    pointerIsOverAboutBook(event.clientX, event.clientY)
  );
}, { passive: false });

window.addEventListener('pointerup', event => {
  if (!aboutFeatherDragging || event.pointerId !== aboutFeatherPointerId) return;
  finishAboutFeatherDrag(pointerIsOverAboutBook(event.clientX, event.clientY), event);
});

window.addEventListener('pointercancel', event => {
  if (!aboutFeatherDragging || event.pointerId !== aboutFeatherPointerId) return;
  finishAboutFeatherDrag(false, event);
});

function showPage(pageId) {
  document.getElementById('home-screen').classList.add('hidden');
  pages.forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  if (pageId === 'about-page') {
    resetAboutInteraction();
  }

  if (pageId === 'experiences-page' && typeof window.mcTimelineRerender === 'function') {
    requestAnimationFrame(window.mcTimelineRerender);
  }

  window.scrollTo(0, 0);
}

function goHome() {
  aboutFeatherWritingRun += 1;
  clearAboutBookScrambleTimeout();
  forceAboutFeatherHome();
  showFinishedAboutHeading();

  pages.forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById('home-screen').classList.remove('hidden');
  window.scrollTo(0, 0);
}

const content = {
  links: {
    title: 'Links',
    html: `
      <span class="modal-label">CONNECT</span>
      <ul>
        <li><a href="https://github.com/YOUR-GITHUB-USERNAME" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        <li><a href="https://www.linkedin.com/in/YOUR-LINKEDIN-USERNAME" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        <li><a href="mailto:YOUR-EMAIL@gmail.com">Email</a></li>
      </ul>
    `
  },
  contact: {
    title: '',
    html: `
      <div class="contact-sign-wrap">
        <div class="contact-sign">
          <div class="contact-sign-question">Want to build something together?</div>
          <div class="contact-sign-subtext">Opportunities, collaborations, and creative projects</div>
          <div class="contact-sign-buttons">
            <a class="contact-sign-btn" href="https://github.com/YOUR-GITHUB-USERNAME" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub">
              <img src="images/icon-github.png" alt="GitHub">
            </a>
            <a class="contact-sign-btn" href="https://www.linkedin.com/in/YOUR-LINKEDIN-USERNAME" target="_blank" rel="noopener noreferrer" aria-label="Open LinkedIn">
              <img src="images/icon-linkedin.png" alt="LinkedIn">
            </a>
            <a class="contact-sign-btn" href="mailto:YOUR-EMAIL@example.com" aria-label="Send an email">
              <img src="images/icon-email.png" alt="Email">
            </a>
          </div>
        </div>
      </div>
    `
  }
};

function openModal(key) {
  const modalBox = document.getElementById('modal-box');
  const closeButton = modalBox.querySelector('.close-btn');
  modalBox.classList.toggle('contact-modal', key === 'contact');
  modalBox.classList.remove('experience-item-modal');
  document.getElementById('modal-title').style.display = '';
  document.getElementById('modal-title').textContent = content[key].title;
  document.getElementById('modal-body').innerHTML = content[key].html;
  closeButton.style.display = key === 'contact' ? 'none' : '';
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

const aboutMiniAlbumPlayer = document.getElementById('aboutMiniAlbumPlayer');
const aboutMiniAlbumAudio = document.getElementById('aboutMiniAlbumAudio');
if (aboutMiniAlbumPlayer && aboutMiniAlbumAudio) {
  aboutMiniAlbumAudio.volume = getMusicVolume() * ABOUT_RECORD_VOLUME_MULTIPLIER;
  aboutMiniAlbumPlayer.classList.add('is-paused');

  async function playAboutRecord() {
    aboutMiniAlbumAudio.volume = getMusicVolume() * ABOUT_RECORD_VOLUME_MULTIPLIER;
    try {
      await aboutMiniAlbumAudio.play();
      aboutMiniAlbumPlayer.classList.remove('is-paused');
    } catch (error) {
      console.error('Album audio could not play:', error);
    }
  }

  function pauseAboutRecord() {
    aboutMiniAlbumAudio.pause();
    aboutMiniAlbumAudio.currentTime = 0;
    aboutMiniAlbumPlayer.classList.add('is-paused');
  }

  aboutMiniAlbumPlayer.addEventListener('mouseenter', playAboutRecord);
  aboutMiniAlbumPlayer.addEventListener('mouseleave', pauseAboutRecord);

  aboutMiniAlbumPlayer.addEventListener('click', async function () {
    if (aboutMiniAlbumAudio.paused) {
      await playAboutRecord();
    } else {
      pauseAboutRecord();
    }
  });
}

document.querySelectorAll('.about-mini-album-player').forEach(function (interactiveArea) {
  ['pointerdown', 'pointerup', 'click', 'dblclick', 'contextmenu'].forEach(function (eventName) {
    interactiveArea.addEventListener(eventName, function (event) {
      event.stopPropagation();
    });
  });
});

function overlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
