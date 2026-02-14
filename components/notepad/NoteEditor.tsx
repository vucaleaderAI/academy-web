import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize } from './Extensions/FontSize';
import { LineHeight } from './Extensions/LineHeight';
import { ResizableImage } from './Extensions/ResizableImage';
import {
    Bold, Italic, Strikethrough, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, FileText, Image as ImageIconLucide,
    Minus, Palette, Download, ChevronDown, Highlighter, Check
} from 'lucide-react';
import { useNoteStore } from '@/store/noteStore';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { exportToHtml, exportToPdf, exportToTxt, exportToWord, exportToExcel } from '@/utils/noteExporter';

const TEXT_COLORS = [
    { name: '검정', value: '#000000' },
    { name: '빨강', value: '#EF4444' },
    { name: '파랑', value: '#3B82F6' },
    { name: '녹색', value: '#22C55E' },
    { name: '노랑', value: '#EAB308' },
];

const HIGHLIGHT_COLORS = [
    { name: '없음', value: 'transparent' },
    { name: '노랑', value: '#faf594' },
    { name: '초록', value: '#bbf7d0' },
    { name: '파랑', value: '#bfdbfe' },
    { name: '분홍', value: '#fbcfe8' },
];

export default function NoteEditor() {
    const { activeNoteId, notes, updateNote } = useNoteStore();
    const activeNote = notes.find((n) => n.id === activeNoteId);

    // Local state for title
    const [title, setTitle] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [colorPickerOpen, setColorPickerOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // User requested to remove heading function
            }),
            Placeholder.configure({
                placeholder: '내용을 입력하세요...',
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            ResizableImage,
            TextAlign.configure({
                types: ['heading', 'paragraph'], // Keep heading here just in case, but ui is removed
            }),
            FontSize,
            LineHeight,
        ],
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-none min-h-[500px]',
            },
        },
        onUpdate: ({ editor }) => {
            if (activeNoteId) {
                const html = editor.getHTML();
                const text = editor.getText();
                updateNote(activeNoteId, { content: html, preview: text });
            }
        },
    });

    // Sync editor content
    useEffect(() => {
        if (activeNote && editor) {
            // Only update if content is different to avoid cursor jumping
            if (activeNote.content !== editor.getHTML()) {
                editor.commands.setContent(activeNote.content);
            }
            setTitle(activeNote.title);
        }
    }, [activeNoteId, editor]);

    // Update title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (activeNoteId) {
            updateNote(activeNoteId, { title: newTitle });
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editor) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                editor.chain().focus().setImage({ src }).run();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExport = (format: 'txt' | 'html' | 'pdf' | 'doc' | 'xlsx') => {
        if (!activeNote) return;
        setIsExportOpen(false);
        switch (format) {
            case 'txt': exportToTxt(activeNote); break;
            case 'html': exportToHtml(activeNote); break;
            case 'pdf': exportToPdf(activeNote); break;
            case 'doc': exportToWord(activeNote); break;
            case 'xlsx': exportToExcel(activeNote); break;
        }
    };

    if (!activeNote) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white text-slate-300">
                <div className="text-center">
                    <p className="text-lg font-medium">메모를 선택하거나 새로 만드세요</p>
                </div>
            </div>
        );
    }

    if (!editor) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
            {/* Title Input */}
            <div className="px-8 pt-8 pb-4 flex items-center gap-4">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            editor.commands.focus();
                        }
                    }}
                    placeholder="제목을 입력하세요"
                    className="flex-1 text-3xl font-bold placeholder:text-slate-300 focus:outline-none bg-transparent"
                />

                {/* Export Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsExportOpen(!isExportOpen)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                        <Download className="w-4 h-4" />
                        내보내기
                        <ChevronDown className="w-3 h-3 ml-1" />
                    </button>

                    {isExportOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="py-1">
                                    <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> 텍스트 (.txt)
                                    </button>
                                    <button onClick={() => handleExport('doc')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Word (.doc)
                                    </button>
                                    <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Excel (.xlsx)
                                    </button>
                                    <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> PDF (.pdf)
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 px-8 border-y border-slate-100 bg-white sticky top-0 z-10">

                {/* Font Size (px) */}
                <div className="relative group flex items-center">
                    <input
                        type="number"
                        className="w-14 h-8 border border-slate-200 rounded px-2 text-xs focus:outline-none text-slate-600 focus:border-indigo-300 transition-colors"
                        placeholder="16"
                        defaultValue="16"
                        onChange={(e) => {
                            editor.chain().focus().setFontSize(e.target.value + 'px').run();
                        }}
                    />
                    <span className="text-xs text-slate-400 ml-1 mr-2">px</span>
                </div>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <button onClick={() => editor.chain().focus().toggleBold().run()} className={cn("p-1.5 rounded hover:bg-white transition-colors", editor.isActive('bold') ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-600')}>
                    <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("p-1.5 rounded hover:bg-white transition-colors", editor.isActive('italic') ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-600')}>
                    <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={cn("p-1.5 rounded hover:bg-white transition-colors", editor.isActive('strike') ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-600')}>
                    <Strikethrough className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                {/* Alignment */}
                <div className="flex bg-slate-50 rounded p-0.5 gap-0.5">
                    <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={cn("p-1.5 rounded hover:bg-white transition-colors", editor.isActive({ textAlign: 'left' }) ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600')}>
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={cn("p-1.5 rounded hover:bg-white transition-colors", editor.isActive({ textAlign: 'center' }) ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600')}>
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={cn("p-1.5 rounded hover:bg-white transition-colors", editor.isActive({ textAlign: 'right' }) ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600')}>
                        <AlignRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Line Height */}
                <select
                    className="h-8 border border-slate-200 rounded px-2 text-xs focus:outline-none text-slate-600 w-24 focus:border-indigo-300 ml-2"
                    onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
                    defaultValue="1.5"
                >
                    <option value="1.0">줄간격 1.0</option>
                    <option value="1.2">줄간격 1.2</option>
                    <option value="1.5">줄간격 1.5</option>
                    <option value="2.0">줄간격 2.0</option>
                    <option value="2.5">줄간격 2.5</option>
                    <option value="3.0">줄간격 3.0</option>
                </select>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                {/* Color Picker */}
                {/* Advanced Color Picker */}
                <div className="relative">
                    <button
                        className={cn(
                            "flex items-center gap-1 p-1.5 rounded hover:bg-white transition-colors",
                            colorPickerOpen ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-600"
                        )}
                        onClick={() => setColorPickerOpen(!colorPickerOpen)}
                        title="글자색 및 배경색"
                    >
                        <Palette className="w-4 h-4" />
                        <div
                            className="w-3 h-3 rounded-full border border-slate-200"
                            style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
                        />
                    </button>

                    {colorPickerOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setColorPickerOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-slate-200 z-20 w-64 animate-in fade-in zoom-in-95 duration-200">

                                {/* Text Color Section */}
                                <div className="mb-3">
                                    <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                                        <Palette className="w-3 h-3" /> 글자색
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {TEXT_COLORS.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => {
                                                    editor.chain().focus().setColor(color.value).run();
                                                    setColorPickerOpen(false);
                                                }}
                                                className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform relative group"
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            >
                                                {editor.isActive('textStyle', { color: color.value }) && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white invert mix-blend-difference" />
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                        {/* Custom Color Input */}
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:scale-110 transition-transform group" title="사용자 지정">
                                            <input
                                                type="color"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                onChange={(e) => {
                                                    editor.chain().focus().setColor(e.target.value).run();
                                                    setColorPickerOpen(false);
                                                }}
                                            />
                                            <div className="w-full h-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-2" />

                                {/* Highlight Section */}
                                <div>
                                    <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                                        <Highlighter className="w-3 h-3" /> 배경 강조
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {HIGHLIGHT_COLORS.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => {
                                                    if (color.value === 'transparent') {
                                                        editor.chain().focus().unsetHighlight().run();
                                                    } else {
                                                        editor.chain().focus().toggleHighlight({ color: color.value }).run();
                                                    }
                                                    setColorPickerOpen(false);
                                                }}
                                                className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform relative"
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            >
                                                {color.value === 'transparent' && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">/</span>
                                                )}
                                                {editor.isActive('highlight', { color: color.value }) && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-slate-600" />
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </>
                    )}
                </div>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("p-1.5 rounded hover:bg-white transition-colors", editor.isActive('bulletList') ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-600')}>
                    <List className="w-4 h-4" />
                </button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn("p-1.5 rounded hover:bg-white transition-colors", editor.isActive('orderedList') ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-600')}>
                    <ListOrdered className="w-4 h-4" />
                </button>

                <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="p-1.5 rounded hover:bg-white transition-colors text-slate-600">
                    <Minus className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                {/* Media */}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded hover:bg-white text-slate-600 hover:text-indigo-600 transition-colors"
                    title="이미지 삽입"
                >
                    <ImageIconLucide className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Content */}
            <div
                className="flex-1 overflow-y-auto animate-in fade-in duration-500 slide-in-from-bottom-2 cursor-text"
                onClick={() => editor.commands.focus()}
            >
                <EditorContent editor={editor} className="h-full min-h-[500px] [&_.tiptap]:h-full [&_.tiptap]:p-8 [&_.tiptap:focus]:outline-none" />
            </div>

            {/* Last Saved Status */}
            <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 text-right flex justify-between items-center bg-slate-50">
                <span className="flex items-center gap-2">
                    {editor.storage.characterCount && (
                        <>
                            {editor.storage.characterCount.words()} words
                        </>
                    )}
                </span>
                <span>마지막 저장: {activeNote.updatedAt ? new Date(activeNote.updatedAt).toLocaleTimeString() : '방금'}</span>
            </div>
        </div>
    );
}
