# Minecraft Portfolio Template

This is a customizable Minecraft-style portfolio website template. It is set up as a multi-section portfolio with a home screen, About Me page, Projects page, Creative Works gallery, Experiences page, Music page, contact modal, resume link, and a browser tab logo.

## How to customize it

Open the files in a code editor like VS Code and replace all of the current placeholder inputs, example text, filler links, sample images, and sample files with your own content.

Most of the main text is inside `index.html`. Look for placeholder wording like:

- `[Your Name]`
- `[Name] [Last Name]`
- `Input text`
- `Input text here`
- `Project Title Here`
- `Another Project Title`
- `Project Link`
- `Skill 1`, `Skill 2`, `Tool 1`
- `Input caption here`

Replace those with your real portfolio information.

## File structure

```text
mobile-friendly-portfolio/
├── index.html
├── logo.png
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    └── js/
        ├── script-1.js
        ├── script-2.js
        ├── script-3.js
        ├── script-4.js
        ├── script-5.js
        └── script-6.js
```

## Important files

### `index.html`
This is the main website file. Edit this file to change page titles, section text, project cards, creative work captions, contact content, resume link, and button labels.

### `assets/css/styles.css`
This controls the design, layout, colors, spacing, Minecraft-style buttons, desktop layout, and mobile responsive layout.

### `assets/js/`
These JavaScript files control page switching, music controls, galleries, modals, timeline interactions, and other interactive parts of the template.

### `logo.png`
This is used as the browser tab icon. You can replace it with your own image, but keep the filename as `logo.png` unless you also update the icon link in `index.html`.

## Replacing images and music

The template expects image and music files to be placed in folders such as:

```text
images/
music/
```

Replace the filler images and music with your own files. If you rename files, make sure to also update the matching `src="..."` paths in `index.html`, CSS, or JavaScript.

Examples:

```html
<img src="images/your-image.png" alt="Description here">
<audio src="music/your-song.mp3"></audio>
```

## Resume

The resume button currently points to:

```html
resume.pdf
```

To use it, add your resume PDF to the main project folder and name it `resume.pdf`, or update the link in `index.html` to match your file name.

## Mobile friendly layout

This version includes mobile-friendly styling. On smaller screens, the layout adjusts so buttons, cards, galleries, modals, projects, and the experiences section fit better on phones.

## How to preview the website

You can open `index.html` directly in your browser. For a better preview, use VS Code with the Live Server extension.

## Before publishing

Before uploading the portfolio online, check that you replaced:

- All placeholder names
- All filler text
- All fake project links
- All sample images
- All sample music files
- The resume PDF
- Contact information
- Copyright name/year if needed

After replacing the placeholders, the template is ready to publish on platforms like GitHub Pages, Netlify, or Vercel.
