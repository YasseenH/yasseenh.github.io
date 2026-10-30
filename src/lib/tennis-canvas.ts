import { COURT, serveTargetX, type Game } from "./tennis";

export function courtView(width: number, height: number) {
  const mobile = width < 600;
  const scale = Math.min(
    width / (mobile ? 620 : 870),
    (height - (mobile ? 144 : 68)) / 1000,
  );
  return {
    scale,
    x: width / 2 - 450 * scale,
    // Leave the mobile toolbar and score clear of the playable court.
    y: mobile
      ? 132 + (height - 132 - 1000 * scale) / 2
      : (height - 1000 * scale) / 2 + 22,
  };
}
function racket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  player: boolean,
  swing: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(
    (player ? 0 : Math.PI) +
      Math.sin((swing / 0.24) * Math.PI) * (player ? -0.55 : 0.55),
  );
  const head = new Path2D();
  if (player) {
    head.moveTo(-17, -40);
    head.lineTo(17, -40);
    head.quadraticCurveTo(29, -37, 29, -24);
    head.lineTo(30, -8);
    head.bezierCurveTo(31, 17, 22, 39, 0, 41);
    head.bezierCurveTo(-22, 39, -31, 17, -30, -8);
    head.lineTo(-29, -24);
    head.quadraticCurveTo(-29, -37, -17, -40);
  } else head.ellipse(0, 0, 28, 41, 0, 0, Math.PI * 2);
  head.closePath();
  const color = player ? "#4a9fff" : "#f0f2f4";
  ctx.fillStyle = "#0a20332e";
  ctx.fill(head);
  ctx.strokeStyle = "#07121c";
  ctx.lineWidth = 9;
  ctx.stroke(head);
  ctx.strokeStyle = player ? "#19487c" : "#b6bfc7";
  ctx.lineWidth = 6;
  ctx.stroke(head);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke(head);
  ctx.save();
  ctx.clip(head);
  ctx.strokeStyle = "#d6e3ee80";
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  for (let n = -25; n <= 25; n += 3.4) {
    ctx.moveTo(n, -44);
    ctx.lineTo(n, 44);
  }
  for (let n = -36; n <= 36; n += 4) {
    ctx.moveTo(-33, n);
    ctx.lineTo(33, n);
  }
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = player ? "#13315b" : "#26313b";
  for (const side of [-1, 1]) {
    for (let y = -22; y <= 14; y += 9) {
      ctx.beginPath();
      ctx.arc(side * 29, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-13, 35);
  ctx.lineTo(-3, 65);
  ctx.moveTo(13, 35);
  ctx.lineTo(3, 65);
  ctx.stroke();
  ctx.strokeStyle = player ? "#8dc4f3" : "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-11, 39);
  ctx.lineTo(-2, 63);
  ctx.moveTo(11, 39);
  ctx.lineTo(2, 63);
  ctx.stroke();
  ctx.fillStyle = player ? "#477cc7" : "#252d36";
  ctx.fillRect(-4, 62, 8, 8);
  ctx.fillStyle = "#e2e5e8";
  ctx.fillRect(-5, 70, 10, 29);
  ctx.strokeStyle = "#8593a2";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let n = 72; n < 97; n += 4) {
    ctx.moveTo(-5, n);
    ctx.lineTo(5, n + 3);
  }
  ctx.stroke();
  ctx.fillStyle = "#e2e5e8";
  ctx.fillRect(-3.5, 73, 7, 24);
  ctx.save();
  ctx.translate(0, 85);
  ctx.rotate(player ? -Math.PI / 2 : Math.PI / 2);
  ctx.font = "600 5.5px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#152c43";
  ctx.fillText(player ? "YONEX" : "HEAD", 0, 0);
  ctx.restore();
  ctx.fillStyle = player ? "#233d73" : "#181c22";
  ctx.fillRect(-6, 98, 12, 4);
  ctx.restore();
}
let crowd: HTMLCanvasElement | undefined;
function drawCrowd(ctx: CanvasRenderingContext2D) {
  if (!crowd) {
    crowd = document.createElement("canvas");
    crowd.width = 900;
    crowd.height = 1000;
    const seats = crowd.getContext("2d")!;
    const shirts = [
      "#476782",
      "#8297a6",
      "#b6bab0",
      "#354e6b",
      "#755a55",
      "#738577",
    ];
    const skin = ["#ae8d76", "#c1a38a", "#7e6050", "#987460"];
    const fan = (x: number, y: number, index: number) => {
      seats.fillStyle = "#172c42";
      seats.fillRect(x - 6, y - 3, 12, 12);
      if (index % 11 === 0) return;
      seats.fillStyle = shirts[index % shirts.length];
      seats.beginPath();
      seats.ellipse(x, y + 5, 4.5, 4, 0, 0, Math.PI * 2);
      seats.fill();
      seats.fillStyle = skin[index % skin.length];
      seats.beginPath();
      seats.arc(x, y - 1, 2.8, 0, Math.PI * 2);
      seats.fill();
      seats.fillStyle = index % 7 === 0 ? "#c1c8c7" : "#172330";
      seats.beginPath();
      seats.arc(x, y - 2, 2.8, Math.PI, Math.PI * 2);
      seats.fill();
    };
    let index = 0;
    for (let row = 0; row < 43; row++) {
      const y = 60 + row * 21;
      for (let column = 0; column < 6; column++) {
        fan(48 + column * 20, y + (column % 2) * 3, index++);
        if (y < 440 || y > 555)
          fan(752 + column * 20, y + (column % 2) * 3, index++);
      }
    }
    for (let column = 0; column < 28; column++) {
      for (let row = 0; row < 2; row++) {
        fan(184 + column * 20, 13 + row * 17, index++);
        fan(184 + column * 20, 975 + row * 17, index++);
      }
    }
  }
  ctx.drawImage(crowd, 0, 0);
}

export function drawCourt(
  ctx: CanvasRenderingContext2D,
  g: Game,
  width: number,
  height: number,
  reduced: boolean,
) {
  const v = courtView(width, height);
  ctx.fillStyle = "#081625";
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(v.x, v.y);
  ctx.scale(v.scale, v.scale);
  drawCrowd(ctx);
  ctx.fillStyle = "#16467b";
  ctx.fillRect(170, 45, 560, 910);
  ctx.fillStyle = "#2263aa";
  ctx.fillRect(210, COURT.top, 480, 720);
  ctx.strokeStyle = "#edf2f5";
  ctx.lineWidth = 2;
  ctx.strokeRect(210, COURT.top, 480, 720);
  ctx.strokeRect(COURT.left, COURT.top, COURT.right - COURT.left, 720);
  ctx.strokeRect(COURT.left, 320, COURT.right - COURT.left, 360);
  ctx.beginPath();
  ctx.moveTo(450, 320);
  ctx.lineTo(450, 680);
  ctx.moveTo(450, 140);
  ctx.lineTo(450, 150);
  ctx.moveTo(450, 850);
  ctx.lineTo(450, 860);
  ctx.stroke();
  ctx.font = "500 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#a7c7e2";
  ctx.fillText("NEW YORK", 450, 85);
  ctx.save();
  ctx.translate(450, 925);
  ctx.rotate(Math.PI);
  ctx.fillText("NEW YORK", 0, 0);
  ctx.restore();
  ctx.fillStyle = "#061827";
  ctx.fillRect(185, 499, 530, 9);
  ctx.strokeStyle = "#9cb4c14d";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let x = 185; x < 715; x += 7) {
    ctx.moveTo(x, 500);
    ctx.lineTo(x, 507);
  }
  ctx.stroke();
  ctx.fillStyle = "#eef2f5";
  ctx.fillRect(185, 497, 530, 2);
  ctx.fillStyle = "#a6b3bd";
  ctx.fillRect(181, 491, 5, 25);
  ctx.fillRect(714, 491, 5, 25);
  // Umpire chair sits at the net, with calls alongside it rather than over play.
  ctx.save();
  if (width < 600) ctx.translate(-55, 0);
  ctx.strokeStyle = "#9aa9b5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(753, 525);
  ctx.lineTo(777, 482);
  ctx.lineTo(785, 525);
  ctx.moveTo(758, 518);
  ctx.lineTo(782, 518);
  ctx.moveTo(763, 508);
  ctx.lineTo(780, 508);
  ctx.stroke();
  ctx.fillStyle = "#d5dee4";
  ctx.fillRect(765, 479, 19, 5);
  ctx.fillStyle = "#d2b99c";
  ctx.beginPath();
  ctx.arc(771, 462, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d7e0e7";
  ctx.fillRect(767, 468, 8, 11);
  ctx.restore();
  if (g.phase === "serve") {
    ctx.strokeStyle = "#e4ec9b99";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(serveTargetX(g), 205, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e4ec9b";
    ctx.beginPath();
    ctx.arc(serveTargetX(g), 205, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!reduced && g.bounceAge < 0.3) {
    ctx.strokeStyle = `rgba(232,238,199,${0.5 * (1 - g.bounceAge / 0.3)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(
      g.bounceX,
      g.bounceY,
      8 + g.bounceAge * 22,
      4 + g.bounceAge * 12,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  racket(ctx, g.cpuX, g.cpuY, false, reduced ? 0 : g.swingCpu);
  racket(ctx, g.playerX, g.playerY, true, reduced ? 0 : g.swingYou);
  ctx.fillStyle = "#04111a66";
  ctx.beginPath();
  ctx.ellipse(g.x + 5, g.y + 6, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  const by = g.y - g.z * 0.45;
  ctx.fillStyle = "#e4ec9b";
  ctx.beginPath();
  ctx.arc(g.x, by, 6 + g.z / 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffe5aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(g.x - 4, by, 5, -0.9, 0.9);
  ctx.stroke();
  ctx.restore();
}
