(function () {
  "use strict";

  var TJ_KB = [
    {
      keywords: ["who", "taniya", "yourself", "about you", "intro", "name"],
      answer: "I'm Taniya Jeevanayagam! I'm an undergraduate student at McMaster University pursuing a Bachelor of Applied Science in Computer Science (currently Level 2). I love web design, front-end coding, marketing, and expressing ideas creatively."
    },
    {
      keywords: ["study", "studying", "school", "university", "mcmaster", "major", "degree", "program", "education", "level"],
      answer: "I'm studying at McMaster University, pursuing a Bachelor of Applied Science in Computer Science — currently in Level 2."
    },
    {
      keywords: ["interest", "passion", "hobby", "hobbies", "like", "creative", "creativity"],
      answer: "One of my strongest interests is creating and innovating new ideas — I love starting with a concept from scratch, working through challenges, and bringing it to life. This started young, from tricky math problems to building things like cardboard vending machines and mechanical arms!"
    },
    {
      keywords: ["inspire", "inspiration", "pinkpantheress", "idol"],
      answer: "One of my biggest inspirations is PinkPantheress — not just her music, but her upbeat energy, creative visuals, fashion, and personal flair."
    },
    {
      keywords: ["minecraft", "portfolio theme", "design inspired", "why minecraft"],
      answer: "This portfolio's design was inspired by Minecraft! I grew up playing and watching it with my family, and its freedom to create and distinctive style helped shape my early interest in art — even though I don't play anymore."
    },
    {
      keywords: ["project", "projects", "built", "made", "coding project", "app", "software"],
      answer: "I've built several projects, including Aura Sync (an aesthetic-finder app using Firebase, Spotify's API, and Gemini API), Fingerpaint AI (a camera-based finger-tracking drawing app), ReactPose (real-time pose recognition with computer vision), an 8 Ball Fortune Telling game, FindMyMatcha (a matcha/café matching app with Google Maps), Haikyuu!: Jump Champion (a browser game), and Drip Mode (a digital wardrobe app with Supabase). Check the Coding Projects page for the full details and demos!"
    },
    {
      keywords: ["skill", "skills", "tech", "technology", "stack", "language", "languages", "tools"],
      answer: "My toolkit includes HTML, CSS, and JavaScript, plus experience with Firebase (Auth & Firestore), Supabase, the Spotify Web API, Google Maps/Places API, the Gemini API, MediaPipe (Hands & Pose) for computer vision, and Canvas-based game development. I also do UX/UI design work."
    },
    {
      keywords: ["experience", "work", "job", "employment", "worked", "career"],
      answer: "I currently take part in the Skills Generator: Human x Tech program at Youth Challenge International, am a Software Development Member at McMaster Design League, a Website Designer for McMaster Humanities Society, Director of Graphic Design at EngiQueers, and Lounge Coordinator at McMaster Engineering Society. I've also worked as a Pharmacy Assistant at Shoppers Drug Mart. Check out the Experiences page for the full timeline!"
    },
    {
      keywords: ["volunteer", "volunteering"],
      answer: "I've volunteered as Marketing Lead Executive for ThePinkStairs, Marketing Executive and Web Developer for EmpowerED, a Crew Member supporting hospitality events, a Summer Camp Assistant with the City of Markham, and a Promotional Content Creator for TRI - Think Rise Inspire."
    },
    {
      keywords: ["extracurricular", "club", "clubs", "leadership"],
      answer: "Outside of class I'm a Co-Founder of Eco-Club, Head of Events for Law Society, and a Council Leader for Global Action Council."
    },
    {
      keywords: ["music", "song", "songs", "disc", "jukebox"],
      answer: "Check out the Music page — it's a little jukebox where you can pick a disc and vibe out, with adjustable music and sound sliders!"
    },
    {
      keywords: ["contact", "email", "reach", "reach you", "linkedin", "github", "get in touch", "hire"],
      answer: "You can reach me by email at taniyatj26@gmail.com, or find me on GitHub (TaniyaJGit) and LinkedIn (taniya-j-b42b3b278) — there's a contact section on the site with clickable links too!"
    },
    {
      keywords: ["uxui", "ux/ui", "design", "figma", "prototype"],
      answer: "I've also done UX/UI design work, including prototypes for the portfolio site itself, the Fingerpaint AI app, a game menu, ReactPose, Aura Sync, and more — you can see them in the UX/UI Designs tab of the Coding Projects page."
    }
  ];

  var TJ_FALLBACK = "Hmm, I'm not totally sure about that one! Try asking about my background, studies, projects, skills, experience, or how to contact me — or take a look around the site for more.";

  function tjFindAnswer(text) {
    var q = text.toLowerCase();
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < TJ_KB.length; i++) {
      var entry = TJ_KB[i];
      var score = 0;
      for (var j = 0; j < entry.keywords.length; j++) {
        if (q.indexOf(entry.keywords[j].toLowerCase()) !== -1) {
          score += entry.keywords[j].length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return best ? best.answer : TJ_FALLBACK;
  }

  function tjAddMessage(text, sender) {
    var messages = document.getElementById('tj-chat-messages');
    var msg = document.createElement('div');
    msg.className = 'tj-msg ' + (sender === 'user' ? 'tj-msg-user' : 'tj-msg-bot');
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function tjHandleQuestion(text) {
    if (!text || !text.trim()) return;
    tjAddMessage(text, 'user');
    var input = document.getElementById('tj-chat-input');
    if (input) input.value = '';
    setTimeout(function () {
      tjAddMessage(tjFindAnswer(text), 'bot');
    }, 350);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var box = document.getElementById('tj-chat-box');
    var title = document.getElementById('tj-chat-title');
    var closeBtn = document.getElementById('tj-chat-close');
    var sendBtn = document.getElementById('tj-chat-send');
    var input = document.getElementById('tj-chat-input');
    var suggestions = document.querySelectorAll('.tj-suggestion');

    tjAddMessage("Hey! Ask me anything about Taniya — like her studies, projects, skills, or experience.", 'bot');

    title.addEventListener('click', function (e) {
      if (e.target === closeBtn) return;
      box.classList.toggle('tj-open');
      if (box.classList.contains('tj-open') && input) input.focus();
    });
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      box.classList.remove('tj-open');
    });
    sendBtn.addEventListener('click', function () { tjHandleQuestion(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tjHandleQuestion(input.value);
    });
    suggestions.forEach(function (btn) {
      btn.addEventListener('click', function () { tjHandleQuestion(btn.getAttribute('data-q')); });
    });
  });
})();
