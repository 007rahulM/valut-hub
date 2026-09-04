// // // Clean Sendly QR share card. The card contains one combined logo, one smaller QR code, and one short instruction.

// // function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
// //   ctx.beginPath();
// //   ctx.moveTo(x + r, y);
// //   ctx.arcTo(x + w, y, x + w, y + h, r);
// //   ctx.arcTo(x + w, y + h, x, y + h, r);
// //   ctx.arcTo(x, y + h, x, y, r);
// //   ctx.arcTo(x, y, x + w, y, r);
// //   ctx.closePath();
// // }

// // function loadLogo(colorScheme: "light" | "dark"): Promise<HTMLImageElement | null> {
// //   return new Promise((resolve) => {
// //     const img = new Image();
// //     img.onload = () => resolve(img);
// //     img.onerror = () => resolve(null);
// //     img.src = colorScheme === "dark"
// //       ? "/illustrations/main_logo_darkmode_removed_background.png"
// //       : "/illustrations/main_logo_lighmode_removed_backround.png";
// //   });
// // }

// // export async function drawShareCard(
// //   qr: HTMLCanvasElement,
// //   colorScheme: "light" | "dark" = "light",
// // ): Promise<HTMLCanvasElement> {
// //   const W = 300;
// //   const H = 300;
// //   const dark = colorScheme === "dark";
// //   const background = dark ? "#03112B" : "#FFFFFF";
// //   const foreground = dark ? "#FFFFFF" : "#182536";
// //   const c = document.createElement("canvas");
// //   c.width = W;
// //   c.height = H;

// //   const ctx = c.getContext("2d");
// //   if (!ctx) return c;

// //   ctx.fillStyle = background;
// //   ctx.fillRect(0, 0, W, H);

// //   const logo = await loadLogo(colorScheme);
// //   if (logo) {
// //     // The supplied logo is a wide lockup. Keep one combined S + endly logo at the top.
// //     ctx.drawImage(logo, 52, 18, 196, 84);
// //   } else {
// //     ctx.fillStyle = foreground;
// //     ctx.font = "700 26px Inter, system-ui, sans-serif";
// //     ctx.textAlign = "center";
// //     ctx.fillText("Sendly", W / 2, 62);
// //   }

// //   // Smaller QR with a white quiet zone so it remains scannable in both themes.
// //   const qrSize = 148;
// //   const qrX = (W - qrSize) / 2;
// //   const qrY = 112;
// //   drawRoundedRect(ctx, qrX - 9, qrY - 9, qrSize + 18, qrSize + 18, 10);
// //   ctx.fillStyle = "#FFFFFF";
// //   ctx.fill();
// //   ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

// //   ctx.fillStyle = foreground;
// //   ctx.font = "600 14px Inter, system-ui, sans-serif";
// //   ctx.textAlign = "center";
// //   ctx.textBaseline = "alphabetic";
// //   ctx.fillText("Scan to download", W / 2, 282);

// //   return c;
// // }


// // Clean Sendly QR share card. The card contains one combined logo, one smaller QR code, and one short instruction.

// function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
//   ctx.beginPath();
//   ctx.moveTo(x + r, y);
//   ctx.arcTo(x + w, y, x + w, y + h, r);
//   ctx.arcTo(x + w, y + h, x, y + h, r);
//   ctx.arcTo(x, y + h, x, y, r);
//   ctx.arcTo(x, y, x + w, y, r);
//   ctx.closePath();
// }

// function loadLogo(colorScheme: "light" | "dark"): Promise<HTMLImageElement | null> {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.onload = () => resolve(img);
//     img.onerror = () => resolve(null);
//     img.src = colorScheme === "dark"
//       ? "/illustrations/main_logo_darkmode_removed_background.png"
//       : "/illustrations/main_logo_lighmode_removed_backround.png";
//   });
// }

// export async function drawShareCard(
//   qr: HTMLCanvasElement,
//   colorScheme: "light" | "dark" = "light",
// ): Promise<HTMLCanvasElement> {
//   const W = 300;
//   const H = 300;
//   const dark = colorScheme === "dark";
//   const background = dark ? "#03112B" : "#FFFFFF";
//   const foreground = dark ? "#FFFFFF" : "#182536";
//   const c = document.createElement("canvas");
//   c.width = W;
//   c.height = H;

//   const ctx = c.getContext("2d");
//   if (!ctx) return c;

//   ctx.fillStyle = background;
//   ctx.fillRect(0, 0, W, H);

//   const logo = await loadLogo(colorScheme);
//   if (logo) {
//     // The supplied logo is a wide lockup. Keep one combined S + endly logo at the top.
//     ctx.drawImage(logo, 52, 18, 196, 84);
//   } else {
//     ctx.fillStyle = foreground;
//     ctx.font = "700 26px Inter, system-ui, sans-serif";
//     ctx.textAlign = "center";
//     ctx.fillText("Sendly", W / 2, 62);
//   }

//   // Smaller QR with a white quiet zone so it remains scannable in both themes.
//   const qrSize = 148;
//   const qrX = (W - qrSize) / 2;
//   const qrY = 112;
//   drawRoundedRect(ctx, qrX - 9, qrY - 9, qrSize + 18, qrSize + 18, 10);
//   ctx.fillStyle = "#FFFFFF";
//   ctx.fill();
//   ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

//   ctx.fillStyle = foreground;
//   ctx.font = "600 14px Inter, system-ui, sans-serif";
//   ctx.textAlign = "center";
//   ctx.textBaseline = "alphabetic";
//   ctx.fillText("Scan to download", W / 2, 282);

//   return c;
// }

// Sendly QR share card. This renderer is intentionally self-contained.

const CARD_WIDTH = 300;
const CARD_HEIGHT = 300;
const QR_SIZE = 148;
const LOGO_WIDTH = 80;
const LOGO_HEIGHT = 34;
const LOGO_TOP = 8;
const MAX_FILE_NAME_LENGTH = 32;

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadLogo(colorScheme: "light" | "dark"): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = colorScheme === "dark"
      ? "/illustrations/main_logo_darkmode_removed_background3.png"
      : "/illustrations/main_logo_lighmode_removed_backround2.png";
  });
}

function usableFileName(fileName?: string): string | undefined {
  const clean = fileName?.trim();
  if (!clean) return undefined;

  // Prevent an illustration/icon filename from appearing as the recipient's file name.
  if (/\b(?:s_logo|main_logo|logo-mark|logoo)\b/i.test(clean)) return undefined;
  return clean;
}

function shortFileName(fileName?: string): string | undefined {
  const clean = usableFileName(fileName);
  if (!clean) return undefined;
  if (clean.length <= MAX_FILE_NAME_LENGTH) return clean;

  const extension = clean.includes(".") ? clean.slice(clean.lastIndexOf(".")) : "";
  const stem = clean.slice(0, Math.max(0, MAX_FILE_NAME_LENGTH - extension.length - 3));
  return `${stem}...${extension}`;
}

export async function drawShareCard(
  qr: HTMLCanvasElement,
  colorSchemeOrFileName: "light" | "dark" | string = "light",
  fileName?: string,
): Promise<HTMLCanvasElement> {
  // Backward-compatible with the old drawShareCard(qr, fileName) call.
  const colorScheme = colorSchemeOrFileName === "dark" ? "dark" : "light";
  const recipientFileName = shortFileName(
    fileName ?? (colorSchemeOrFileName === "light" || colorSchemeOrFileName === "dark" ? undefined : colorSchemeOrFileName),
  );

  const dark = colorScheme === "dark";
  const background = dark ? "#03112B" : "#FFFFFF";
  const foreground = dark ? "#FFFFFF" : "#182536";
  const muted = dark ? "#B8C3D4" : "#64748B";
  const c = document.createElement("canvas");
  c.width = CARD_WIDTH;
  c.height = CARD_HEIGHT;

  const ctx = c.getContext("2d");
  if (!ctx) return c;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const logo = await loadLogo(colorScheme);
  if (logo) {
    ctx.drawImage(logo, (CARD_WIDTH - LOGO_WIDTH) / 2, LOGO_TOP, LOGO_WIDTH, LOGO_HEIGHT);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = muted;
  ctx.font = "600 11px Inter, system-ui, sans-serif";
  ctx.fillText("You received a file", CARD_WIDTH / 2, 55);

  let qrTop = 70;
  if (recipientFileName) {
    ctx.fillStyle = foreground;
    ctx.font = "600 11px Inter, system-ui, sans-serif";
    ctx.fillText(recipientFileName, CARD_WIDTH / 2, 69);
    qrTop = 80;
  }

  // White quiet zone keeps the QR scannable in both themes.
  const qrX = (CARD_WIDTH - QR_SIZE) / 2;
  drawRoundedRect(ctx, qrX - 9, qrTop - 9, QR_SIZE + 18, QR_SIZE + 18, 10);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.drawImage(qr, qrX, qrTop, QR_SIZE, QR_SIZE);

  ctx.fillStyle = foreground;
  ctx.font = "600 14px Inter, system-ui, sans-serif";
  ctx.fillText("Scan to review or download", CARD_WIDTH / 2, 258);

  return c;
}
