import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Folder {
    id: string;
    name: string;
    createdAt: number;
}

export interface Note {
    id: string;
    folderId: string;
    title: string;
    content: string; // HTML content from Tiptap
    preview: string; // Text-only preview
    updatedAt: number;
    createdAt: number;
}

interface NoteState {
    folders: Folder[];
    notes: Note[];
    activeFolderId: string | null;
    activeNoteId: string | null;
    expandedFolderIds: string[];

    // Actions
    addFolder: (name: string) => void;
    deleteFolder: (id: string) => void;
    renameFolder: (id: string, name: string) => void;
    setActiveFolder: (id: string | null) => void;
    toggleFolder: (id: string) => void;

    addNote: (folderId: string) => string; // Returns new note ID
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    setActiveNote: (id: string | null) => void;
    reorderFolders: (folders: Folder[]) => void;
    reorderNotes: (notes: Note[]) => void;
}

export const useNoteStore = create<NoteState>()(
    persist(
        (set, get) => ({
            folders: [
                { id: 'default', name: '나의 메모', createdAt: Date.now() }
            ],
            notes: [
                {
                    id: 'welcome-note',
                    folderId: 'default',
                    title: '사용자 가이드',
                    content: '<p>아카데미 도구의 메모장에 오신 것을 환영합니다!</p><p>자유롭게 메모를 작성하고 폴더로 관리해보세요.</p>',
                    preview: '아카데미 도구의 메모장에 오신 것을 환영합니다!',
                    updatedAt: Date.now(),
                    createdAt: Date.now(),
                }
            ],
            activeFolderId: 'default',
            activeNoteId: null,
            expandedFolderIds: ['default'],

            addFolder: (name) => set((state) => {
                const newId = uuidv4();
                return {
                    folders: [...state.folders, { id: newId, name, createdAt: Date.now() }],
                    activeFolderId: state.folders.length === 0 ? newId : state.activeFolderId,
                    expandedFolderIds: [...state.expandedFolderIds, newId] // Auto-expand new folder
                };
            }),

            toggleFolder: (id) => set((state) => ({
                expandedFolderIds: state.expandedFolderIds.includes(id)
                    ? state.expandedFolderIds.filter(fid => fid !== id)
                    : [...state.expandedFolderIds, id]
            })),

            deleteFolder: (id) => set((state) => {
                if (id === 'default') return state; // Prevent deleting default folder
                const newFolders = state.folders.filter((f) => f.id !== id);
                return {
                    folders: newFolders,
                    // Delete notes in this folder? Or move to default? 
                    // For now, let's delete them to keep it simple, or we could implement a "Trash" later.
                    notes: state.notes.filter((n) => n.folderId !== id),
                    activeFolderId: state.activeFolderId === id ? 'default' : state.activeFolderId
                };
            }),

            renameFolder: (id, name) => set((state) => ({
                folders: state.folders.map((f) => f.id === id ? { ...f, name } : f)
            })),

            setActiveFolder: (id) => set({ activeFolderId: id }),

            addNote: (folderId) => {
                const id = uuidv4();
                const now = Date.now();
                set((state) => ({
                    notes: [
                        {
                            id,
                            folderId,
                            title: '',
                            content: '',
                            preview: '새로운 메모',
                            createdAt: now,
                            updatedAt: now,
                        },
                        ...state.notes,
                    ],
                    activeNoteId: id,
                }));
                return id;
            },

            updateNote: (id, updates) => set((state) => ({
                notes: state.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)
            })),

            deleteNote: (id) => set((state) => ({
                notes: state.notes.filter((n) => n.id !== id),
                activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
            })),

            setActiveNote: (id) => set({ activeNoteId: id }),

            reorderFolders: (newFolders) => set({ folders: newFolders }),
            reorderNotes: (newNotes) => set({ notes: newNotes }),
        }),
        {
            name: 'academy-notepad-storage',
        }
    )
);
