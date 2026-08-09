App.tsx — router + Layout shell
├── Header        sticky top; logo; desktop links (tooltips); hamburger menu < md
├── <main>        the routed page (padding shrinks on phones via index.css)
├── Footer        brand + 4 link columns (2 cols on phones) + copyright
├── MobileNav     fixed bottom tab bar (< md): Send / How / FAQ / Rate
└── Toaster       top-center notifications

UploadPage (sender)
├── FileDropzone      drag&drop box + illustration + select button
├── hero text         tooltips on "end-to-end encryption" / "link that expires"
├── UploadOptions     file row, 1-day + downloads selector, encrypt switch,
│                     password (min 8, suggest/copy), terms checkbox
├── progress panel    blue thin bar + stage + % + slow note   ← NEW
└── ShareLinkCard     link + copy, password "only copy" box, status strip, ⭐

DownloadPage (recipient)  → see flow tree at top of the file
Legal/Info pages → PageShell (title + card) + illustration + content
  └── Term tooltips on technical words (work on touch + hover)


  Color system (the rule for everyone): orange = action buttons & brand moments only • blue = info (banners, progress, links) • green = success • red = failure • everything else neutral.