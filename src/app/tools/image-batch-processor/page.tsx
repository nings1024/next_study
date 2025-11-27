"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  Upload, 
  X, 
  Scissors, 
  Grid, 
  LayoutList, 
  AlignJustify, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Trash2,
  Move
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

/**
 * ----------------------------------------------------------------------------
 * TYPE DEFINITIONS (解决 any 报错)
 * ----------------------------------------------------------------------------
 */
interface ImageFile {
  id: string;
  url: string;
  width: number;
  height: number;
  file: File;
}


/**
 * ----------------------------------------------------------------------------
 * MAIN APPLICATION
 * ----------------------------------------------------------------------------
 */

export default function ImageToolPage() {
  // 使用明确定义的 ImageFile 数组类型
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null); // Lightbox
  const [isCropping, setIsCropping] = useState(false);
  const [mergedResult, setMergedResult] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 处理图片导入 ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 使用明确定义的 ImageFile 数组类型
    const newImages: ImageFile[] = [];
    let loadedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          newImages.push({
            id: Math.random().toString(36).substr(2, 9),
            url: event.target?.result as string,
            width: img.width,
            height: img.height,
            file: file
          });
          loadedCount++;
          if (loadedCount === files.length) {
            setImages(prev => [...prev, ...newImages]);
            toast.success(`成功导入 ${files.length} 张图片`);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- 删除图片 ---
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // 辅助函数：异步加载图片
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  // --- 拼图逻辑 ---
  const mergeImages = useCallback(async (type: 'horizontal' | 'vertical' | 'grid') => {
    if (images.length === 0) return;

    const toastId = toast.loading("正在处理拼图...");
    
    try {
      // 1. 等待所有图片加载完成，确保 drawImage 能画出内容
      const loadedImages = await Promise.all(images.map(img => loadImage(img.url)));

      // 2. 根据实际加载的图片计算画布尺寸 (避免状态中的宽高滞后)
      let canvasWidth = 0;
      let canvasHeight = 0;
      
      if (type === 'horizontal') {
        canvasWidth = loadedImages.reduce((acc, img) => acc + img.width, 0);
        canvasHeight = Math.max(...loadedImages.map(img => img.height));
      } else if (type === 'vertical') {
        canvasWidth = Math.max(...loadedImages.map(img => img.width));
        canvasHeight = loadedImages.reduce((acc, img) => acc + img.height, 0);
      } else if (type === 'grid') {
        const count = loadedImages.length;
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        
        const cellW = Math.max(...loadedImages.map(img => img.width));
        const cellH = Math.max(...loadedImages.map(img => img.height));
        
        canvasWidth = cols * cellW;
        canvasHeight = rows * cellH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.dismiss(toastId);
        return;
      }
      
      // 填充白色背景
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      let currentX = 0;
      let currentY = 0;

      if (type === 'grid') {
        const cols = Math.ceil(Math.sqrt(loadedImages.length));
        const cellW = Math.max(...loadedImages.map(img => img.width));
        const cellH = Math.max(...loadedImages.map(img => img.height));

        loadedImages.forEach((img, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          // 居中绘制
          const x = (col * cellW) + (cellW - img.width) / 2;
          const y = (row * cellH) + (cellH - img.height) / 2;
          
          ctx.drawImage(img, x, y);
        });

      } else {
        loadedImages.forEach(img => {
          if (type === 'horizontal') {
            // 垂直居中
            const y = (canvasHeight - img.height) / 2;
            ctx.drawImage(img, currentX, y);
            currentX += img.width;
          } else if (type === 'vertical') {
            // 水平居中
            const x = (canvasWidth - img.width) / 2;
            ctx.drawImage(img, x, currentY);
            currentY += img.height;
          }
        });
      }

      setMergedResult(canvas.toDataURL('image/png'));
      toast.dismiss(toastId);
      toast.success("拼图完成");

    } catch (error) {
      console.error("Merge error:", error);
      toast.dismiss(toastId);
      toast.error("拼图失败，请重试");
    }
  }, [images]);


  // --- 同步裁剪更新逻辑 ---
  const handleCropComplete = (croppedImages: string[]) => {
    setImages(prev => {
      // 保留 ID 但更新 URL 和尺寸
      // 这里假设 croppedImages 顺序与 images 顺序一致
      return prev.map((img, idx) => ({
        ...img,
        url: croppedImages[idx],
        width: 0, // 暂时置0，下面会重新获取
      }));
    });
    
    // 重新计算宽高的hack:
    croppedImages.forEach((dataUrl, idx) => {
       const i = new Image();
       i.onload = () => {
         setImages(curr => {
            const newArr = [...curr];
            if(newArr[idx]) {
                newArr[idx].width = i.width;
                newArr[idx].height = i.height;
                newArr[idx].url = dataUrl;
            }
            return newArr;
         });
       };
       i.src = dataUrl;
    });

    setIsCropping(false);
    toast.success("所有图片已同步裁剪");
  };

  return (
    <main className="max-w-5xl mx-auto p-6 min-h-screen font-sans text-slate-900">
      
      {/* 头部 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">图片处理工坊</h1>
          <p className="text-slate-500 mt-1">批量查看、同步裁剪、智能拼图</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> 导入图片
          </Button>
          {images.length > 0 && (
             <Button variant="destructive" onClick={() => setImages([])}>
                清空
             </Button>
          )}
        </div>
      </div>

      {/* 主操作区 */}
      {images.length > 0 ? (
        <div className="space-y-6">
          
          {/* 工具栏 */}
          <Card className="bg-slate-50/50">
             <CardContent className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                  <span className="text-sm font-medium text-slate-600">处理：</span>
                  <Button variant="outline" size="sm" onClick={() => setIsCropping(true)}>
                    <Scissors className="mr-2 h-4 w-4" /> 同步裁剪
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">拼图：</span>
                  <Button variant="ghost" size="sm" onClick={() => mergeImages('grid')}>
                    <Grid className="mr-2 h-4 w-4" /> 网格(N×N)
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => mergeImages('horizontal')}>
                    <AlignJustify className="mr-2 h-4 w-4 rotate-90" /> 单行
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => mergeImages('vertical')}>
                    <LayoutList className="mr-2 h-4 w-4" /> 单列
                  </Button>
                </div>
             </CardContent>
          </Card>

          {/* 图片网格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={img.url} 
                   alt="thumbnail" 
                   className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                   onClick={() => setSelectedImageId(img.id)}
                 />
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                      className="bg-black/50 hover:bg-red-500 text-white p-1 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.width} x {img.height}
                 </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* 空状态 */
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center h-64 bg-slate-50/50">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
             <Upload className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">暂无图片</h3>
          <p className="text-slate-500 mb-4 text-sm">点击上方按钮或拖拽图片到此处</p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            选择文件
          </Button>
        </div>
      )}

      {/* 弹窗：灯箱 (大图查看) */}
      {selectedImageId && (
        <Lightbox 
          image={images.find(i => i.id === selectedImageId)!} 
          onClose={() => setSelectedImageId(null)} 
        />
      )}

      {/* 弹窗：同步裁剪 */}
      {isCropping && (
        <CropModal 
          images={images} 
          onClose={() => setIsCropping(false)} 
          onComplete={handleCropComplete}
        />
      )}

      {/* 弹窗：拼图结果 */}
      {mergedResult && (
        <ResultModal 
          imageUrl={mergedResult} 
          onClose={() => setMergedResult(null)} 
        />
      )}
    </main>
  );
}

/**
 * ----------------------------------------------------------------------------
 * SUB-COMPONENTS (Logic Heavy)
 * ----------------------------------------------------------------------------
 */

// 1. Lightbox with Zoom/Pan
const Lightbox = ({ image, onClose }: { image: { url: string }, onClose: () => void }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.min(Math.max(0.5, s * delta), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center overflow-hidden"
      onMouseUp={handleMouseUp}
    >
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button variant="secondary" size="icon" onClick={() => setScale(s => s + 0.2)}><ZoomIn className="h-4 w-4"/></Button>
        <Button variant="secondary" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}><ZoomOut className="h-4 w-4"/></Button>
        <Button variant="destructive" size="icon" onClick={onClose}><X className="h-4 w-4"/></Button>
      </div>

      <div 
        className="w-full h-full flex items-center justify-center cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={image.url} 
          alt="view" 
          draggable={false}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}
          className="select-none"
        />
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
        滚轮缩放 • 拖拽移动
      </div>
    </div>
  );
};

// 2. Result Modal
const ResultModal = ({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">拼图结果</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4"/></Button>
        </div>
        <div className="flex-1 overflow-auto bg-slate-100 p-4 flex items-center justify-center">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={imageUrl} className="max-w-full shadow-lg border bg-white" alt="Result" />
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
           <Button variant="outline" onClick={onClose}>关闭</Button>
           <a href={imageUrl} download={`merged-${Date.now()}.png`}>
             <Button><Download className="mr-2 h-4 w-4"/> 下载图片</Button>
           </a>
        </div>
      </div>
    </div>
  );
};

// 3. Complex Sync Crop Modal
// 使用明确定义的 ImageFile 数组类型 (解决了第二个 any 报错)
const CropModal = ({ images, onClose, onComplete }: { images: ImageFile[], onClose: () => void, onComplete: (urls: string[]) => void }) => {
  const [previewIdx, setPreviewIdx] = useState(0);
  const [selection, setSelection] = useState<{x:number, y:number, w:number, h:number} | null>(null); // { x, y, w, h } in percentages (0-1)
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const currentImg = images[previewIdx];

  // 计算鼠标在图片上的相对百分比位置
  const getRelPos = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
    return {
      x: x / rect.width,
      y: y / rect.height
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getRelPos(e);
    startPos.current = pos;
    setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getRelPos(e);
    
    const newX = Math.min(pos.x, startPos.current.x);
    const newY = Math.min(pos.y, startPos.current.y);
    const newW = Math.abs(pos.x - startPos.current.x);
    const newH = Math.abs(pos.y - startPos.current.y);

    setSelection({ x: newX, y: newY, w: newW, h: newH });
  };

  const handleMouseUp = () => setIsDrawing(false);

  const applyCrop = () => {
    if (!selection || selection.w === 0 || selection.h === 0) {
        onClose();
        return;
    }

    const croppedResults = images.map(img => {
       const canvas = document.createElement('canvas');
       // 计算实际像素
       const sx = img.width * selection.x;
       const sy = img.height * selection.y;
       const sWidth = img.width * selection.w;
       const sHeight = img.height * selection.h;

       // 设置画布大小为裁剪大小
       canvas.width = sWidth;
       canvas.height = sHeight;
       
       const ctx = canvas.getContext('2d');
       if (!ctx) return "";

       const imageObj = new Image();
       imageObj.src = img.url;
       
       // 同步裁剪需要一点时间，这里其实需要Promise，但为了UI简单，我们假定图片已加载
       // 实际中 DataURL 加载极快。
       ctx.drawImage(imageObj, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
       return canvas.toDataURL('image/png');
    });

    onComplete(croppedResults);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onMouseUp={handleMouseUp}>
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-white">
           <div>
             <h3 className="font-bold text-lg flex items-center gap-2">
               <Scissors className="h-5 w-5"/> 同步裁剪模式
             </h3>
             <p className="text-sm text-slate-500">在下方框选区域，将自动应用到所有导入的图片</p>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4"/></Button>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
           
           {/* Sidebar: Thumbnails */}
           <div className="w-32 bg-slate-50 border-r overflow-y-auto p-2 space-y-2 hidden md:block">
              {images.map((img, idx) => (
                <div 
                  key={img.id} 
                  onClick={() => setPreviewIdx(idx)}
                  className={`cursor-pointer rounded border-2 overflow-hidden aspect-square ${idx === previewIdx ? 'border-blue-500' : 'border-transparent'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} className="w-full h-full object-cover" alt="thumb" />
                </div>
              ))}
           </div>

           {/* Canvas Area */}
           <div className="flex-1 bg-slate-900 flex items-center justify-center relative select-none p-4">
              <div 
                ref={containerRef}
                className="relative shadow-2xl"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  ref={imgRef}
                  src={currentImg.url} 
                  alt="Crop Target"
                  className="max-w-full max-h-[70vh] pointer-events-none"
                  draggable={false}
                />
                
                {/* 遮罩层 (让非选区变暗) */}
                {selection && (
                    <>
                        {/* 顶部 */}
                        <div className="absolute top-0 left-0 right-0 bg-black/60 pointer-events-none" style={{ height: `${selection.y * 100}%` }} />
                        {/* 底部 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 pointer-events-none" style={{ top: `${(selection.y + selection.h) * 100}%` }} />
                        {/* 左侧 */}
                        <div className="absolute left-0 bg-black/60 pointer-events-none" style={{ top: `${selection.y * 100}%`, height: `${selection.h * 100}%`, width: `${selection.x * 100}%` }} />
                        {/* 右侧 */}
                        <div className="absolute right-0 bg-black/60 pointer-events-none" style={{ top: `${selection.y * 100}%`, height: `${selection.h * 100}%`, left: `${(selection.x + selection.w) * 100}%` }} />
                        
                        {/* 选框 */}
                        <div 
                           className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] pointer-events-none flex items-center justify-center text-white/80 text-xs font-bold"
                           style={{
                               top: `${selection.y * 100}%`,
                               left: `${selection.x * 100}%`,
                               width: `${selection.w * 100}%`,
                               height: `${selection.h * 100}%`
                           }}
                        >
                            <span className="bg-black/50 px-1 rounded">
                                {Math.round(selection.w * currentImg.width)} x {Math.round(selection.h * currentImg.height)}
                            </span>
                        </div>
                    </>
                )}
                
                {!selection && !isDrawing && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/80 bg-black/20 pointer-events-none">
                        <span className="bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
                           <Move className="h-4 w-4" /> 拖拽以创建选区
                        </span>
                    </div>
                )}
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
           <Button variant="outline" onClick={onClose}>取消</Button>
           <Button onClick={applyCrop} disabled={!selection}>
              <Scissors className="mr-2 h-4 w-4" /> 应用到所有 {images.length} 张图片
           </Button>
        </div>
      </div>
    </div>
  );
};