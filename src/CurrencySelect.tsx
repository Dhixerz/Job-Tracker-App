import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CURRENCIES } from './currencies';
import { Search, ChevronDown } from 'lucide-react';

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener('resize', () => setIsOpen(false)); // Close on resize to avoid misalignment

    // Close on scroll (captured) to avoid detached dropdown
    const handleScroll = (event: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
        return; // Don't close if scrolling inside the dropdown
      }
      setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('resize', () => setIsOpen(false));
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small timeout to allow render
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredCurrencies = CURRENCIES.filter(c =>
    c.code !== 'Other' && (
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="currency-select-container" ref={wrapperRef}>
      <button
        className="currency-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{value || 'USD'}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && createPortal(
        <div
          className="currency-dropdown"
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: 300, // Fixed width 300px for better readability
            maxHeight: '300px', // Limit height
            zIndex: 9999, // Ensure on top of modal
          }}
        >
          <div className="currency-search-box">
            <Search size={14} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="currency-search-input"
            />
          </div>
          <div className="currency-list">
            {filteredCurrencies.map(curr => (
              <div
                key={curr.code}
                className={`currency-option ${value === curr.code ? 'selected' : ''}`}
                onClick={() => {
                  onChange(curr.code);
                  setIsOpen(false);
                }}
                title={curr.name}
              >
                <strong>{curr.code}</strong> <span style={{ opacity: 0.6, fontSize: '0.85em' }}>{curr.name}</span>
              </div>
            ))}

            {/* Always show Other at bottom if it matches search or if search is empty */}
            {('Other'.toLowerCase().includes(search.toLowerCase()) || search === '') && (
              <div
                className={`currency-option ${value === 'Other' ? 'selected' : ''} other-option`}
                onClick={() => {
                  onChange('Other');
                  setIsOpen(false);
                }}
              >
                Other
              </div>
            )}

            {filteredCurrencies.length === 0 && !'Other'.toLowerCase().includes(search.toLowerCase()) && (
              <div className="no-results">No currency found</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CurrencySelect;
