import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { useCallback, useEffect, useState, useRef } from 'react';

const ResizableImageComponent = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const [width, setWidth] = useState(node.attrs.width || '100%');
    const [isResizing, setIsResizing] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const resizeStartRef = useRef<{ x: number, w: number } | null>(null);

    useEffect(() => {
        setWidth(node.attrs.width || '100%');
    }, [node.attrs.width]);

    const onMouseDown = (event: React.MouseEvent) => {
        if (!imageRef.current) return;
        event.preventDefault();
        setIsResizing(true);
        resizeStartRef.current = {
            x: event.clientX,
            w: imageRef.current.clientWidth,
        };

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!resizeStartRef.current) return;
            const currentX = moveEvent.clientX;
            const diffX = currentX - resizeStartRef.current.x;
            const newWidth = Math.max(50, resizeStartRef.current.w + diffX);

            // Update local state for smooth resizing
            setWidth(`${newWidth}px`);
        };

        const onMouseUp = (upEvent: MouseEvent) => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setIsResizing(false);

            if (resizeStartRef.current) {
                const currentX = upEvent.clientX;
                const diffX = currentX - resizeStartRef.current.x;
                const newWidth = Math.max(50, resizeStartRef.current.w + diffX);
                updateAttributes({ width: `${newWidth}px` });
            }
            resizeStartRef.current = null;
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <NodeViewWrapper className="inline-block relative leading-none">
            <div className={`relative inline-block group ${selected ? 'ring-2 ring-indigo-500 rounded-lg' : ''}`}>
                <img
                    ref={imageRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    title={node.attrs.title}
                    style={{ width: width, height: 'auto', maxWidth: '100%' }}
                    className="rounded-lg transition-shadow duration-200"
                />
                {(selected || isResizing) && (
                    <div
                        className="absolute bottom-1 right-1 w-3 h-3 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize z-10 hover:bg-indigo-50 shadow-sm"
                        onMouseDown={onMouseDown}
                        title="크기 조절"
                    />
                )}
            </div>
        </NodeViewWrapper>
    );
};

export const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                renderHTML: (attributes) => {
                    return {
                        width: attributes.width,
                        style: `width: ${attributes.width}`,
                    };
                },
            },
            height: {
                default: null,
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },
});
