import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, ExternalLink, Briefcase, Cat } from 'lucide-react';

interface BreakModalProps {
    onClose: () => void;
}

interface Meme {
    url: string;
    title: string;
    postLink: string;
    subreddit: string;
}

type Mode = 'work' | 'pet';

const WORK_SUBREDDITS = [
    'recruitinghell', 'WorkMemes', 'jobhunting', 'ProgrammerHumor',
    'antiwork', 'CorporateFacepalm', 'careerguidance', 'jobs',
    'accounting', 'consulting', 'marketing', 'sales'
];

const PET_SUBREDDITS = [
    'cats', 'dogs', 'aww', 'eyebleach', 'AnimalsBeingDerps',
    'AnimalsBeingBros', 'IllegallySmolCats', 'rarepuppers',
    'zoomies', 'catpictures', 'dogpictures'
];

export const BreakModal: React.FC<BreakModalProps> = ({ onClose }) => {
    const [mode, setMode] = useState<Mode>('work');
    const [meme, setMeme] = useState<Meme | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Helper to pick 3 random subreddits from a list
    const getRandomSubreddits = (list: string[]) => {
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3).join('+');
    };

    const fetchMeme = async () => {
        setLoading(true);
        setError(false);
        try {
            const sourceList = mode === 'work' ? WORK_SUBREDDITS : PET_SUBREDDITS;
            const subreddits = getRandomSubreddits(sourceList);

            const response = await fetch(`https://meme-api.com/gimme/${subreddits}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setMeme({
                url: data.url,
                title: data.title,
                postLink: data.postLink,
                subreddit: data.subreddit
            });
        } catch (err) {
            console.error('Error fetching meme:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Fetch when mode changes or on mount
    useEffect(() => {
        fetchMeme();
    }, [mode]);

    return createPortal(
        <div className="modal-overlay break-modal-overlay" onClick={onClose}>
            <div className="modal-content break-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Take a Break ☕</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="break-controls">
                    <button
                        className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
                        onClick={() => setMode('work')}
                    >
                        <Briefcase size={16} /> Work Humor
                    </button>
                    <button
                        className={`mode-btn ${mode === 'pet' ? 'active' : ''}`}
                        onClick={() => setMode('pet')}
                    >
                        <Cat size={16} /> Pets & Aww
                    </button>
                </div>

                <div className="modal-body break-body">
                    {loading ? (
                        <div className="meme-loading">
                            <div className="spinner"></div>
                            <p>{mode === 'work' ? 'Finding a relatable struggle...' : 'Looking for cute animals...'}</p>
                        </div>
                    ) : error ? (
                        <div className="meme-error">
                            <p>Failed to load content. The internet is down, panic!</p>
                            <button className="primary-btn" onClick={fetchMeme}>Try Again</button>
                        </div>
                    ) : meme ? (
                        <div className="meme-container">
                            <div className="meme-header">
                                <span className="subreddit">r/{meme.subreddit}</span>
                                <a href={meme.postLink} target="_blank" rel="noreferrer" className="meme-external-link">
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                            <img src={meme.url} alt={meme.title} className="meme-image" />
                            <p className="meme-title">{meme.title}</p>
                        </div>
                    ) : null}
                </div>

                <div className="modal-actions break-actions">
                    <button className="primary-btn next-meme-btn" onClick={fetchMeme} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                        {mode === 'work' ? 'Next Meme' : 'More Cuteness'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
