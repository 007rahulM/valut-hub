// ============================================================
// qrCard.ts — BRANDED SHARE CARD PAINTER
//
// Wraps a QR code in a clean branded card using the real
// VaultHub logo from /illustrations/icon.svg
//
// Design: soft background, white card, logo + wordmark at top,
// QR in a bordered box, subtle tagline at the bottom.
// No heavy orange band — professional and light.
// ============================================================

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = "/illustrations/icon.svg";
  });
}

export async function drawShareCard(qr: HTMLCanvasElement, fileName?: string): Promise<HTMLCanvasElement> {
  const W = 600;
  const H = 800;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  const logo = await loadLogo();

  // Soft background
  ctx.fillStyle = "#f8f9fb";
  ctx.fillRect(0, 0, W, H);

  // White card
  roundRect(ctx, 40, 40, W - 80, H - 80, 24);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Logo (top-left)
  ctx.drawImage(logo, 80, 76, 56, 52);

  // Wordmark: "Vault" (dark) + "Hub" (orange)
  ctx.textBaseline = "middle";
  ctx.font = "700 28px Inter, sans-serif";
  ctx.fillStyle = "#1c2733";
  ctx.fillText("Vault", 148, 102);
  const vw = ctx.measureText("Vault").width;
  ctx.fillStyle = "#E8501E";
  ctx.fillText("Hub", 148 + vw, 102);

  // Heading
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1c2733";
  ctx.font = "600 26px Inter, sans-serif";
  ctx.fillText("You received a private file", 80, 190);

  // Subtext
  ctx.fillStyle = "#5c6b7a";
  ctx.font = "400 16px Inter, sans-serif";
  const sub = fileName ? `File: ${fileName}` : "Locked on the sender's device";
  ctx.fillText(sub.length > 50 ? sub.slice(0, 47) + "..." : sub, 80, 220);

  // QR in bordered box
  const qrSize = 380;
  const qrX = (W - qrSize) / 2;
  const qrY = 260;
  roundRect(ctx, qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 16);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#e3e9f2";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#5c6b7a";
  ctx.font = "400 14px Inter, sans-serif";
  ctx.fillText("Scan or open the link. It expires automatically.", W / 2, 700);

  // Small orange divider (subtle brand accent)
  ctx.fillStyle = "#E8501E";
  ctx.fillRect(W / 2 - 40, 720, 80, 2);

  ctx.fillStyle = "#1c2733";
  ctx.font = "600 16px Inter, sans-serif";
  ctx.fillText("Send it today. Gone tomorrow.", W / 2, 746);

  return c;
}