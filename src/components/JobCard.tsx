import React, { forwardRef } from 'react';
import { Trash2, MapPin, Calendar } from 'lucide-react';
import type { Job } from '../types';

interface JobCardProps {
    job: Job;
    onClick?: (job: Job) => void;
    onDelete?: (id: string, e: React.MouseEvent) => void;
    style?: React.CSSProperties;
    className?: string;
    isDragging?: boolean;
}

export const JobCard = forwardRef<HTMLDivElement, JobCardProps>(
    ({ job, onClick, onDelete, style, className, isDragging, ...props }, ref) => {
        return (
            <div
                ref={ref}
                style={style}
                className={`job-card ${isDragging ? 'dragging' : ''} ${className || ''}`}
                onClick={() => onClick?.(job)}
                {...props}
            >
                <div className="card-header">
                    <h4>{job.company}</h4>
                    {onDelete && (
                        <button
                            className="icon-btn delete-btn-card"
                            onClick={(e) => onDelete(job.id, e)}
                            title="Delete"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
                <div className="card-title">{job.title}</div>

                <div className="card-meta">
                    {(job.location || job.locationType) && (
                        <div className="meta-item">
                            <MapPin size={12} />
                            {job.locationType === 'Remote'
                                ? 'Remote'
                                : job.locationType
                                    ? `${job.locationType}: ${job.location || ''}`
                                    : job.location
                            }
                        </div>
                    )}
                    <div className="meta-item">
                        <Calendar size={12} /> {job.dateApplied}
                    </div>
                </div>
            </div>
        );
    }
);
