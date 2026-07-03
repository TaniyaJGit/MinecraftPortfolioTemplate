(function () {
  "use strict";

  function phoneShellHTML(src) {
    return '<div class="mc-timeline-phone-shell experience-iphone-shell" style="--iphone-screen: url(\'' + src + '\'); --iphone-accent: #ececef; --iphone-accent-dark: #9a9aa0; --iphone-accent-light: #ffffff;"></div>';
  }

  const experiences = [
    { group: 'current', icon: '⭐', date: 'Current', role: 'Current Role Title Here', org: 'Organization Name Here', desc: 'Input a short description of your current role here. Mention what you do, what tools you use, and what kind of impact you make.', tag: 'Current Role' },
    { group: 'employment', icon: '💼', date: 'Employment', role: 'Job Title Here', org: 'Company Name Here', desc: 'Input job details here. Add your responsibilities, achievements, and any software, design, or communication skills you used.', tag: 'Work Experience' },
    { group: 'extracurricular', icon: '🎨', date: 'Extracurricular', role: 'Club or Team Role Here', org: 'Club / Team Name Here', desc: 'Input club, design, leadership, or team experience here. Describe events, projects, outreach, or creative work you contributed to.', tag: 'Leadership' },
    { group: 'volunteering', icon: '🤝', date: 'Volunteering', role: 'Volunteer Role Here', org: 'Organization Name Here', desc: 'Input volunteer experience here. Explain how you contributed and what community, cause, or group your work supported.', tag: 'Community' },
    { group: 'current', icon: '🚀', date: 'Project', role: 'Project or Initiative Title Here', org: 'Project / Group Name Here', desc: 'Input another experience here. Keep it focused on what you built, organized, designed, researched, or helped improve.', tag: 'Project' },
    { group: 'employment', icon: '🛠️', date: 'Experience', role: 'Experience Title Here', org: 'Company / Organization Here', desc: 'Input filler text here. Replace this with a specific accomplishment, responsibility, or skill you want to highlight.', tag: 'Skill Tag' },
    { group: 'extracurricular', icon: '📣', date: 'Campus / Team', role: 'Role Title Here', org: 'Team Name Here', desc: 'Input filler text here. Describe your collaboration, event planning, marketing, development, design, or outreach work.', tag: 'Teamwork' },
    { group: 'volunteering', icon: '🌱', date: 'Community', role: 'Role Title Here', org: 'Organization Here', desc: 'Input filler text here. Use this space for another volunteer, community, or leadership experience.', tag: 'Growth' }
  ];

  const SPACING = 480;
  const EDGE_PAD = 340;
  let nodePositions = [];
  let steveX = 0;

  const CALENDAR_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
  const PIN_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.05 7-12a7 7 0 1 0-14 0c0 4.95 7 12 7 12z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>';
  const STAR_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5 12 2"></polygon></svg>';
  const GLOBE_ICON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';

  function buildCard(item, index) {
    const card = document.createElement('div');
    card.className = 'mc-timeline-card ' + (index % 2 === 0 ? 'card-above' : 'card-below');

    const orgParts = item.org.split('·').map(function (s) { return s.trim(); });
    const orgName = orgParts[0];
    const location = orgParts.length > 1 ? orgParts[1] : '';

    const orgHtml = item.link
      ? '<a class="mc-timeline-card-org" href="' + item.link + '" target="_blank" rel="noopener">' + orgName + '</a>'
      : '<p class="mc-timeline-card-org">' + orgName + '</p>';

    let inner =
      '<div class="mc-timeline-card-header">' +
        '<span class="mc-timeline-card-icon">' + item.icon + '</span>' +
        '<span class="mc-timeline-card-date">' + CALENDAR_ICON + item.date + '</span>' +
      '</div>' +
      '<p class="mc-timeline-card-role">' + item.role + '</p>' +
      orgHtml;

    if (location) {
      inner += '<p class="mc-timeline-card-location">' + PIN_ICON + location + '</p>';
    }

    inner += '<p class="mc-timeline-card-desc">' + item.desc + '</p>';

    if (item.tag) {
      const tags = item.tag.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      inner += '<div class="mc-timeline-card-tags">' + tags.map(function (t) {
        return '<span class="mc-timeline-card-tag">' + t + '</span>';
      }).join('') + '</div>';
    }

    card.innerHTML = inner;

    return card;
  }

  function openExperienceModal(item) {
    const modalBox = document.getElementById('modal-box');
    const closeButton = modalBox.querySelector('.close-btn');
    modalBox.classList.remove('contact-modal');
    modalBox.classList.add('experience-item-modal');
    document.getElementById('modal-title').textContent = item.role;

    const orgParts = item.org.split('·').map(function (s) { return s.trim(); });
    const orgName = orgParts[0];
    const location = orgParts.length > 1 ? orgParts[1] : '';

    const orgTag = item.link
      ? '<a class="xp-card-org" href="' + item.link + '" target="_blank" rel="noopener">' + orgName + '</a>'
      : '<span class="xp-card-org">' + orgName + '</span>';

    let bodyHtml =
      '<div class="xp-card-header">' +
        '<div class="xp-card-icon">' + item.icon + '</div>' +
        '<div class="xp-card-date">' + CALENDAR_ICON + item.date + '</div>' +
      '</div>' +
      '<p class="xp-card-role">' + item.role + '</p>' +
      orgTag;

    if (location) {
      bodyHtml += '<div class="xp-card-location">' + PIN_ICON + location + '</div>';
    }

    bodyHtml += '<div class="xp-card-impact">' + STAR_ICON + '<p>' + item.desc + '</p></div>';

    if (item.tag) {
      const tags = item.tag.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      bodyHtml += '<div class="xp-card-tags">' + tags.map(function (t) {
        return '<span class="xp-card-tag">' + t + '</span>';
      }).join('') + '</div>';
    }

    if (item.link) {
      bodyHtml += '<a class="xp-card-globe" href="' + item.link + '" target="_blank" rel="noopener">' + GLOBE_ICON + '</a>';
    }

    document.getElementById('modal-body').innerHTML = bodyHtml;
    closeButton.style.display = '';
    document.getElementById('modal-overlay').classList.add('open');
  }

  function buildTimeline() {
    const timeline = document.getElementById('mc-timeline');
    if (!timeline) return;

    const count = experiences.length;
    const totalWidth = SPACING * (count - 1) + EDGE_PAD * 2;

    const trackWrap = document.createElement('div');
    trackWrap.className = 'mc-timeline-track-wrap';
    trackWrap.style.width = totalWidth + 'px';

    const path = document.createElement('div');
    path.className = 'mc-timeline-path';
    trackWrap.appendChild(path);

    const grassBack = document.createElement('div');
    grassBack.className = 'mc-timeline-grass-back';
    trackWrap.appendChild(grassBack);

    const HOUSE_VARIANTS = [
      'images/timeline-cottage-teal.png',
      'images/timeline-cottage-purple.png',
      'images/timeline-house-tavern.png',
      'images/timeline-cottage-yellow.png',
      'images/timeline-cottage-green.png',
      'images/timeline-cottage-pink.png'
    ];
    let houseCount = 0;

    const TREE_VARIANTS = [
      'images/timeline-tree-oak-1.png',
      'images/timeline-tree-oak-2.png',
      'images/timeline-tree-pine.png'
    ];
    let treeCount = 0;

    const HORSE_VARIANTS = [
      'images/timeline-horse-brown.png',
      'images/timeline-horse-saddled.png'
    ];
    let horseCount = 0;
    const PIG_VARIANT = 'images/timeline-pig.png';

    nodePositions = [];

    experiences.forEach(function (item, index) {
      const x = EDGE_PAD + index * SPACING;
      nodePositions.push(x);

      const node = document.createElement('div');
      node.className = 'mc-timeline-node node-' + item.group;
      node.style.left = x + 'px';
      node.dataset.index = String(index);
      trackWrap.appendChild(node);

      const isHouseStop = index % 3 === 0;

      if (isHouseStop) {
        const house = document.createElement('div');
        house.className = 'mc-timeline-house';
        const variant = HOUSE_VARIANTS[houseCount % HOUSE_VARIANTS.length];
        const side = houseCount % 2 === 0 ? -1 : 1;
        houseCount++;
        house.style.backgroundImage = "url('" + variant + "')";
        house.style.left = (x + side * 310) + 'px';
        trackWrap.appendChild(house);
      } else {

        const tree = document.createElement('div');
        tree.className = 'mc-timeline-tree';
        const variant = TREE_VARIANTS[treeCount % TREE_VARIANTS.length];
        const side = treeCount % 2 === 0 ? -1 : 1;
        treeCount++;
        tree.style.backgroundImage = "url('" + variant + "')";
        tree.style.left = (x + side * 285) + 'px';
        trackWrap.appendChild(tree);
      }

      if (index % 3 === 1) {
        const horse = document.createElement('div');
        horse.className = 'mc-timeline-animal';
        const variant = HORSE_VARIANTS[horseCount % HORSE_VARIANTS.length];
        horseCount++;
        horse.style.backgroundImage = "url('" + variant + "')";
        horse.style.left = (x + 108) + 'px';
        trackWrap.appendChild(horse);
      }

      if (index % 4 === 2) {
        const pig = document.createElement('div');
        pig.className = 'mc-timeline-pig';
        pig.style.backgroundImage = "url('" + PIG_VARIANT + "')";
        pig.style.left = (x - 95) + 'px';
        trackWrap.appendChild(pig);
      }

      const card = buildCard(item, index);
      card.style.left = x + 'px';
      trackWrap.appendChild(card);
    });

    const grassFront = document.createElement('div');
    grassFront.className = 'mc-timeline-grass-front';
    trackWrap.appendChild(grassFront);

    timeline.innerHTML = '';
    timeline.appendChild(trackWrap);

    function makeTilingSeamless(el, imgSrc, overlapJoins) {
      if (!el) return;
      const img = new Image();
      img.onload = function () {
        function apply() {
          const h = Math.round(el.getBoundingClientRect().height);
          if (!h || !img.naturalHeight) return;
          const ratio = img.naturalWidth / img.naturalHeight;
          const w = Math.max(1, Math.floor(h * ratio));

          if (overlapJoins) {
            const seamOverlap = Math.max(3, Math.min(8, Math.round(w * 0.04)));
            el.style.backgroundImage =
              "url('" + imgSrc + "'), url('" + imgSrc + "'), " +
              'linear-gradient(to bottom, #5f913b 0 24%, #6b4628 24% 100%)';
            el.style.backgroundRepeat = 'repeat-x, repeat-x, no-repeat';
            el.style.backgroundPosition =
              '0 0, -' + seamOverlap + 'px 0, 0 0';
            el.style.backgroundSize =
              w + 'px ' + h + 'px, ' +
              w + 'px ' + h + 'px, 100% 100%';
          } else {
            el.style.backgroundRepeat = 'repeat-x';
            el.style.backgroundPosition = '0 bottom';
            el.style.backgroundSize = w + 'px ' + h + 'px';
          }
        }
        apply();
        window.addEventListener('resize', apply);
      };
      img.src = imgSrc;
    }
    makeTilingSeamless(path, 'images/timeline-grass-path.png', true);
    makeTilingSeamless(grassBack, 'images/timeline-grass-tufts.png', false);
    makeTilingSeamless(grassFront, 'images/timeline-grass-tufts.png', false);

    const wrapEl = document.getElementById('mc-timeline-wrap');
    const steve = document.createElement('div');
    steve.className = 'mc-steve';
    steve.id = 'mc-steve';
    steve.innerHTML = '<div class="mc-steve-sprite" id="mc-steve-sprite"></div>';
    if (wrapEl) wrapEl.appendChild(steve);

    initSteveController(totalWidth);
  }

  function initSteveController(totalWidth) {
    const wrap = document.getElementById('mc-timeline-wrap');
    const timeline = document.getElementById('mc-timeline');
    const steve = document.getElementById('mc-steve');
    const sprite = document.getElementById('mc-steve-sprite');
    if (!wrap || !timeline || !steve || !sprite) return;

    steveX = 0;

    const walkSequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11];
    let walkSeqPos = 0;
    let walkAnimTimer = null;
    let isWalking = false;
    let facing = 1;
    let keysDown = { left: false, right: false };
    let rafId = null;

    function setWalking(walking) {
      if (walking === isWalking) return;
      isWalking = walking;
      steve.classList.toggle('is-walking', walking);
      if (walking) {
        walkSeqPos = 0;
        sprite.style.backgroundPosition = (walkSequence[0] * (100 / 11)) + '% bottom';
        walkAnimTimer = setInterval(function () {
          walkSeqPos = (walkSeqPos + 1) % walkSequence.length;
          const frameIndex = walkSequence[walkSeqPos];
          sprite.style.backgroundPosition = (frameIndex * (100 / 11)) + '% bottom';
        }, 70);
      } else if (walkAnimTimer) {
        clearInterval(walkAnimTimer);
        walkAnimTimer = null;
        sprite.style.backgroundPosition = '0 bottom';
      }
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function render() {
      steveX = clamp(steveX, 0, totalWidth);
      steve.classList.toggle('facing-left', facing < 0);

      const wrapWidth = wrap.clientWidth;
      const desiredOffset = (wrapWidth / 2) - steveX;
      const minOffset = wrapWidth - totalWidth;
      const maxOffset = 0;
      const offset = clamp(desiredOffset, Math.min(minOffset, maxOffset), maxOffset);

      timeline.style.transform = 'translateX(' + offset + 'px)';

      const steveScreenX = steveX + offset;
      steve.style.left = steveScreenX + 'px';

      let nearestIndex = 0;
      let nearestDist = Infinity;
      nodePositions.forEach(function (pos, i) {
        const d = Math.abs(pos - steveX);
        if (d < nearestDist) { nearestDist = d; nearestIndex = i; }
      });
      document.querySelectorAll('.mc-timeline-node').forEach(function (node, i) {
        node.classList.toggle('node-active', i === nearestIndex && nearestDist < 40);
      });
    }

    function step() {
      const speed = 20;
      let moved = false;
      if (keysDown.left) { steveX -= speed; facing = -1; moved = true; }
      if (keysDown.right) { steveX += speed; facing = 1; moved = true; }
      setWalking(moved);
      if (moved) render();

      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);

    window.addEventListener('keydown', function (e) {
      if (!document.getElementById('experiences-page').classList.contains('active')) return;
      if (e.key === 'ArrowLeft') { keysDown.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { keysDown.right = true; e.preventDefault(); }
    });
    window.addEventListener('keyup', function (e) {
      if (e.key === 'ArrowLeft') keysDown.left = false;
      if (e.key === 'ArrowRight') keysDown.right = false;
    });

    let dragging = false;
    let dragStartX = 0;
    let dragStartSteveX = 0;

    function pointerDown(clientX) {
      dragging = true;
      dragStartX = clientX;
      dragStartSteveX = steveX;
      wrap.classList.add('is-dragging');
    }

    function pointerMove(clientX) {
      if (!dragging) return;
      const dx = clientX - dragStartX;
      const newX = dragStartSteveX + dx;
      facing = newX > steveX ? 1 : (newX < steveX ? -1 : facing);
      steveX = newX;
      setWalking(Math.abs(dx) > 2);
      render();
    }

    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      wrap.classList.remove('is-dragging');
      setWalking(false);
    }

    wrap.addEventListener('mousedown', function (e) {
      pointerDown(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (dragging) pointerMove(e.clientX);
    });
    window.addEventListener('mouseup', pointerUp);

    wrap.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length) pointerDown(e.touches[0].clientX);
    }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length) {
        pointerMove(e.touches[0].clientX);
        e.preventDefault();
      }
    }, { passive: false });
    wrap.addEventListener('touchend', pointerUp);
    wrap.addEventListener('touchcancel', pointerUp);

    timeline.addEventListener('click', function (e) {
      const node = e.target.closest('.mc-timeline-node');
      if (!node) return;
      const idx = Number(node.dataset.index);
      if (Number.isNaN(idx)) return;
      facing = nodePositions[idx] > steveX ? 1 : -1;
      steveX = nodePositions[idx];
      render();
    });

    window.addEventListener('resize', render);
    window.mcTimelineRerender = render;

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildTimeline, { once: true });
  } else {
    buildTimeline();
  }
})();
