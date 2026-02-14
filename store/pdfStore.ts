import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface PdfPage {
    id: string; // Unique ID for draggable
    fileId: string; // ID of the source file
    pageIndex: number; // Page number in the original file (0-based)
    imageSrc: string; // Data URL of the rendered page image
    originalFile: File; // Source file object
    width: number;
    height: number;
    rotation: number; // 0, 90, 180, 270
}

interface PdfStore {
    pages: PdfPage[];
    selectedPageIds: Set<string>;
    isDragging: boolean;

    // Actions
    addPages: (newPages: PdfPage[]) => void;
    removePage: (id: string) => void;
    removeSelectedPages: () => void;
    reorderPages: (activeId: string, overId: string) => void;
    setPages: (pages: PdfPage[]) => void;

    // Selection
    toggleSelection: (id: string, multiSelect: boolean) => void;
    selectAll: () => void;
    deselectAll: () => void;

    // UI State
    setIsDragging: (isDragging: boolean) => void;
    rotatePage: (id: string) => void;
    rotateSelectedPages: () => void;
    clearAll: () => void;
}

export const usePdfStore = create<PdfStore>((set) => ({
    pages: [],
    selectedPageIds: new Set(),
    isDragging: false,

    addPages: (newPages) => set((state) => ({ pages: [...state.pages, ...newPages] })),

    removePage: (id) => set((state) => {
        const newSelected = new Set(state.selectedPageIds);
        newSelected.delete(id);
        return {
            pages: state.pages.filter(p => p.id !== id),
            selectedPageIds: newSelected
        };
    }),

    removeSelectedPages: () => set((state) => ({
        pages: state.pages.filter(p => !state.selectedPageIds.has(p.id)),
        selectedPageIds: new Set()
    })),

    reorderPages: (activeId, overId) => set((state) => {
        const oldIndex = state.pages.findIndex(p => p.id === activeId);
        const newIndex = state.pages.findIndex(p => p.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return state;

        const newPages = [...state.pages];
        const [movedPage] = newPages.splice(oldIndex, 1);
        newPages.splice(newIndex, 0, movedPage);

        return { pages: newPages };
    }),

    setPages: (pages) => set({ pages }),

    toggleSelection: (id, multiSelect) => set((state) => {
        const newSelected = new Set(multiSelect ? state.selectedPageIds : []);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        return { selectedPageIds: newSelected };
    }),

    selectAll: () => set((state) => ({
        selectedPageIds: new Set(state.pages.map(p => p.id))
    })),

    deselectAll: () => set({ selectedPageIds: new Set() }),

    setIsDragging: (isDragging) => set({ isDragging }),

    rotatePage: (id) => set((state) => ({
        pages: state.pages.map(p =>
            p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
        )
    })),

    rotateSelectedPages: () => set((state) => ({
        pages: state.pages.map(p =>
            state.selectedPageIds.has(p.id) ? { ...p, rotation: (p.rotation + 90) % 360 } : p
        )
    })),

    clearAll: () => set({ pages: [], selectedPageIds: new Set() }),
}));
