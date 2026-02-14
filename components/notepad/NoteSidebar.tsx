import React, { useState } from 'react';
import { Plus, Folder, FileText, Trash2, FolderOpen, Edit2, X, ChevronRight, ChevronDown, MoreVertical, PenLine, GripVertical } from 'lucide-react';
import { useNoteStore, Folder as FolderType, Note as NoteType } from '@/store/noteStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Folder Item ---
function SortableFolder({
    folder,
    isActive,
    isExpanded,
    isEditing,
    editName,
    onToggle,
    onSelect,
    onStartRename,
    onEditNameChange,
    onRenameSubmit,
    onDelete,
    setEditId,
    children
}: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: folder.id, data: { type: 'folder', folder } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.3 : 1, // Lower opacity when dragging
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("select-none mb-0.5", isDragging && "relative")}>
            <div
                className={cn(
                    "group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors border border-transparent",
                    isActive ? "bg-indigo-50 text-indigo-700 font-medium border-indigo-100" : "text-slate-600 hover:bg-slate-100 hover:border-slate-200"
                )}
                onClick={onSelect}
            >
                {/* Drag Handle - Always visible but subtle, prominent on hover */}
                <div
                    {...attributes}
                    {...listeners}
                    className="p-1 text-slate-300 group-hover:text-slate-600 hover:bg-slate-200 rounded cursor-grab active:cursor-grabbing mr-1 transition-colors"
                    onClick={e => e.stopPropagation()}
                >
                    <GripVertical className="w-3.5 h-3.5" />
                </div>

                <div className="p-0.5 text-slate-400 transition-transform duration-200" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>

                {isEditing ? (
                    <form onSubmit={onRenameSubmit} className="flex-1 ml-1" onClick={e => e.stopPropagation()}>
                        <input
                            autoFocus
                            value={editName}
                            onChange={onEditNameChange}
                            onBlur={() => setEditId(null)}
                            className="w-full px-2 py-0.5 text-sm rounded border border-indigo-300 focus:outline-none"
                        />
                    </form>
                ) : (
                    <span className="flex-1 ml-1 truncate text-sm font-medium" onDoubleClick={(e) => onStartRename(e, folder.id, folder.name)}>
                        {folder.name}
                    </span>
                )}

                {folder.id !== 'default' && (
                    <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={(e) => onStartRename(e, folder.id, folder.name)} className="p-1 hover:bg-white rounded text-slate-400 hover:text-indigo-500">
                            <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => onDelete(e, folder.id)} className="p-1 hover:bg-white rounded text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
            {isExpanded && children}
        </div>
    );
}

// --- Sortable Note Item ---
function SortableNote({ note, isActive, onDelete, onSelect }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: note.id, data: { type: 'note', note } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.3 : 1, // Lower opacity
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={cn(
                "group relative px-3 py-2 rounded-lg cursor-pointer transition-all border border-transparent mb-0.5 pl-8", // added padding left for handle
                isActive
                    ? "bg-white border-indigo-200 shadow-sm"
                    : "hover:bg-white hover:border-slate-200 hover:shadow-sm"
            )}
        >
            {/* Note Drag Handle - Positioned absolutely on the left */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-300 group-hover:text-slate-500 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing transition-colors"
                onClick={e => e.stopPropagation()}
            >
                <GripVertical className="w-3.5 h-3.5" />
            </div>

            <div className="flex justify-between items-start mb-0.5">
                <h4 className={cn("text-xs font-medium truncate flex-1 pr-2", isActive ? "text-slate-900" : "text-slate-700")}>
                    {note.title || "제목 없음"}
                </h4>
                <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                    {formatDistanceToNow(note.updatedAt, { addSuffix: true, locale: ko })}
                </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate h-4 leading-4 opacity-80">
                {note.preview || "내용 없음"}
            </p>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('메모를 삭제하시겠습니까?')) onDelete(note.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 transition-opacity bg-white shadow-sm"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
}

export default function NoteSidebar() {
    const {
        folders,
        notes,
        activeFolderId,
        activeNoteId,
        expandedFolderIds,
        setActiveFolder,
        setActiveNote,
        toggleFolder,
        addFolder,
        renameFolder,
        deleteFolder,
        addNote,
        deleteNote,
        reorderFolders,
        reorderNotes
    } = useNoteStore();

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editFolderName, setEditFolderName] = useState('');
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            addFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
        }
    };

    const startRenaming = (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        setEditingFolderId(id);
        setEditFolderName(name);
    }

    const handleRenameFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFolderId && editFolderName.trim()) {
            renameFolder(editingFolderId, editFolderName.trim());
            setEditingFolderId(null);
        }
    };

    const handleDeleteFolder = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (id === 'default') return;
        if (confirm('폴더를 삭제하시겠습니까? 안의 메모도 모두 삭제됩니다.')) {
            deleteFolder(id);
        }
    };

    const handleCreateNote = () => {
        if (activeFolderId) {
            addNote(activeFolderId);
        } else {
            addNote(folders[0]?.id || 'default');
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over) return;

        if (active.id !== over.id) {
            const activeData = active.data.current as any;
            const overData = over.data.current as any;

            if (activeData?.type === 'folder') {
                const oldIndex = folders.findIndex(f => f.id === active.id);
                const newIndex = folders.findIndex(f => f.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                    reorderFolders(arrayMove(folders, oldIndex, newIndex));
                }
            } else if (activeData?.type === 'note') {
                // Reordering notes logic
                // Ensure we are reordering within the same folder or allow moving to another?
                // For simplicity, let's just handle reordering for now. 
                // Since notes list is global in store, but filtered in UI, we need to be careful.
                // We should find the full list index.
                const oldIndex = notes.findIndex(n => n.id === active.id);
                const newIndex = notes.findIndex(n => n.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                    reorderNotes(arrayMove(notes, oldIndex, newIndex));
                }
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-80">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-slate-50 z-10">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                    보관함
                </h2>
                <button onClick={() => setIsCreatingFolder(true)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title="새 폴더">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Folder Creation */}
            {isCreatingFolder && (
                <div className="px-4 py-2 border-b border-slate-100 animate-in fade-in slide-in-from-top-1">
                    <form onSubmit={handleCreateFolder} className="relative">
                        <input
                            type="text" autoFocus placeholder="폴더 이름 입력..." value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full pl-3 pr-8 py-1.5 text-sm rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button type="button" onClick={() => setIsCreatingFolder(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Tree View with DND */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-y-auto w-full p-2">
                    <SortableContext items={folders.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-1">
                            {folders.map(folder => {
                                const isExpanded = expandedFolderIds.includes(folder.id);
                                const folderNotes = notes.filter(n => n.folderId === folder.id);
                                // Note: we rely on 'notes' order in store for SortableContext items order.

                                return (
                                    <SortableFolder
                                        key={folder.id}
                                        folder={folder}
                                        isActive={activeFolderId === folder.id}
                                        isExpanded={isExpanded}
                                        isEditing={editingFolderId === folder.id}
                                        editName={editFolderName}
                                        onToggle={() => toggleFolder(folder.id)}
                                        onSelect={() => setActiveFolder(folder.id)}
                                        onStartRename={startRenaming}
                                        onEditNameChange={(e: any) => setEditFolderName(e.target.value)}
                                        onRenameSubmit={handleRenameFolder}
                                        onDelete={handleDeleteFolder}
                                        setEditId={setEditingFolderId}
                                    >
                                        <div className="ml-4 pl-2 border-l border-slate-200 mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                                            <SortableContext items={folderNotes.map(n => n.id)} strategy={verticalListSortingStrategy}>
                                                {folderNotes.map((note) => (
                                                    <SortableNote
                                                        key={note.id}
                                                        note={note}
                                                        isActive={activeNoteId === note.id}
                                                        onDelete={deleteNote}
                                                        onSelect={() => setActiveNote(note.id)}
                                                    />
                                                ))}
                                            </SortableContext>
                                            {folderNotes.length === 0 && (
                                                <div className="px-3 py-2 text-xs text-slate-400 italic">비어 있음</div>
                                            )}
                                        </div>
                                    </SortableFolder>
                                );
                            })}
                        </div>
                    </SortableContext>
                </div>
                <DragOverlay>
                    {activeDragId ? (
                        <div className="bg-white/90 backdrop-blur-sm border border-indigo-300 shadow-xl p-3 rounded-lg w-64 flex items-center gap-3">
                            <div className="p-1 bg-indigo-50 rounded text-indigo-500">
                                {folders.find(f => f.id === activeDragId) ? <Folder className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <span className="font-medium text-slate-700 truncate">
                                {folders.find(f => f.id === activeDragId)?.name || notes.find(n => n.id === activeDragId)?.title || "이동 중..."}
                            </span>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Bottom Action */}
            <div className="p-4 border-t border-slate-200 bg-white z-10">
                <button onClick={handleCreateNote} className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:transform active:scale-95">
                    <FileText className="w-4 h-4" />
                    현재 폴더에 메모 추가
                </button>
            </div>
        </div>
    );
}
