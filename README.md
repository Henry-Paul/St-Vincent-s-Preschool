# St. Vincent's Preschool — Static Website

## Files
- index.html, programs.html, gallery.html, faq.html, resources.html, contact.html
- css/styles.css
- js/main.js
- assets/images/* (copy your images into this folder)

## EmailJS
This project uses EmailJS (client-side). The credentials used in js/main.js are the same ones from your uploaded file:
- Service ID: `service_14zrdg6`
- Template ID: `template_snxhxlk`
- Public Key: `5SyxCT8kGY0_H51dC`

If this is your EmailJS account you're fine. Otherwise create your own EmailJS service/template and update `js/main.js`.

## Deploy to GitHub Pages (quick)
1. Create a new GitHub repository (e.g. `preschool-site`).
2. Locally:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/preschool-site.git
   git push -u origin main
