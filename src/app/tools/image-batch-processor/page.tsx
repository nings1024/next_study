"use client";

import { useState, useRef } from "react";
import { Upload, X, Download, Crop, Grid3X3, Image as ImageIcon, Maximize2, Minimize2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import imageCompression from "browser-image-compression";

interface ImageFile {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
  canvas?: HTMLCanvasElement;
}

export default function ImageProcessor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 统一分辨率相关
  const [unifyMode, setUnifyMode] = useState<"max" | "min" | "custom">("max");
  const [customWidth, setCustomWidth] = useState("1920");
  const [customHeight, setCustomHeight] = useState("1080");
  const [resizeMethod, setResizeMethod] = useState<"scale" | "pad">("scale"); // scale=直接缩放 pad=留白填充

  // 拼图相关
  const [tileMode, setTileMode] = useState<"square" | "row" | "col">("square");
  const [gap, setGap] = useState("10");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    addImages(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addImages(files);
    }
  };

  const addImages = async (files: File[]) => {
    const newImages: ImageFile[] = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      newImages.push({
        id: Math.random().toString(36).slice(2),
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter(i => i.id !== id);
    });
  };

  // 一、统一分辨率
  const unifyResolution = async () => {
    let targetW = 0, targetH = 0;

    if (unifyMode === "max") {
      targetW = Math.max(...images.map(i => i.width));
      targetH = Math.max(...images.map(i => i.height));
    } else if (unifyMode === "min") {
      targetW = Math.min(...images.map(i => i.width));
      targetH = Math.min(...images.map(i => i.height));
    } else {
      targetW = parseInt(customWidth) || 1920;
      targetH = parseInt(customHeight) || 1080;
    }

    const newImages = await Promise.all(
      images.map(async (img) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        if (resizeMethod === "scale") {
          canvas.width = targetW;
          canvas.height = targetH;
          ctx.drawImage(await loadImage(img.url), 0, 0, targetW, targetH);
        } else {
          // pad 方式：保持比例，空白填充
          const ratio = Math.min(targetW / img.width, targetH / img.height);
          const newW = Math.round(img.width * ratio);
          const newH = Math.round(img.height * ratio);
          canvas.width = targetW;
          canvas.height = targetH;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(await loadImage(img.url), (targetW - newW) / 2, (targetH - newH) / 2, newW, newH);
        }

        const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), "image/jpeg", 0.95));
        const newUrl = URL.createObjectURL(blob);
        return { ...img, url: newUrl, width: targetW, height: targetH, canvas };
      })
    );

    // 清理旧的 url
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages(newImages);
  };

  // 二、批量裁剪（点击一张图划区域）
  const startCrop = (id: string) => {
    setSelectedId(id);
    setIsCropping(true);
  };

  const applyCrop = async () => {
    if (!cropRect || !selectedId) return;
    const srcImg = images.find(i => i.id === selectedId);
    if (!srcImg) return;

    const image = await loadImage(srcImg.url);
    const canvas = document.createElement("canvas");
    canvas.width = cropRect.w;
    canvas.height = cropRect.h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      image,
      cropRect.x, cropRect.y, cropRect.w, cropRect.h,
      0, 0, cropRect.w, cropRect.h
    );

    const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), "image/jpeg", 0.95));
    const newUrl = URL.createObjectURL(blob);

    const croppedAll = await Promise.all(
      images.map(async (img) => {
        if (img.id === selectedId) {
          URL.revokeObjectURL(img.url);
          return { ...img, url: newUrl, width: cropRect!.w, height: cropRect!.h };
        }
        const c = document.createElement("canvas");
        c.width = cropRect!.w;
        c.height = cropRect!.h;
        const ctx2 = c.getContext("2d")!;
        const fullImg = await loadImage(img.url);
        const scaleX = fullImg.width / image.width;
        const scaleY = fullImg.height / image.height;
        ctx2.drawImage(
          fullImg,
          cropRect!.x * scaleX, cropRect!.y * scaleY,
          cropRect!.w * scaleX, cropRect!.h * scaleY,
          0, 0, cropRect!.w, cropRect!.h
        );
        const b = await new Promise<Blob>(res => c.toBlob(bb => res(bb!), "image/jpeg", 0.95));
        URL.revokeObjectURL(img.url);
        return { ...img, url: URL.createObjectURL(b), width: cropRect!.w, height: cropRect!.h };
      })
    );

    setImages(croppedAll);
    setIsCropping(false);
    setCropRect(null);
    setSelectedId(null);
  };

  // 三、拼图
  const tileImages = async () => {
    if (images.length === 0) return;

    let cols = 1, rows = 1;
    if (tileMode === "square") {
      cols = rows = Math.ceil(Math.sqrt(images.length));
    } else if (tileMode === "row") {
      rows = 1;
      cols = images.length;
    } else if (tileMode === "col") {
      cols = 1;
      rows = images.length;
    }

    const gapPx = parseInt(gap) || 0;
    const cellW = Math.max(...images.map(i => i.width));
    const cellH = Math.max(...images.map(i => i.height));

    const canvas = document.createElement("canvas");
    canvas.width = cols * cellW + (cols - 1) * gapPx;
    canvas.height = rows * cellH + (rows - 1) * gapPx;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < images.length; i++) {
      const img = await loadImage(images[i].url);
      const row = tileMode === "col" ? i : Math.floor(i / cols);
      const col = tileMode === "row" ? i : i % cols;
      const x = col * (cellW + gapPx);
      const y = row * (cellH + gapPx);
      ctx.drawImage(img, x, y, cellW, cellH);
    }

    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setImages([{ id: "tiled", file: new File([blob], "tiled.jpg", { type: "image/jpeg" }), url, width: canvas.width, height: canvas.height }]);
      }
    }, "image/jpeg", 0.95);
  };

  // 四、下载
  const downloadAll = async () => {
    const zip = new JSZip();
    for (const img of images) {
      const resp = await fetch(img.url);
      const blob = await resp.blob();
      zip.file(`${img.file.name.split(".")[0]}_${img.width}x${img.height}.jpg`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `images_${new Date().getTime()}.zip`);
  };

  const downloadTiled = () => {
    if (images.length !== 1) return;
    const a = document.createElement("a");
    a.href = images[0].url;
    a.download = "tiled_result.jpg";
    a.click();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center">多功能图片处理工具</h1>

          {/* 上传区域 */}
          <Card
            className="border-dashed border-4 cursor-pointer hover:bg-gray-50 transition"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-12 text-center space-y-4">
              <Upload className="w-16 h-16 mx-auto text-gray-400" />
              <p className="text-xl">点击或拖拽图片到这里（支持多张）</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>
          </Card>

          {/* 图片列表 */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map(img => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg shadow hover:shadow-xl transition cursor-pointer"
                    onClick={() => window.open(img.url, "_blank")}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startCrop(img.id)}>
                      <Crop className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => removeImage(img.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-center mt-1">{img.width}×{img.height}</div>
                </div>
              ))}
            </div>
          )}

          {/* 一、统一分辨率 */}
          {images.length > 0 && (
            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2"><Maximize2 /> 统一分辨率</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <RadioGroup value={unifyMode} onValueChange={v => setUnifyMode(v as any)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="max" />
                      <Label>匹配最大分辨率</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="min" />
                      <Label>匹配最小分辨率</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" />
                      <Label>自定义尺寸</Label>
                    </div>
                  </RadioGroup>

                  {unifyMode === "custom" && (
                    <div className="flex gap-4">
                      <Input placeholder="宽" value={customWidth} onChange={e => setCustomWidth(e.target.value)} />
                      <Input placeholder="高" value={customHeight} onChange={e => setCustomHeight(e.target.value)} />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>缩放方式</Label>
                  <RadioGroup value={resizeMethod} onValueChange={v => setResizeMethod(v as any)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scale" />
                      <Label>直接缩放（可能变形）</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pad" />
                      <Label>等比缩放 + 留白填充</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <Button onClick={unifyResolution} className="w-full">应用统一分辨率</Button>
            </Card>
          )}

          {/* 三、拼图 */}
          {images.length > 1 && (
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2"><Grid3X3 /> 拼图</h2>
              <div className="flex items-center gap-6">
                <Select value={tileMode} onValueChange={v => setTileMode(v as any)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">尽量正方形 (n×n)</SelectItem>
                    <SelectItem value="row">一整行</SelectItem>
                    <SelectItem value="col">一整列</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Label>间距(px)</Label>
                  <Input type="number" value={gap} onChange={e => setGap(e.target.value)} className="w-24" />
                </div>
                <Button onClick={tileImages}>生成拼图（会替换当前图片为一张）</Button>
              </div>
            </Card>
          )}

          {/* 下载 */}
          {images.length > 0 && (
            <div className="flex gap-4 justify-center">
              {images.length === 1 ? (
                <Button size="lg" onClick={downloadTiled}>
                  <Download className="mr-2" /> 下载拼图结果
                </Button>
              ) : (
                <Button size="lg" onClick={downloadAll}>
                  <Download className="mr-2" /> 打包下载全部图片 (ZIP)
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 裁剪弹窗 */}
      <Dialog open={isCropping} onOpenChange={setIsCropping}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>请在图片上拖拽选择裁剪区域（所有图片将按相同比例裁剪）</DialogTitle>
          </DialogHeader>
          {selectedId && (
            <Cropper
              src={images.find(i => i.id === selectedId)!.url}
              onCrop={setCropRect}
              onConfirm={applyCrop}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// 简单裁剪组件
function Cropper({ src, onCrop, onConfirm }: {
  src: string;
  onCrop: (rect: { x: number; y: number; w: number; h: number } | null) => void;
  onConfirm: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = imgRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStart({ x, y });
    setDragging(true);
    setRect({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = imgRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = x - start.x;
    const h = y - start.y;
    setRect({
      x: w > 0 ? start.x : x,
      y: h > 0 ? start.y : y,
      w: Math.abs(w),
      h: Math.abs(h),
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
    if (rect.w > 10 && rect.h > 10) {
      const img = imgRef.current!;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      onCrop({
        x: rect.x * scaleX,
        y: rect.y * scaleY,
        w: rect.w * scaleX,
        h: rect.h * scaleY,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative inline-block">
        <img
          ref={imgRef}
          src={src}
          alt="crop"
          className="max-w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: "crosshair" }}
        />
        {rect.w > 0 && rect.h > 0 && (
          <div
            className="absolute border-2 border-red-500 bg-red-500/20"
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
            }}
          />
        )}
      </div>
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => { onCrop(null); }}>取消</Button>
        <Button onClick={onConfirm} disabled={rect.w < 10}>应用到全部图片</Button>
      </div>
    </div>
  );
}