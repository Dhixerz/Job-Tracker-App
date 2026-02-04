import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Job } from '../types';
import { JobCard } from './JobCard';

interface DraggableJobCardProps {
    job: Job;
    onClick: (job: Job) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export const DraggableJobCard: React.FC<DraggableJobCardProps> = ({ job, onClick, onDelete }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: job.id,
        data: { ...job },
    });

    const style = {
        // We do typically hide the original or lower opacity, but we don't apply transform to it anymore 
        // IF we use DragOverlay for the moving part. 
        // wait, if we use DragOverlay, we still usually apply transform to the original unless we want it to stay in place?
        // No, in Kanban, the original usually stays in place but invisibility (opacity 0) while DragOverlay moves.
        // OR, we just use useDraggable for logic and render plain card.
        // Let's use standard dnd-kit pattern:
        // Original: opacity 0.5 (or 0)
        // Overlay: opacity 1, high z-index

        // HOWEVER, useDraggable returns transform. If we don't apply it to the original, the original won't move 
        // BUT if we use DragOverlay, the overlay moves. The original should sit there as a placeholder or be hidden.
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <JobCard
            ref={setNodeRef}
            style={style}
            job={job}
            onClick={onClick}
            onDelete={onDelete}
            isDragging={isDragging}
            {...listeners}
            {...attributes}
        />
    );
};
