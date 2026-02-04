import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { JobStatus } from '../types';

interface DroppableColumnProps {
    id: JobStatus;
    children: React.ReactNode;
    className?: string;
    isOver?: boolean;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children, className }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const style = {
        backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : undefined,
        height: '100%',
        transition: 'background-color 0.2s ease',
    };

    return (
        <div ref={setNodeRef} className={className} style={style}>
            {children}
        </div>
    );
};
