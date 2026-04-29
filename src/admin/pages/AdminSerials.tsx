/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Search, Tag, Package, CheckCircle2, AlertCircle,
  Loader2, FileDown, Archive, RefreshCw, Image as ImageIcon,
  FileText, Zap,
} from "lucide-react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import JSZip from "jszip";
import logoFull from "@/assets/logo-full-new.png";

// ─── helpers ─────────────────────────────────────────────────────────────────

function generateSerial(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `HLX-${year}-${code}`;
}

async function makeQR(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 180, margin: 1, color: { dark: "#000", light: "#fff" } });
}

function makeBarcodeDataUrl(text: string): string {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, { format: "CODE128", width: 2, height: 48, displayValue: false, margin: 4, background: "#ffffff" });
  return canvas.toDataURL("image/png");
}

// Convert any URL or imported asset path to base64 data URL
async function toDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(""); // graceful fallback
    img.src = src;
  });
}

// Wrap text to fit maxWidth, returns array of lines
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else { line = test; }
  }
  if (line) lines.push(line);
  return lines;
}

// ─── Tag builder — pure Canvas 2D, no html2canvas ────────────────────────────

async function buildTagDataUrl(product: any): Promise<string> {
  const W = 1400, H = 480; // 2× for retina, renders at 700×240 equivalent
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = "#222222";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // ── LEFT PANEL (black) ──────────────────────────────────────────────────────
  const leftW = 300;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, leftW, H);
  ctx.clip();
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, leftW, H);

  // Logo (white via compositing)
  const logoB64 = await toDataUrl(logoFull);
  if (logoB64) {
    const logoImg = new Image();
    await new Promise<void>(r => { logoImg.onload = () => r(); logoImg.onerror = () => r(); logoImg.src = logoB64; });
    // Draw logo white: draw on temp canvas, invert via globalCompositeOperation
    const tmp = document.createElement("canvas");
    tmp.width = logoImg.naturalWidth; tmp.height = logoImg.naturalHeight;
    const tc = tmp.getContext("2d")!;
    tc.drawImage(logoImg, 0, 0);
    // Make white: draw white rect with destination-in to keep shape, then use screen
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    // Draw logo tinted white using a trick: draw white rect clipped to logo alpha
    const lW = 220, lH = Math.round(lW * (logoImg.naturalHeight / logoImg.naturalWidth));
    const lX = (leftW - lW) / 2, lY = H / 2 - lH / 2 - 20;
    // Draw logo normally first on offscreen, then colorize
    const off = document.createElement("canvas"); off.width = lW; off.height = lH;
    const oc = off.getContext("2d")!;
    oc.drawImage(logoImg, 0, 0, lW, lH);
    oc.globalCompositeOperation = "source-in";
    oc.fillStyle = "#ffffff";
    oc.fillRect(0, 0, lW, lH);
    ctx.drawImage(off, lX, lY);
    ctx.restore();

    // Tagline below logo
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "18px 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = "center";
    // Ensure tagline stays within left panel
    const tagY = Math.min(lY + lH + 30, H - 30);
    ctx.fillText("LUXURY · LEATHER", leftW / 2, tagY);
    ctx.fillText("· LEGACY", leftW / 2, tagY + 24);
  } else {
    // Fallback text logo
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("28TH HIDE LUXE", leftW / 2, H / 2 - 10);
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "20px Arial";
    ctx.fillText("LUXURY · LEATHER · LEGACY", leftW / 2, H / 2 + 24);
  }
  ctx.restore(); // end left panel clip

  // ── DASHED DIVIDER ──────────────────────────────────────────────────────────
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(leftW, 30); ctx.lineTo(leftW, H - 30); ctx.stroke();
  ctx.restore();

  // ── CENTER SECTION ──────────────────────────────────────────────────────────
  const centerX = leftW + 20;
  const rightPanelX = W - 310;
  const centerW = rightPanelX - centerX - 20;

  // Product image
  const imgSrc = product.image || product.images?.[0] || "";
  let imgDrawn = false;
  if (imgSrc) {
    const imgB64 = await toDataUrl(imgSrc);
    if (imgB64) {
      const pImg = new Image();
      await new Promise<void>(r => { pImg.onload = () => r(); pImg.onerror = () => r(); pImg.src = imgB64; });
      const iSize = 200;
      const iX = centerX + 10, iY = (H - iSize) / 2;
      // Rounded rect clip
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(iX, iY, iSize, iSize, 12);
      ctx.clip();
      ctx.drawImage(pImg, iX, iY, iSize, iSize);
      ctx.restore();
      // Border
      ctx.strokeStyle = "#eeeeee"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(iX, iY, iSize, iSize, 12); ctx.stroke();
      imgDrawn = true;
    }
  }

  const textX = imgDrawn ? centerX + 230 : centerX + 10;
  const textMaxW = centerW - (imgDrawn ? 240 : 10);
  let ty = 100;

  // Product name
  ctx.fillStyle = "#000000";
  ctx.font = "bold 38px 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "left";
  const nameLines = wrapText(ctx, product.name || "Product", textMaxW);
  nameLines.slice(0, 2).forEach(line => { ctx.fillText(line, textX, ty); ty += 46; });

  // Category
  if (product.category) {
    ty += 4;
    ctx.fillStyle = "#888888";
    ctx.font = "bold 22px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText(product.category.toUpperCase(), textX, ty);
    ty += 36;
  }

  // Serial pill
  ty += 8;
  const serialText = product.serialNumber;
  ctx.font = "bold 24px monospace";
  const pillW = ctx.measureText(serialText).width + 32;
  ctx.fillStyle = "#f5f5f5";
  ctx.strokeStyle = "#e0e0e0"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(textX, ty - 28, pillW, 40, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#222222";
  ctx.fillText(serialText, textX + 16, ty);
  ty += 44;

  // Verify URL
  ctx.fillStyle = "#bbbbbb";
  ctx.font = "18px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("www.28hideluxe.com/verify", textX, ty);
  ty += 30;

  // ── Extra info row: sizes | material | care ─────────────────────────────────
  const sizes: string[] = Array.isArray(product.sizes) ? product.sizes : [];
  const materials: string = product.materials || "";
  const care: string = product.care || "";

  // Sizes chips
  if (sizes.length > 0) {
    ctx.font = "bold 18px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "#555555";
    ctx.fillText("SIZE:", textX, ty);
    let chipX = textX + ctx.measureText("SIZE: ").width + 4;
    ctx.font = "bold 17px monospace";
    sizes.slice(0, 6).forEach(s => {
      const sw = ctx.measureText(s).width + 16;
      ctx.fillStyle = "#f0f0f0";
      ctx.strokeStyle = "#cccccc"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(chipX, ty - 18, sw, 24, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#222222";
      ctx.fillText(s, chipX + 8, ty);
      chipX += sw + 6;
    });
    ty += 32;
  }

  // Material
  if (materials) {
    ctx.font = "bold 17px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "#555555";
    ctx.textAlign = "left";
    const matLabel = "MATERIAL: ";
    ctx.fillText(matLabel, textX, ty);
    ctx.font = "17px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "#222222";
    const matX = textX + ctx.measureText(matLabel).width;
    const matLines = wrapText(ctx, materials, textMaxW - ctx.measureText(matLabel).width);
    ctx.fillText(matLines[0] || materials, matX, ty);
    ty += 26;
  }

  // Care
  if (care) {
    ctx.font = "bold 17px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "#555555";
    const careLabel = "CARE: ";
    ctx.fillText(careLabel, textX, ty);
    ctx.font = "17px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "#222222";
    const careX = textX + ctx.measureText(careLabel).width;
    const careLines = wrapText(ctx, care, textMaxW - ctx.measureText(careLabel).width);
    ctx.fillText(careLines[0] || care, careX, ty);
  }

  // ── DASHED DIVIDER RIGHT ────────────────────────────────────────────────────
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = "#cccccc"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(rightPanelX, 30); ctx.lineTo(rightPanelX, H - 30); ctx.stroke();
  ctx.restore();

  // ── RIGHT PANEL: barcode + QR ───────────────────────────────────────────────
  const rCX = rightPanelX + (W - rightPanelX) / 2;

  // Barcode
  const bcCanvas = document.createElement("canvas");
  JsBarcode(bcCanvas, product.serialNumber, { format: "CODE128", width: 3, height: 80, displayValue: false, margin: 6, background: "#ffffff" });
  const bcW = 260, bcH = Math.round(bcW * (bcCanvas.height / bcCanvas.width));
  ctx.drawImage(bcCanvas, rCX - bcW / 2, 40, bcW, bcH);

  // Serial under barcode
  ctx.fillStyle = "#555555";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.fillText(product.serialNumber, rCX, 40 + bcH + 26);

  // QR code
  const qrData = await makeQR(`https://www.28hideluxe.com/verify?s=${product.serialNumber}`);
  const qrImg = new Image();
  await new Promise<void>(r => { qrImg.onload = () => r(); qrImg.onerror = () => r(); qrImg.src = qrData; });
  const qrSize = 150;
  ctx.drawImage(qrImg, rCX - qrSize / 2, H - qrSize - 60);

  ctx.fillStyle = "#aaaaaa";
  ctx.font = "18px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("Scan to verify", rCX, H - 20);

  return canvas.toDataURL("image/png");
}

// ─── PDF export — tag-sized pages, one per product, print-ready ──────────────

async function exportPDF(targets: any[]) {
  const withSerial = targets.filter(p => p.serialNumber);
  if (!withSerial.length) return toast({ title: "No products with serials", variant: "destructive" });

  // Tag dimensions: 700×240px at 96dpi → ~185×63mm
  const pageW = 185; const pageH = 63;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [pageW, pageH] });

  for (let i = 0; i < withSerial.length; i++) {
    if (i > 0) pdf.addPage([pageW, pageH], "landscape");
    const p = withSerial[i];
    const tagDataUrl = await buildTagDataUrl(p);
    pdf.addImage(tagDataUrl, "PNG", 0, 0, pageW, pageH);
  }

  pdf.save(`HLX-tags-${Date.now()}.pdf`);
  toast({ title: `PDF downloaded — ${withSerial.length} tag pages` });
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(targets: any[]) {
  const rows = [["Name", "Category", "Serial Number", "Product ID", "Registered At", "Verify URL"]];
  targets.forEach(p => {
    rows.push([
      p.name || "",
      p.category || "",
      p.serialNumber || "",
      p.id,
      p.serialGeneratedAt ? new Date(p.serialGeneratedAt).toLocaleDateString() : "",
      p.serialNumber ? `https://www.28hideluxe.com/verify?s=${p.serialNumber}` : "",
    ]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `HLX-serials-${Date.now()}.csv`; a.click();
  toast({ title: `CSV exported (${targets.length} rows)` });
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminSerials = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterSerial, setFilterSerial] = useState<"all" | "with" | "without">("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const withoutSerial = products.filter(p => !p.serialNumber);

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let list = [...products];
    if (search) list = list.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.serialNumber?.toLowerCase().includes(search.toLowerCase())
    );
    if (filterCat !== "all") list = list.filter(p => p.category === filterCat);
    if (filterSerial === "with") list = list.filter(p => !!p.serialNumber);
    if (filterSerial === "without") list = list.filter(p => !p.serialNumber);
    setFiltered(list);
  }, [products, search, filterCat, filterSerial]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setProducts(list);
    } catch { toast({ title: "Failed to load products", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const generateOne = async (product: any) => {
    setGenerating(product.id);
    try {
      const serial = generateSerial();
      await updateDoc(doc(db, "products", product.id), { serialNumber: serial, serialGeneratedAt: new Date().toISOString() });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, serialNumber: serial, serialGeneratedAt: new Date().toISOString() } : p));
      toast({ title: "Serial generated", description: serial });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setGenerating(null); }
  };

  const generateAllMissing = async () => {
    const missing = products.filter(p => !p.serialNumber);
    if (!missing.length) return toast({ title: "All products already have serials" });
    if (!confirm(`Generate serials for ${missing.length} products?`)) return;
    setBusy(true);
    try {
      const updated: any[] = [];
      for (const p of missing) {
        const serial = generateSerial();
        await updateDoc(doc(db, "products", p.id), { serialNumber: serial, serialGeneratedAt: new Date().toISOString() });
        updated.push({ id: p.id, serial });
      }
      setProducts(prev => prev.map(p => {
        const u = updated.find(x => x.id === p.id);
        return u ? { ...p, serialNumber: u.serial, serialGeneratedAt: new Date().toISOString() } : p;
      }));
      toast({ title: `Generated ${missing.length} serials` });
    } catch { toast({ title: "Bulk generation failed", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const generateBulkSelected = async () => {
    const targets = filtered.filter(p => selected.has(p.id) && !p.serialNumber);
    if (!targets.length) return toast({ title: "All selected already have serials" });
    setBusy(true);
    try {
      for (const p of targets) {
        const serial = generateSerial();
        await updateDoc(doc(db, "products", p.id), { serialNumber: serial, serialGeneratedAt: new Date().toISOString() });
        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, serialNumber: serial } : x));
      }
      toast({ title: `Generated ${targets.length} serials` });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const downloadTagImage = async (product: any) => {
    if (!product.serialNumber) return toast({ title: "Generate a serial first", variant: "destructive" });
    setBusy(true);
    try {
      const dataUrl = await buildTagDataUrl(product);
      const a = document.createElement("a"); a.href = dataUrl;
      a.download = `${product.serialNumber}_${(product.name || "product").replace(/\s+/g, "-")}.png`;
      a.click();
    } catch { toast({ title: "Download failed", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const downloadZip = async (targets: any[]) => {
    const withSerial = targets.filter(p => p.serialNumber);
    if (!withSerial.length) return toast({ title: "No products with serials selected", variant: "destructive" });
    setBusy(true);
    try {
      const zip = new JSZip();
      for (const p of withSerial) {
        const dataUrl = await buildTagDataUrl(p);
        zip.file(`${p.serialNumber}_${(p.name || "product").replace(/\s+/g, "-")}.png`, dataUrl.split(",")[1], { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `HLX-tags-${Date.now()}.zip`; a.click();
      toast({ title: `Downloaded ${withSerial.length} tags as ZIP` });
    } catch { toast({ title: "ZIP failed", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const toggleSelect = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const selectAll = () => setSelected(new Set(filtered.map(p => p.id)));
  const clearSelect = () => setSelected(new Set());
  const selectedProducts = filtered.filter(p => selected.has(p.id));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6" /> Serial Number Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.filter(p => p.serialNumber).length} / {products.length} products have serials
            {withoutSerial.length > 0 && <span className="text-orange-500 ml-2">· {withoutSerial.length} pending</span>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Top action bar */}
      <div className="bg-gray-50 border rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {withoutSerial.length > 0 && (
            <Button onClick={generateAllMissing} disabled={busy} className="bg-black text-white hover:bg-gray-800">
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Generate All Missing ({withoutSerial.length})
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(products.filter(p => p.serialNumber))} disabled={busy}>
            <FileText className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPDF(products.filter(p => p.serialNumber))} disabled={busy}>
            <FileDown className="w-4 h-4 mr-1.5" /> Export PDF (All)
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadZip(products.filter(p => p.serialNumber))} disabled={busy}>
            <Archive className="w-4 h-4 mr-1.5" /> Download All Tags ZIP
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or serials..." className="pl-9" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterSerial} onChange={e => setFilterSerial(e.target.value as any)}
          className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
          <option value="all">All Products</option>
          <option value="with">Has Serial</option>
          <option value="without">No Serial</option>
        </select>
      </div>

      {/* Bulk selection bar */}
      {selected.size > 0 && (
        <div className="bg-black text-white rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="secondary" onClick={generateBulkSelected} disabled={busy}>
            <Tag className="w-4 h-4 mr-1" /> Generate Missing
          </Button>
          <Button size="sm" variant="secondary" onClick={() => downloadZip(selectedProducts)} disabled={busy}>
            <Archive className="w-4 h-4 mr-1" /> Tags ZIP
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exportPDF(selectedProducts)} disabled={busy}>
            <FileDown className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exportCSV(selectedProducts)} disabled={busy}>
            <FileText className="w-4 h-4 mr-1" /> CSV
          </Button>
          <button onClick={clearSelect} className="ml-auto text-xs text-gray-300 hover:text-white underline">Clear</button>
        </div>
      )}

      {/* Select all row */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <button onClick={selectAll} className="underline hover:text-black">Select all {filtered.length}</button>
        {selected.size > 0 && <button onClick={clearSelect} className="underline hover:text-black">Clear</button>}
        {busy && <span className="flex items-center gap-1 text-yellow-600 ml-auto"><Loader2 className="w-4 h-4 animate-spin" /> Processing…</span>}
      </div>

      {/* Product list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid gap-2">
          {filtered.map(product => {
            const hasSerial = !!product.serialNumber;
            const isSelected = selected.has(product.id);
            const img = product.image || product.images?.[0] || product.thumbnail;
            return (
              <div key={product.id}
                className={`border rounded-xl p-4 flex items-center gap-4 transition-all ${isSelected ? "border-black bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product.id)} className="w-4 h-4 rounded flex-shrink-0 cursor-pointer" />
                {img
                  ? <img src={img} alt={product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-100" />
                  : <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><Package className="w-6 h-6 text-gray-400" /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{product.category || "—"}</p>
                  {hasSerial
                    ? <div className="flex items-center gap-1.5 mt-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /><span className="font-mono text-xs text-gray-700">{product.serialNumber}</span></div>
                    : <div className="flex items-center gap-1.5 mt-1"><AlertCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" /><span className="text-xs text-orange-500">No serial number</span></div>
                  }
                </div>
                <Badge variant="secondary" className={hasSerial ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"}>
                  {hasSerial ? "Verified" : "Pending"}
                </Badge>
                <div className="flex gap-2 flex-shrink-0">
                  {!hasSerial ? (
                    <Button size="sm" onClick={() => generateOne(product)} disabled={generating === product.id}>
                      {generating === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4 mr-1" />}
                      Generate
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => downloadTagImage(product)} disabled={busy} title="Download tag PNG">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportPDF([product])} disabled={busy} title="Download PDF">
                        <FileDown className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSerials;
