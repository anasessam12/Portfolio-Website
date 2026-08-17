import * as THREE from "three";

export class ScreenTextureController {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  private animFrameId: number | null = null;
  private scrollOffset = 0;
  private cursorBlink = 0;
  private currentLineIndex = 0;
  private currentCharIndex = 0;
  private typingSpeed = 1.8;

  private codeLines: { text: string; color: string; prefix?: string; indent: number }[] = [
    { text: "// ANAS ESSAM — ANGULAR LEAD ARCHITECT", color: "#64748b", indent: 0 },
    { text: "import { Component, signal, computed } from '@angular/core';", color: "#c084fc", indent: 0 },
    { text: "import { injectSignalStore } from '@cloud4rain/core';", color: "#c084fc", indent: 0 },
    { text: "import { ElectronSyncService } from './offline-sync';", color: "#c084fc", indent: 0 },
    { text: "", color: "#ffffff", indent: 0 },
    { text: "@Component({", color: "#facc15", indent: 0 },
    { text: "  selector: 'apa-portal-root',", color: "#38bdf8", indent: 1 },
    { text: "  standalone: true,", color: "#38bdf8", indent: 1 },
    { text: "  templateUrl: './app.component.html',", color: "#38bdf8", indent: 1 },
    { text: "  styleUrls: ['./app.component.css']", color: "#38bdf8", indent: 1 },
    { text: "})", color: "#facc15", indent: 0 },
    { text: "export class EnterpriseApp {", color: "#60a5fa", indent: 0 },
    { text: "  readonly developer = signal('Anas Essam');", color: "#4ade80", indent: 1 },
    { text: "  readonly role = signal('Frontend Lead & Architect');", color: "#4ade80", indent: 1 },
    { text: "  readonly syncEngine = inject(ElectronSyncService);", color: "#f472b6", indent: 1 },
    { text: "  readonly isOfflineReady = computed(() => true);", color: "#38bdf8", indent: 1 },
    { text: "", color: "#ffffff", indent: 0 },
    { text: "  async onVoteSubmit(payload: EncryptedVote) {", color: "#facc15", indent: 1 },
    { text: "    await this.syncEngine.queueEncryptedRecord(payload);", color: "#e2e8f0", indent: 2 },
    { text: "    this.telemetry.track('ELECTION_VOTE_SUCCESS');", color: "#a78bfa", indent: 2 },
    { text: "  }", color: "#facc15", indent: 1 },
    { text: "}", color: "#60a5fa", indent: 0 },
  ];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 1024;
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = true;

    this.render();
  }

  public update(delta: number) {
    this.cursorBlink += delta * 4;
    this.currentCharIndex += delta * 30 * this.typingSpeed;

    const currentLine = this.codeLines[this.currentLineIndex];
    if (currentLine && this.currentCharIndex > currentLine.text.length + 12) {
      this.currentCharIndex = 0;
      this.currentLineIndex = (this.currentLineIndex + 1) % this.codeLines.length;
      if (this.currentLineIndex > 10) {
        this.scrollOffset = Math.min((this.currentLineIndex - 10) * 32, 280);
      } else {
        this.scrollOffset = 0;
      }
    }

    this.render();
    this.texture.needsUpdate = true;
  }

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background - Dark Cyber Editor
    const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, "#08060d");
    bgGradient.addColorStop(0.7, "#0d0a14");
    bgGradient.addColorStop(1, "#050308");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // Subtle Grid pattern
    ctx.strokeStyle = "rgba(194, 164, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top Title Bar
    ctx.fillStyle = "#120e1c";
    ctx.fillRect(0, 0, w, 70);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(0, 68, w, 2);

    // Window controls (Red, Yellow, Green dots)
    const dotColors = ["#ef4444", "#f59e0b", "#10b981"];
    dotColors.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(36 + i * 26, 35, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // Active Tab Header
    ctx.fillStyle = "#1a1429";
    ctx.beginPath();
    ctx.roundRect(140, 16, 380, 48, [8, 8, 0, 0]);
    ctx.fill();
    ctx.fillStyle = "#c2a4ff";
    ctx.beginPath();
    ctx.roundRect(140, 62, 380, 3, [0, 0, 0, 0]);
    ctx.fill();

    // Tab Text
    ctx.fillStyle = "#f3e8ff";
    ctx.font = "600 20px 'Geist', 'JetBrains Mono', Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillText("⚡ apa-portal.component.ts", 160, 47);

    // Git branch badge
    ctx.fillStyle = "#38bdf8";
    ctx.font = "500 18px 'Geist', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("⎇ main (v21.0.4)", w - 40, 46);

    // Editor Content Area
    const startY = 110 - this.scrollOffset;
    const lineHeight = 34;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 70, w, 680);
    ctx.clip();

    this.codeLines.forEach((line, idx) => {
      const y = startY + idx * lineHeight;
      if (y < 40 || y > 760) return;

      // Line number
      ctx.fillStyle = idx === this.currentLineIndex ? "#c2a4ff" : "#475569";
      ctx.font = "500 18px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "right";
      ctx.fillText((idx + 1).toString().padStart(2, " "), 50, y);

      // Active line highlight
      if (idx === this.currentLineIndex) {
        ctx.fillStyle = "rgba(194, 164, 255, 0.08)";
        ctx.fillRect(70, y - 24, w - 90, lineHeight);
      }

      // Code text
      let textToRender = line.text;
      if (idx === this.currentLineIndex) {
        textToRender = line.text.substring(0, Math.floor(this.currentCharIndex));
      } else if (idx > this.currentLineIndex) {
        textToRender = "";
      }

      ctx.fillStyle = line.color;
      ctx.font = "500 21px 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "left";
      const indentX = 80 + line.indent * 24;
      ctx.fillText(textToRender, indentX, y);

      // Blinking cursor on active line
      if (idx === this.currentLineIndex && Math.sin(this.cursorBlink) > 0) {
        const textMetrics = ctx.measureText(textToRender);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(indentX + textMetrics.width + 2, y - 20, 10, 24);
      }
    });

    ctx.restore();

    // Bottom Terminal Bar
    const termY = 760;
    ctx.fillStyle = "#0c0816";
    ctx.fillRect(0, termY, w, h - termY);
    ctx.fillStyle = "rgba(194, 164, 255, 0.15)";
    ctx.fillRect(0, termY, w, 2);

    // Terminal Title
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 18px 'Geist', monospace";
    ctx.fillText("TERMINAL  •  zsh (Nx Cloud)", 30, termY + 36);

    // Terminal status badge
    ctx.fillStyle = "rgba(74, 222, 128, 0.15)";
    ctx.beginPath();
    ctx.roundRect(w - 180, termY + 16, 150, 30, [6, 6, 6, 6]);
    ctx.fill();
    ctx.fillStyle = "#4ade80";
    ctx.font = "600 16px 'Geist', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("● BUILD PASSING", w - 105, termY + 37);

    // Terminal Logs
    ctx.textAlign = "left";
    ctx.font = "500 18px 'JetBrains Mono', monospace";

    ctx.fillStyle = "#38bdf8";
    ctx.fillText("➜  Local:   http://localhost:4200/ (APA Gov Portal)", 30, termY + 80);

    ctx.fillStyle = "#4ade80";
    ctx.fillText("✔  Electron IPC Bridge Initialized (Offline Sync Ready)", 30, termY + 120);

    ctx.fillStyle = "#c084fc";
    ctx.fillText("⚡ Nx Cache: 100% up to date [6/6 projects ready]", 30, termY + 160);

    ctx.fillStyle = "#facc15";
    ctx.fillText("✨ Signals & RxJS State Streams: Active (60 FPS)", 30, termY + 200);

    // Bottom Glow edge
    const edgeGradient = ctx.createLinearGradient(0, h - 20, 0, h);
    edgeGradient.addColorStop(0, "rgba(194, 164, 255, 0)");
    edgeGradient.addColorStop(1, "rgba(194, 164, 255, 0.25)");
    ctx.fillStyle = edgeGradient;
    ctx.fillRect(0, h - 20, w, 20);
  }

  public dispose() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.texture.dispose();
  }
}
