'use client';

import React from 'react';
import { usePdfStore, PdfPage } from '@/store/pdfStore';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { X, Check, RotateCw } from 'lucide-react';

// Sortable Item Component
function SortablePdfPage({ page, isSelected, onToggleSelect, onRemove, onRotate }: {
    page: PdfPage;
    isSelected: boolean;
    onToggleSelect: () => void;
    onRemove: () => void;
    onRotate: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative group aspect-[1/1.414] bg-white rounded-lg shadow-sm border transition-all overflow-hidden",
                isSelected
                    ? "border-indigo-600 ring-4 ring-indigo-500 ring-offset-2 z-10 scale-[1.02]"
                    : "border-slate-200 hover:border-indigo-300 hover:shadow-md",
                isDragging && "z-50 shadow-xl scale-105 opacity-80"
            )}
        >
            {/* Image Preview */}
            <div
                className="w-full h-full flex items-center justify-center bg-slate-100 cursor-grab active:cursor-grabbing p-2"
                {...attributes}
                {...listeners}
            >
                <img
                    src={page.imageSrc}
                    alt={`Page ${page.pageIndex + 1}`}
                    className="max-w-full max-h-full shadow-md object-contain transition-transform"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                />
            </div>

            {/* Page Number Badge */}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                {page.pageIndex + 1}
            </div>

            {/* Selection Checkbox */}
            <div
                className="absolute top-2 left-2 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect();
                }}
            >
                <div className={cn(
                    "w-5 h-5 rounded border shadow-sm flex items-center justify-center transition-colors",
                    isSelected ? "bg-indigo-500 border-indigo-500" : "bg-white border-slate-300 hover:border-indigo-400"
                )}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
            </div>

            {/* Actions (visible on hover) */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRotate();
                    }}
                    className="p-1.5 bg-white/90 text-slate-600 rounded-full shadow-sm hover:bg-slate-100 hover:text-indigo-600 backdrop-blur-sm"
                    title="회전"
                >
                    <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="p-1.5 bg-white/90 text-slate-600 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 backdrop-blur-sm"
                    title="삭제"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default function PdfPageGrid() {
    const { pages, selectedPageIds, reorderPages, toggleSelection, removePage, rotatePage, setIsDragging } = usePdfStore();
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setIsDragging(true);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            reorderPages(active.id as string, over.id as string);
        }

        setActiveId(null);
        setIsDragging(false);
    };

    if (pages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                <p>업로드된 페이지가 없습니다.</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 pb-20">
                    {pages.map((page) => (
                        <SortablePdfPage
                            key={page.id}
                            page={page}
                            isSelected={selectedPageIds.has(page.id)}
                            onToggleSelect={() => toggleSelection(page.id, true)}
                            onRemove={() => removePage(page.id)}
                            onRotate={() => rotatePage(page.id)}
                        />
                    ))}
                </div>
            </SortableContext>
            <DragOverlay>
                {activeId ? (
                    <div className="w-[200px] h-[280px] opacity-80 cursor-grabbing">
                        <img
                            src={pages.find(p => p.id === activeId)?.imageSrc}
                            alt="Dragging preview"
                            className="w-full h-full object-contain bg-white rounded-lg shadow-xl"
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
