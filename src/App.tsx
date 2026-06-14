import { useState, useRef, useEffect } from 'react';
import CurrencySelect from './CurrencySelect';
import {
  Briefcase,
  MapPin,
  DollarSign,
  User,
  Calendar,
  Plus,
  Globe,
  Search,
  ExternalLink,
  Save,
  Trash2,
  Menu,
  ChevronRight,
  Edit2,
  AlertTriangle,
  Check,
  Coffee,
  ArrowLeft
} from 'lucide-react';
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DraggableJobCard } from './components/DraggableJobCard';
import { JobCard } from './components/JobCard';
import { DroppableColumn } from './components/DroppableColumn';
import './App.css';
import { COLUMNS } from './types';
import type { Job, JobStatus, FilterState } from './types';
import { SidebarFilters } from './components/SidebarFilters';
import { BreakModal } from './components/BreakModal';

type Tab = 'dashboard' | 'browser';

const INITIAL_JOB_STATE: Partial<Job> = {
  title: '',
  company: '',
  status: 'Applied',
  dateApplied: new Date().toISOString().split('T')[0],
  link: '',
  team: '',
  referral: '',
  yearsOfExperience: '',
  salary: '',

  pointOfContact: '',
  location: '',
  locationType: 'Remote',
  notes: ''
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [browserUrl, setBrowserUrl] = useState('https://www.linkedin.com/jobs/');
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewJob, setViewJob] = useState<Job | null>(null);

  const [currentJob, setCurrentJob] = useState<Partial<Job>>(INITIAL_JOB_STATE);
  const [isEditing, setIsEditing] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    company: '',
    locationTypes: [],
    salary: { amount: '', currency: 'USD', operator: '>=' },
    experience: { years: '', operator: '>=' },
    dateApplied: { value: '', operator: '' }
  });

  // Break Modal State
  const [showBreakModal, setShowBreakModal] = useState(false);

  // Confirmation State
  const [confirmation, setConfirmation] = useState<{
    type: 'delete' | 'save' | 'alert';
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag, prevents accidental drags on clicks
      },
    })
  );

  const [activeDragJob, setActiveDragJob] = useState<Job | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find(j => j.id === active.id);
    if (job) {
      setActiveDragJob(job);
    }
  };

  // WebView Ref
  const webviewRef = useRef<any>(null);

    const handleSaveClick = () => {
    if (!currentJob.title || !currentJob.company) {
      setConfirmation({
        type: 'alert',
        message: 'Company and Job Title are required!',
        onConfirm: () => setConfirmation(null) // Just close
      });
      return;
    }

    setConfirmation({
      type: 'save',
      message: isEditing
        ? 'Are you sure you want to save changes to this application?'
        : 'Are you sure you want to add this new application?',
      onConfirm: executeSaveJob
    });
  };

  const executeSaveJob = () => {
    if (isEditing && currentJob.id) {
      setJobs(jobs.map(j => j.id === currentJob.id ? { ...j, ...currentJob } as Job : j));
      // If we are also viewing this job, update the view
      if (viewJob && viewJob.id === currentJob.id) {
        setViewJob({ ...viewJob, ...currentJob } as Job);
      }
    } else {
      const newJobEntry: Job = {
        ...currentJob,
        id: Date.now().toString(),
        status: currentJob.status || 'Applied',
        dateApplied: currentJob.dateApplied || new Date().toISOString().split('T')[0],
        link: currentJob.link || '',
        title: currentJob.title!,
        company: currentJob.company!
      };
      setJobs([...jobs, newJobEntry]);
    }
    closeEditModal();
    setConfirmation(null);
  };

  const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmation({
      type: 'delete',
      message: 'Are you sure you want to delete this application? This action cannot be undone.',
      onConfirm: () => executeDelete(id)
    });
  };

  const executeDelete = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id));
    setConfirmation(null);
    if (viewJob?.id === id) {
      setViewJob(null);
    }
  };

  const openEditModal = (job: Job) => {
    setCurrentJob(job);
    setIsEditing(true);
    setShowEditModal(true);
    // Note: We don't close viewJob here, because we might want to return to it? 
    // Or we can close it. Let's keep viewJob open "underneath" or close it?
    // User flow: View -> Edit -> Save -> Back to View (updated).
    // So we keep viewJob state, but the Edit Modal covers it.
  };

  const openAddModal = () => {
    setCurrentJob(INITIAL_JOB_STATE);
    setIsEditing(false);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setCurrentJob(INITIAL_JOB_STATE);
    setIsEditing(false);
  };

  const openViewModal = (job: Job) => {
    setViewJob(job);
  };

  const closeViewModal = () => {
    setViewJob(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Always clear active drag job
    setActiveDragJob(null);

    if (!over) return;

    const jobId = active.id;
    const overId = over.id as string;

    // Check if dropped over a column
    if (COLUMNS.some(col => col.id === overId)) {
      const newStatus = overId as JobStatus;
      setJobs(prevJobs => {
        const job = prevJobs.find(j => j.id === jobId);
        if (job && job.status !== newStatus) {
          return prevJobs.map(j =>
            j.id === jobId ? { ...j, status: newStatus } : j
          );
        }
        return prevJobs;
      });
    }
  };

  // Filtering Logic
  const filteredJobs = jobs.filter(job => {
    // 1. Company
    if (filters.company && !job.company.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }

    // 2. Location Type
    if (filters.locationTypes.length > 0) {
      // If job has no locationType (legacy), we can't filter effectively by type unless we assume.
      // Let's assume missing = don't show if specific types requested, OR show if specific type "Onsite" maybe?
      // Better: check if locationType matches.
      if (!job.locationType || !filters.locationTypes.includes(job.locationType)) {
        return false;
      }
    }

    // 3. Salary
    if (filters.salary.amount) {
      const jobSalary = parseFloat(job.salary || '0');
      const filterSalary = parseFloat(filters.salary.amount);
      const jobCurrency = job.salaryCurrency || 'USD';
      // Note: This simple comparison assumes same currency. 
      // If currencies differ, we might be filtering apples vs oranges.
      // For now, let's strict check currency too if provided.

      if (jobCurrency !== filters.salary.currency) return false;

      switch (filters.salary.operator) {
        case '>=': if (jobSalary < filterSalary) return false; break;
        case '<=': if (jobSalary > filterSalary) return false; break;
        case '=': if (jobSalary !== filterSalary) return false; break;
      }
    }

    // 4. Experience
    if (filters.experience.years) {
      const jobExp = parseFloat(job.yearsOfExperience || '0');
      const filterExp = parseFloat(filters.experience.years);
      switch (filters.experience.operator) {
        case '>=': if (jobExp < filterExp) return false; break;
        case '<=': if (jobExp > filterExp) return false; break;
        case '=': if (jobExp !== filterExp) return false; break;
      }
    }

    // 5. Date Applied
    if (filters.dateApplied.operator && filters.dateApplied.value) {
      const jobDate = new Date(job.dateApplied);
      const filterDate = new Date(filters.dateApplied.value);

      // Reset times for date-only comparison
      jobDate.setHours(0, 0, 0, 0);
      filterDate.setHours(0, 0, 0, 0);

      switch (filters.dateApplied.operator) {
        case 'before': if (jobDate >= filterDate) return false; break;
        case 'after': if (jobDate <= filterDate) return false; break;
        case 'on': if (jobDate.getTime() !== filterDate.getTime()) return false; break;
      }
    }

    return true;
  });

  // Scraping Logic
  const handleTrackJob = async () => {
    if (!webviewRef.current) return;

    try {
      // Wait 2 seconds for LinkedIn to fully render the job detail panel
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Execute JavaScript in the webview to scrape data
      const data = await webviewRef.current.executeJavaScript(`
        (function() {
          return new Promise((resolve) => {
            let attempts = 0;
            const interval = setInterval(() => {
              attempts++;
              
              // Look for the main elements to confirm the page has loaded
              const h1El = document.querySelector('h1');
              const descEl = document.querySelector('.jobs-description__content, .jobs-box__html-content, #job-details, .jobs-description, .core-section-container__content');
              
              // If we find both, or we've tried for 10 seconds (20 * 500ms), proceed with scraping
              if ((h1El && descEl) || attempts > 20) {
                clearInterval(interval);
                
                                // Scope to the job detail panel (right side) to avoid nav bar elements
                const jobPanel = document.querySelector('.jobs-search__job-details') ||
                                 document.querySelector('.jobs-details') ||
                                 document.querySelector('.scaffold-layout__detail') ||
                                 document.querySelector('.job-view-layout') ||
                                 document;

                                let title = '';
                const titleEls = jobPanel.querySelectorAll('h1, .job-details-jobs-unified-top-card__job-title, .topcard__title');
                for (const el of titleEls) {
                  const t = el.innerText.trim();
                  if (t.length > 0 && t.length < 150) {
                    title = t;
                    break;
                  }
                }
                if (title) title = title.replace(/\\| LinkedIn/g, '').replace(/Job Application for /g, '').trim();

                                let company = '';
                const companyEls = jobPanel.querySelectorAll('.job-details-jobs-unified-top-card__company-name, .topcard__org-name-link, .topcard__flavor a, a[href*="/company/"]');
                for (const el of companyEls) {
                  const t = el.innerText.trim();
                  // Avoid empty strings or extremely long strings
                  if (t.length > 0 && t.length < 100) {
                    company = t;
                    break;
                  }
                }

                                let location = '';
                const topCard = jobPanel.querySelector('.job-details-jobs-unified-top-card__primary-description-container, .topcard__flavor-row, .job-details-jobs-unified-top-card__primary-description');
                if (topCard) {
                  const allText = topCard.innerText || '';
                  const parts = allText.split(/[\\u00b7\\u2022\\n-]/).map(p => p.trim()).filter(p => p.length > 2);
                  for (const part of parts) {
                    if (/ago|clicked|people|Reposted|apply|Promoted|hirer|alumni/i.test(part)) continue;
                    if (company && part.toLowerCase().includes(company.toLowerCase())) continue;
                    if (/area|city|jakarta|indonesia|singapore|remote|hybrid|region|metro|state|province/i.test(part) || 
                        ((part.charAt(0) < '0' || part.charAt(0) > '9') && part.length > 3 && part.length < 60)) {
                      location = part;
                      break;
                    }
                  }
                }

                                let locationType = '';
                const topCardEl = jobPanel.querySelector('.job-details-jobs-unified-top-card') || jobPanel;
                const topCardText = (topCardEl.innerText || '').toLowerCase();
                if (new RegExp('\\\\bremote\\\\b').test(topCardText)) locationType = 'Remote';
                else if (new RegExp('\\\\bhybrid\\\\b').test(topCardText)) locationType = 'Hybrid';
                else if (new RegExp('\\\\bon-site\\\\b').test(topCardText) || new RegExp('\\\\bonsite\\\\b').test(topCardText)) locationType = 'Onsite';
                
                if (!locationType) {
                  const locLower = location.toLowerCase();
                  if (locLower.includes('remote')) locationType = 'Remote';
                  else if (locLower.includes('hybrid')) locationType = 'Hybrid';
                  else locationType = 'Onsite';
                }

                                let yearsOfExperience = '';
                const descText = descEl ? descEl.innerText : (jobPanel.innerText || '');
                if (descText) {
                  const lines = descText.split('\\n');
                  for (const line of lines) {
                    const lower = line.toLowerCase();
                    const yearIdx = lower.indexOf('year');
                    if (yearIdx === -1) continue;
                    const before = line.substring(Math.max(0, yearIdx - 20), yearIdx);
                    const tokens = before.trim().split(/[^0-9]+/);
                    const numTokens = tokens.filter(t => t.length > 0);
                    if (numTokens.length > 0) {
                      const num = parseInt(numTokens[numTokens.length - 1]);
                      if (!isNaN(num) && num > 0 && num < 30) {
                        if (lower.includes('experience') || lower.includes('working') || 
                            lower.includes('professional') || lower.includes('pengalaman') ||
                            lower.includes('kerja') || line.includes('+') || lower.includes('min')) {
                          yearsOfExperience = String(num);
                          break;
                        }
                      }
                    }
                  }
                  if (!yearsOfExperience) {
                    const words = descText.split(/\\s+/);
                    for (let i = 0; i < words.length; i++) {
                      if (words[i].toLowerCase().startsWith('year') || words[i].toLowerCase().startsWith('tahun')) {
                        for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
                          const cleaned = words[j].replace(/[^0-9]/g, '');
                          if (!cleaned) continue;
                          const num = parseInt(cleaned);
                          if (!isNaN(num) && num > 0 && num < 30) {
                            yearsOfExperience = String(num);
                            break;
                          }
                        }
                        if (yearsOfExperience) break;
                      }
                    }
                  }
                }

                                let pointOfContact = '';
                const headings = jobPanel.querySelectorAll('h2, h3, span.t-bold, strong');
                let contactSection = null;
                let contactPrefix = '[Reach Out]';
                
                for (const h of headings) {
                  const hText = (h.innerText || '').trim().toLowerCase();
                  if (hText.includes('reach out')) {
                    contactSection = h.closest('section') || h.closest('div[class*="card"]') || h.parentElement?.parentElement;
                    contactPrefix = '[Reach Out]';
                    break;
                  }
                  if (hText.includes('hiring team')) {
                    contactSection = h.closest('section') || h.closest('div[class*="card"]') || h.parentElement?.parentElement;
                    contactPrefix = '[Hiring Team]';
                    break;
                  }
                }

                if (contactSection) {
                  const links = contactSection.querySelectorAll('a[href*="/in/"]');
                  const contacts = [];
                  const seenNames = new Set();
                  for (const link of links) {
                    let name = '';
                    const nameEl = link.querySelector('.artdeco-entity-lockup__title') || 
                                   link.querySelector('span[dir="ltr"]') ||
                                   link.querySelector('span');
                    if (nameEl) name = nameEl.innerText.trim();
                    else name = link.innerText.trim();
                    
                    name = name.split('\\n')[0].trim();
                    if (name.indexOf('·') > -1) name = name.substring(0, name.indexOf('·')).trim();
                    
                    let href = link.href || '';
                    if (href.includes('/in/')) href = href.split('?')[0];
                    
                    if (name.toLowerCase().includes('profile photo')) continue;
                    
                    if (name && name.length > 1 && name.length < 60 && 
                        !name.toLowerCase().includes('message') && 
                        !seenNames.has(href)) {
                      seenNames.add(href);
                      contacts.push(contactPrefix + ' ' + name + ': ' + href);
                    }
                  }
                  pointOfContact = contacts.join('\\n');
                }

                                let jobLink = '';
                const currentUrl = window.location.href;
                const urlParams = new URLSearchParams(window.location.search);
                const jobId = urlParams.get('currentJobId');
                if (jobId) {
                  jobLink = 'https://www.linkedin.com/jobs/view/' + jobId + '/';
                } else {
                  const viewIdx = currentUrl.indexOf('/jobs/view/');
                  if (viewIdx > -1) {
                    const afterView = currentUrl.substring(viewIdx + 11);
                    const idEnd = afterView.search(/[^0-9]/);
                    const extractedId = idEnd > 0 ? afterView.substring(0, idEnd) : afterView;
                    if (extractedId) jobLink = 'https://www.linkedin.com/jobs/view/' + extractedId + '/';
                    else jobLink = currentUrl.split('?')[0];
                  } else {
                    jobLink = currentUrl.split('?')[0];
                  }
                }

                resolve({ title, company, location, locationType, yearsOfExperience, pointOfContact, link: jobLink });
              }
            }, 500);
          });
        })()
      `);

      console.log('Scraped Data:', data);

      setCurrentJob({
        ...INITIAL_JOB_STATE,
        title: data.title,
        company: data.company,
        location: data.location,
        locationType: data.locationType || 'Onsite',
        yearsOfExperience: data.yearsOfExperience || '',
        pointOfContact: data.pointOfContact || '',
        link: data.link,
        status: 'Applied'
      });
      setIsEditing(false);
      setShowEditModal(true);

    } catch (error) {
      console.error('Scraping failed:', error);
      alert('Could not auto-fill. Please enter details manually.');
      openAddModal();
    }
  };

  return (
    <div className="app-container">
      <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <div className="logo-area">
              <Briefcase size={24} />
              <h2>Job Tracker</h2>
            </div>
          )}
          <button
            className="collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          title="Board"
        >
          <div className="nav-icon"><Calendar size={20} /></div>
          {!isSidebarCollapsed && <span>Board</span>}
        </button>

        <button
          onClick={() => setActiveTab('browser')}
          className={`nav-item ${activeTab === 'browser' ? 'active' : ''}`}
          title="Browse LinkedIn"
        >
          <div className="nav-icon"><Globe size={20} /></div>
          {!isSidebarCollapsed && <span>Browse LinkedIn</span>}
        </button>

        <SidebarFilters
          filters={filters}
          setFilters={setFilters}
          isCollapsed={isSidebarCollapsed}
        />

        <button
          className="nav-item"
          onClick={() => setShowBreakModal(true)}
          title="Take a Break"
        >
          <div className="nav-icon"><Coffee size={20} /></div>
          {!isSidebarCollapsed && <span>Take a Break</span>}
        </button>
      </nav>

      <main className="content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <header className="dashboard-header">
              <h1>My Applications</h1>
              <button className="primary-btn" onClick={openAddModal}>
                <Plus size={18} /> Add Application
              </button>
            </header>

            <div className="kanban-board">
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {COLUMNS.map(column => (
                  <DroppableColumn key={column.id} id={column.id} className="kanban-column">
                    <div className="column-header" style={{ borderTopColor: column.color }}>
                      <h3>{column.title}</h3>
                      <span className="count">
                        {filteredJobs.filter(j => j.status === column.id).length}
                      </span>
                    </div>

                    <div className="column-content">
                      {filteredJobs.filter(j => j.status === column.id).map(job => (
                        <DraggableJobCard
                          key={job.id}
                          job={job}
                          onClick={openViewModal}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </div>
                  </DroppableColumn>
                ))}

                <DragOverlay>
                  {activeDragJob ? (
                    <JobCard
                      job={activeDragJob}
                      isDragging={true}
                      // Make the overlay slightly larger or rotated for effect (optional)
                      style={{ transform: 'scale(1.05)', cursor: 'grabbing', boxShadow: '0 5px 15px rgba(0,0,0,0.15)' }}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        )}

        {activeTab === 'browser' && (
          <div className="browser-view">
            <div className="browser-toolbar">
              <button
                onClick={() => webviewRef.current?.goBack()}
                title="Go Back"
                style={{ padding: '8px', marginRight: '8px', borderRadius: '6px', background: 'transparent', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}
              >
                <ArrowLeft size={16} />
              </button>
              <div className="url-bar" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Paste LinkedIn job link here..."
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData('text');
                    if (pastedText.startsWith('http')) {
                      setBrowserUrl(pastedText);
                      // Let the native paste occur or manually set value. The native paste happens after onPaste.
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      let val = e.currentTarget.value;
                      if (val && !val.startsWith('http')) val = 'https://' + val;
                      if (val) setBrowserUrl(val);
                    }
                  }}
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'inherit', width: '100%', marginLeft: '8px' }}
                />
              </div>
              <button className="track-btn" onClick={handleTrackJob}>
                <Save size={16} /> Track This Job
              </button>
            </div>
            <webview
              ref={webviewRef}
              src={browserUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              // @ts-ignore: electron webview tag
              allowpopups="true"
            ></webview>
          </div>
        )}
      </main>

      {/* View Job Modal */}
      {
        viewJob && !showEditModal && (
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-content large view-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="view-header-left">
                  <h3>{viewJob.title}</h3>
                  <span className="company-badge">{viewJob.company}</span>
                </div>
                <button className="close-btn" onClick={closeViewModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="status-banner" style={{
                  backgroundColor: COLUMNS.find(c => c.id === viewJob.status)?.color + '20',
                  color: COLUMNS.find(c => c.id === viewJob.status)?.color
                }}>
                  <strong>Status:</strong> {viewJob.status}
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <label><Calendar size={14} /> Date Applied</label>
                    <span>{viewJob.dateApplied || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label><MapPin size={14} /> Location</label>
                    {/* Display Location Type + Address if applicable */}
                    <span>
                      {viewJob.locationType === 'Remote'
                        ? 'Remote'
                        : viewJob.locationType
                          ? `${viewJob.locationType}: ${viewJob.location || ''}`
                          : viewJob.location || 'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label><DollarSign size={14} /> Salary</label>
                    <span>
                      {viewJob.salary
                        ? (!isNaN(Number(viewJob.salary))
                          ? `${viewJob.salaryCurrency || 'USD'} ${Number(viewJob.salary).toLocaleString()}`
                          : viewJob.salary)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label><User size={14} /> Team</label>
                    <span>{viewJob.team || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label><Briefcase size={14} /> Experience</label>
                    <span>{viewJob.yearsOfExperience ? `${viewJob.yearsOfExperience} years` : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label><User size={14} /> Contact</label>
                    <span>{viewJob.pointOfContact || 'N/A'}</span>
                  </div>
                </div>

                {viewJob.link && (
                  <div className="detail-section">
                    <label>Job Link</label>
                    <a href={viewJob.link} target="_blank" rel="noreferrer" className="link-display">
                      {viewJob.link} <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {viewJob.notes && (
                  <div className="detail-section">
                    <label>Notes</label>
                    <div className="notes-display">{viewJob.notes}</div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="delete-btn" onClick={() => handleDeleteClick(viewJob.id)}>
                  <Trash2 size={16} /> Delete
                </button>
                <button className="primary-btn" onClick={() => openEditModal(viewJob)}>
                  <Edit2 size={16} /> Edit Application
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit/Add Modal */}
      {
        showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content large">
              <div className="modal-header">
                <h3>{isEditing ? 'Edit Application' : 'New Application'}</h3>
                <button className="close-btn" onClick={closeEditModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Company *</label>
                    <input
                      value={currentJob.company}
                      onChange={e => setCurrentJob({ ...currentJob, company: e.target.value })}
                      placeholder="Company Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      value={currentJob.title}
                      onChange={e => setCurrentJob({ ...currentJob, title: e.target.value })}
                      placeholder="Role Title"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={currentJob.status}
                      onChange={e => setCurrentJob({ ...currentJob, status: e.target.value as JobStatus })}
                    >
                      {COLUMNS.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Applied</label>
                    <input
                      type="date"
                      value={currentJob.dateApplied}
                      onChange={e => setCurrentJob({ ...currentJob, dateApplied: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location Type</label>
                    <div className="radio-group" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      {(['Remote', 'Hybrid', 'Onsite'] as const).map((type) => (
                        <label key={type} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                          <input
                            type="radio"
                            name="locationType"
                            value={type}
                            checked={currentJob.locationType === type}
                            onChange={(e) => setCurrentJob({ ...currentJob, locationType: e.target.value as any })}
                            style={{ marginRight: '4px' }}
                          />
                          {type}
                        </label>
                      ))}
                    </div>

                    {currentJob.locationType !== 'Remote' && (
                      <input
                        value={currentJob.location}
                        onChange={e => setCurrentJob({ ...currentJob, location: e.target.value })}
                        placeholder={currentJob.locationType === 'Hybrid' ? 'Hybrid Address' : 'Office Address'}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Salary</label>
                    <div className="salary-input-group">
                      <CurrencySelect
                        value={currentJob.salaryCurrency || 'USD'}
                        onChange={val => setCurrentJob({ ...currentJob, salaryCurrency: val })}
                      />
                      <input
                        type="number"
                        value={currentJob.salary}
                        onChange={e => setCurrentJob({ ...currentJob, salary: e.target.value })}
                        placeholder="Amount"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Team</label>
                    <input
                      value={currentJob.team}
                      onChange={e => setCurrentJob({ ...currentJob, team: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Years of Exp</label>
                    <input
                      type="number"
                      value={currentJob.yearsOfExperience}
                      onChange={e => setCurrentJob({ ...currentJob, yearsOfExperience: e.target.value })}
                      placeholder="e.g. 5"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Point of Contact</label>
                    <input
                      value={currentJob.pointOfContact}
                      onChange={e => setCurrentJob({ ...currentJob, pointOfContact: e.target.value })}
                      placeholder="Recruiter Name / Email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Referral</label>
                    <input
                      value={currentJob.referral}
                      onChange={e => setCurrentJob({ ...currentJob, referral: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Link</label>
                  <div className="input-with-icon">
                    <input
                      type="url"
                      value={currentJob.link}
                      onChange={e => setCurrentJob({ ...currentJob, link: e.target.value })}
                      placeholder="https://linkedin.com/jobs/..."
                    />
                    {currentJob.link && (
                      <a href={currentJob.link} target="_blank" rel="noreferrer" className="external-link">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    rows={4}
                    value={currentJob.notes}
                    onChange={e => setCurrentJob({ ...currentJob, notes: e.target.value })}
                    placeholder="Paste job description or add personal notes here..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
                <button className="save-btn" onClick={handleSaveClick}>
                  <Save size={16} /> Save Application
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Confirmation Modal */}
      {
        confirmation && (
          <div className="modal-overlay confirmation-overlay">
            <div className="confirmation-modal">
              <div className={`confirmation-icon ${confirmation.type}`}>
                {confirmation.type === 'delete' ? <AlertTriangle size={32} /> : (confirmation.type === 'alert' ? <AlertTriangle size={32} /> : <Check size={32} />)}
              </div>
              <h3>
                {confirmation.type === 'delete' ? 'Confirm Deletion' :
                  confirmation.type === 'alert' ? 'Validation Error' : 'Confirm Save'}
              </h3>
              <p>{confirmation.message}</p>
              <div className="confirmation-actions">
                {confirmation.type === 'alert' ? (
                  <button className="confirm-btn save" onClick={() => setConfirmation(null)}>OK</button>
                ) : (
                  <>
                    <button className="cancel-btn" onClick={() => setConfirmation(null)}>Cancel</button>
                    <button
                      className={`confirm-btn ${confirmation.type}`}
                      onClick={confirmation.onConfirm}
                    >
                      {confirmation.type === 'delete' ? 'Delete' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      }
      {/* Break Modal */}
      {showBreakModal && (
        <BreakModal onClose={() => setShowBreakModal(false)} />
      )}
    </div >
  );
}

export default App;