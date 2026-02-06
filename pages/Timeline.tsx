import React, { useState, useRef, useMemo } from 'react';
import { Heart, Plus, Image as ImageIcon, X, Edit2, Trash2, Upload, Loader, Sparkles, AlertCircle, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { useApp, calculateDaysTogether } from '../context';
import { Modal } from '../components/Modal';
import { validateFiles, compressImage, fileToBase64 } from '../utils/imageUpload';
import { analyzeImage, hasAPIKey, mockAnalyzeImage } from '../utils/aiService';
import { getDateValidationError, getMinDate, getMaxDate } from '../utils/dateValidation';

export const TimelinePage: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory, togetherDate } = useApp();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const daysTogether = calculateDaysTogether(togetherDate);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  // Batch upload state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  // Random rotation for polaroid effect, consistent per render until memory list changes
  // Ideally this should be stored in memory object, but for now we memoize based on index/id
  // We'll generate a deterministic rotation based on ID string char code sum
  const getRotation = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const deg = (sum % 7) - 3; // -3 to +3 degrees
    return `rotate-[${deg}deg]`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // If multiple files selected, switch to batch upload mode
    if (files.length > 1) {
      const validation = validateFiles(files, 100, 5);
      if (!validation.valid) {
        setUploadError(validation.errors.join(', '));
        e.target.value = '';
        return;
      }
      setBatchFiles(Array.from(files));
      setIsUploadOpen(false);
      setIsBatchUploadOpen(true);
      e.target.value = '';
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const file = files[0];
      const validation = validateFiles([file], 1, 5);

      if (!validation.valid) {
        setUploadError(validation.errors.join(', '));
        setIsUploading(false);
        return;
      }

      // Compress image
      const compressed = await compressImage(file, 5);
      const base64 = await fileToBase64(compressed);
      setImageUrl(base64);

      // Try AI analysis if API key is available
      if (hasAPIKey()) {
        setIsAnalyzing(true);
        try {
          const analysis = await analyzeImage(base64);
          if (analysis.description) setTitle(analysis.description);
          if (analysis.date) setDate(analysis.date);
          if (analysis.location) setTitle(prev => prev ? `${prev} - ${analysis.location}` : analysis.location);
        } catch (error) {
          console.error('AI analysis failed:', error);
          // Continue without AI analysis
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        // Use mock analysis for demo
        setIsAnalyzing(true);
        const mockAnalysis = await mockAnalyzeImage();
        if (mockAnalysis.description) setTitle(mockAnalysis.description);
        if (mockAnalysis.date) setDate(mockAnalysis.date);
        setIsAnalyzing(false);
      }
    } catch (error) {
      setUploadError('图片上传失败，请重试');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBatchFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validation = validateFiles(files, 100, 5);
    if (!validation.valid) {
      alert('文件验证失败:\n' + validation.errors.join('\n'));
      setUploadError(validation.errors.join(', '));
      // Reset input to allow re-selecting
      e.target.value = '';
      return;
    }

    setBatchFiles(Array.from(files));
    setIsBatchUploadOpen(true);
    // Reset input to allow re-selecting same files later
    e.target.value = '';
  };

  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) return;

    setIsUploading(true);
    let completed = 0;

    for (const file of batchFiles) {
      try {
        const compressed = await compressImage(file, 5);
        const base64 = await fileToBase64(compressed);

        let memoryTitle = file.name.replace(/\.[^/.]+$/, '');
        let memoryDate = new Date().toISOString().split('T')[0];

        // Optional AI analysis
        if (hasAPIKey()) {
          try {
            const analysis = await analyzeImage(base64);
            if (analysis.description) memoryTitle = analysis.description;
            if (analysis.date) memoryDate = analysis.date;
          } catch (error) {
            console.error('AI analysis failed for', file.name);
          }
        }

        addMemory({
          title: memoryTitle,
          date: memoryDate,
          image: base64
        });

        completed++;
        setBatchProgress(Math.round((completed / batchFiles.length) * 100));
      } catch (error) {
        console.error('Failed to upload', file.name, error);
      }
    }

    setIsUploading(false);
    setIsBatchUploadOpen(false);
    setBatchFiles([]);
    setBatchProgress(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date before submit
    const dateValidationError = getDateValidationError(date);
    if (dateValidationError) {
      setDateError(dateValidationError);
      return;
    }

    if (title && date && imageUrl) {
      if (editingMemory) {
        updateMemory(editingMemory, { title, date, image: imageUrl });
        setEditingMemory(null);
      } else {
        addMemory({ title, date, image: imageUrl });
      }
      setIsUploadOpen(false);
      resetForm();
    }
  };

  const startEdit = (memoryId: string) => {
    const memory = memories.find(m => m.id === memoryId);
    if (memory) {
      setTitle(memory.title);
      setDate(memory.date);
      setImageUrl(memory.image);
      setEditingMemory(memoryId);
      setIsUploadOpen(true);
    }
  };

  const handleDelete = (memoryId: string) => {
    if (confirm('确定要删除这条回忆吗？')) {
      deleteMemory(memoryId);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setImageUrl('');
    setUploadError('');
    setEditingMemory(null);
    setDateError(null);
  };

  // Validate date on change
  const handleDateChange = (value: string) => {
    setDate(value);
    const error = getDateValidationError(value);
    setDateError(error);
  };



  // Sort memories by date
  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [memories]);

  // Extract years for timeline nodes
  const timelineNodes = useMemo(() => {
    const years = new Set(memories.map(m => m.date.split('-')[0]));
    return Array.from(years).sort().reverse();
  }, [memories]);

  return (
    <div className="flex flex-col h-full bg-paper-texture">
      <header className="relative w-full pt-safe-top z-40 shrink-0">
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-black/5 dark:border-white/5"></div>
        <div className="relative flex items-center justify-between pt-4 pb-3 px-4">
          <button
            onClick={() => batchInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-sage/10 text-sage hover:bg-sage hover:text-white transition-all active:scale-90"
            title="批量上传"
          >
            <Upload className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-1">
            <h1 className="text-text-main dark:text-white text-lg font-bold leading-tight font-display">
              时光剪贴簿
            </h1>
            <div className="flex items-center gap-x-1.5 rounded-full bg-white/50 dark:bg-white/10 px-3 py-0.5">
              <Heart className="w-3 h-3 text-red-400 fill-current" />
              <p className="text-text-main dark:text-white text-[10px] font-semibold uppercase tracking-wide">Story of Us</p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsUploadOpen(true);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-90"
            title="添加回忆"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area with Timeline Rail */}
      <div className="flex-1 overflow-y-auto relative hide-scrollbar">
        {/* Vertical Timeline Rail */}
        <div className="absolute top-8 left-[18px] bottom-8 w-[2px] bg-primary/20 z-0"></div>

        <div className="flex min-h-full">
          {/* Timeline Nodes Column */}
          <div className="w-12 shrink-0 flex flex-col items-center pt-8 gap-32 z-10 pointer-events-none">
            {/* Dynamic milestone markers could go here. For now, simple dots or icons */}
            {sortedMemories.length > 0 && timelineNodes.map(year => (
              <div key={year} className="sticky top-24 bg-paper-texture p-1 rounded-full border border-primary/20 shadow-sm animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-primary font-handwriting transform -rotate-12">
                  {year}
                </div>
              </div>
            ))}
          </div>

          {/* Masonry Content */}
          <div className="flex-1 px-3 pt-6 pb-32">
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-32 h-32 bg-white p-2 shadow-lg rotate-3 mb-6 transform transition-transform hover:rotate-0">
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                </div>
                <h3 className="text-text-main dark:text-white text-lg font-bold mb-2 font-handwriting">开启我们的剪贴簿</h3>
                <p className="text-sage text-sm text-center mb-6 max-w-xs">
                  每一张照片都是一张拍立得，记录下我们爱的瞬间。
                </p>
              </div>
            ) : (
              <div className="timeline-masonry space-y-4">
                {sortedMemories.map((memory, index) => {
                  const rotation = getRotation(memory.id); // Deterministic rotation
                  return (
                    <div
                      key={memory.id}
                      className="break-inside-avoid relative group mb-6 px-1"
                    >
                      {/* Polaroid Card */}
                      <div
                        className={`polaroid-card bg-white dark:bg-[#2a2a2a] transform transition-all duration-500 hover:rotate-0 hover:z-20 cursor-pointer`}
                        style={{ transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})` }}
                        onClick={() => setSelectedImage(memory.image)}
                      >
                        {/* Tape or Sticker Decoration (Randomized essentially by index) */}
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-100/80 dark:bg-yellow-900/40 rotate-1 shadow-sm opacity-80 backdrop-blur-sm z-20 ${index % 3 === 0 ? 'block' : 'hidden'}`}></div>

                        <div className="w-full aspect-auto overflow-hidden bg-gray-100 dark:bg-gray-800 relative mb-3 border border-gray-100 dark:border-gray-700">
                          <img
                            src={memory.image}
                            alt={memory.title}
                            className="w-full h-auto object-cover block"
                            loading="lazy"
                          />
                        </div>

                        {/* Handwriting Info */}
                        <div className="text-center px-1">
                          <p className="text-gray-800 dark:text-gray-200 text-sm font-bold font-handwriting leading-tight">{memory.title}</p>
                          <div className="flex items-center justify-center gap-1 mt-1 text-sage dark:text-gray-500">
                            <span className="text-[10px] font-handwriting opacity-80">{memory.date}</span>
                          </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute -bottom-3 right-2 flex gap-1 transform scale-0 group-hover:scale-100 transition-transform origin-bottom-right z-30">
                          <button onClick={(e) => { e.stopPropagation(); startEdit(memory.id); }} className="p-1.5 bg-white shadow-md rounded-full text-primary hover:bg-primary hover:text-white">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(memory.id); }} className="p-1.5 bg-white shadow-md rounded-full text-red-500 hover:bg-red-500 hover:text-white">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Timeline Dot Connector (Visual only) */}
                      <div className="absolute top-8 -left-4 w-2 h-2 rounded-full bg-primary/30 hidden"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal (Reused) */}
      <Modal isOpen={isUploadOpen} onClose={() => {
        setIsUploadOpen(false);
        resetForm();
      }} title={editingMemory ? "编辑回忆" : "贴上一张新照片"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-sage mb-1">照片</label>
            <div className="space-y-2">
              {imageUrl ? (
                <div className="relative p-2 bg-white shadow-sm rotate-1 w-full">
                  <div className="relative rounded-sm overflow-hidden h-48 w-full bg-gray-100 dark:bg-gray-800">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-sage/30 bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center gap-2 text-sage hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="w-8 h-8 animate-spin" />
                        <span className="text-sm">上传中...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-sm font-medium">点击选择照片</span>
                        <span className="text-xs text-sage/60">支持选择多张照片批量上传</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              {uploadError && (
                <p className="text-red-500 text-sm">{uploadError}</p>
              )}
            </div>
          </div>

          {/* AI Analysis Indicator */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">AI 正在阅读照片故事...</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-sage mb-1">标题</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：第一次看电影"
              className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border-none p-3 text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 font-handwriting"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-sage mb-1">日期</label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className={`w-full rounded-xl bg-gray-50 dark:bg-white/5 border-none p-3 text-text-main dark:text-white focus:ring-2 pl-10 ${dateError ? 'focus:ring-red-500/50 ring-2 ring-red-500/50' : 'focus:ring-primary/50'}`}
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
            </div>
            {dateError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {dateError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!imageUrl || isUploading}
            className="w-full mt-2 bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingMemory ? '保存修改' : '贴上回忆'}
          </button>
        </form>
      </Modal>

      {/* Batch Upload Modal */}
      <Modal isOpen={isBatchUploadOpen} onClose={() => {
        setIsBatchUploadOpen(false);
        setBatchFiles([]);
        setBatchProgress(0);
      }} title={`批量粘贴 (${batchFiles.length} 张)`}>
        <div className="flex flex-col gap-4">
          {isUploading ? (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader className="w-12 h-12 animate-spin text-primary" />
              <div className="w-full max-w-xs">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${batchProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-sage mt-2">处理进度: {batchProgress}%</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                {batchFiles.map((file, index) => (
                  <div key={index} className="aspect-square rounded-sm overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-white shadow-sm rotate-1">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm text-sage">
                <p>• 共 {batchFiles.length} 张照片</p>
                <p>• AI 将自动分析每张照片的内容和时间</p>
              </div>
              <button
                onClick={handleBatchUpload}
                className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
              >
                开始粘贴
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Hidden file inputs */}
      <input
        ref={batchInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleBatchFileSelect}
        className="hidden"
      />

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="polaroid-card bg-white p-2 pb-6 rounded-none transform max-w-full max-h-full overflow-hidden animate-scale-up border-8 border-white">
            <img
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};