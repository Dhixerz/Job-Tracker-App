import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Filter, X, GripHorizontal } from 'lucide-react';
import type { FilterState } from '../types';
import CurrencySelect from '../CurrencySelect';

interface SidebarFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    isCollapsed: boolean;
}

const INITIAL_FILTERS: FilterState = {
    company: '',
    locationTypes: [],
    salary: { amount: '', currency: 'USD', operator: '>=' },
    experience: { years: '', operator: '>=' },
    dateApplied: { value: '', operator: '' }
};

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, setFilters, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 300, y: 100 });
    const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; initialX: number; initialY: number }>({
        isDragging: false,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0
    });

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const updateNestedFilter = (parent: 'salary' | 'experience' | 'dateApplied', key: string, value: any) => {
        setFilters({
            ...filters,
            [parent]: { ...filters[parent], [key]: value }
        });
    };

    const toggleLocationType = (type: 'Remote' | 'Hybrid' | 'Onsite') => {
        const current = filters.locationTypes;
        const next = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];
        updateFilter('locationTypes', next);
    };

    const resetFilters = () => {
        setFilters(INITIAL_FILTERS);
    };

    // Drag Handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        dragRef.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current.isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPosition({
            x: dragRef.current.initialX + dx,
            y: dragRef.current.initialY + dy
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        dragRef.current.isDragging = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    return (
        <>
            <div className="sidebar-filters-trigger">
                <button
                    className={`nav-item ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    title="Filters"
                >
                    <div className="nav-icon"><Filter size={20} /></div>
                    {!isCollapsed && <span>Filters</span>}
                </button>
            </div>

            {isOpen && createPortal(
                <div
                    className="filter-popup"
                    style={{
                        left: position.x,
                        top: position.y
                    }}
                >
                    <div
                        className="filter-popup-header"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                    >
                        <div className="drag-handle">
                            <GripHorizontal size={16} />
                            <span>Filters</span>
                        </div>
                        <button className="close-popup-btn" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    <div className="filter-popup-content">
                        {/* Salary Filter */}
                        <div className="filter-group">
                            <label>Salary</label>
                            <div className="filter-row">
                                <select
                                    value={filters.salary.operator}
                                    onChange={e => updateNestedFilter('salary', 'operator', e.target.value)}
                                    className="operator-select"
                                >
                                    <option value=">=">{'>='}</option>
                                    <option value="<=">{'<='}</option>
                                    <option value="=">{'='}</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={filters.salary.amount}
                                    onChange={e => updateNestedFilter('salary', 'amount', e.target.value)}
                                    className="amount-input"
                                />
                            </div>
                            <div className="currency-row">
                                <CurrencySelect
                                    value={filters.salary.currency}
                                    onChange={val => updateNestedFilter('salary', 'currency', val)}
                                />
                            </div>
                        </div>

                        {/* Location Type Filter */}
                        <div className="filter-group">
                            <label>Location</label>
                            <div className="checkbox-group">
                                {(['Remote', 'Hybrid', 'Onsite'] as const).map(type => (
                                    <label key={type} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={filters.locationTypes.includes(type)}
                                            onChange={() => toggleLocationType(type)}
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Experience Filter */}
                        <div className="filter-group">
                            <label>Experience (Years)</label>
                            <div className="filter-row">
                                <select
                                    value={filters.experience.operator}
                                    onChange={e => updateNestedFilter('experience', 'operator', e.target.value)}
                                    className="operator-select"
                                >
                                    <option value=">=">{'>='}</option>
                                    <option value="<=">{'<='}</option>
                                    <option value="=">{'='}</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Years"
                                    value={filters.experience.years}
                                    onChange={e => updateNestedFilter('experience', 'years', e.target.value)}
                                    className="amount-input"
                                />
                            </div>
                        </div>

                        {/* Date Applied Filter */}
                        <div className="filter-group">
                            <label>Date Applied</label>
                            <select
                                value={filters.dateApplied.operator}
                                onChange={e => updateNestedFilter('dateApplied', 'operator', e.target.value)}
                                className="full-width-select"
                            >
                                <option value="">Any Time</option>
                                <option value="on">On</option>
                                <option value="before">Before</option>
                                <option value="after">After</option>
                            </select>
                            {filters.dateApplied.operator && (
                                <input
                                    type="date"
                                    value={filters.dateApplied.value}
                                    onChange={e => updateNestedFilter('dateApplied', 'value', e.target.value)}
                                    className="full-width-input"
                                />
                            )}
                        </div>

                        {/* Company Filter */}
                        <div className="filter-group">
                            <label>Company</label>
                            <input
                                type="text"
                                placeholder="Filter by company..."
                                value={filters.company}
                                onChange={e => updateFilter('company', e.target.value)}
                                className="full-width-input"
                            />
                        </div>

                        <button className="reset-btn" onClick={resetFilters}>
                            <X size={14} /> Reset Filters
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
