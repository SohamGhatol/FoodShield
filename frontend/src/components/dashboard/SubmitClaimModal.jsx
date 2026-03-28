import { useState } from 'react';
import { X, Upload, FileText, User, UtensilsCrossed, DollarSign, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SubmitClaimModal.css';

const SubmitClaimModal = ({ isOpen, onClose, onClaimSubmitted }) => {
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState('');
    const [amount, setAmount] = useState('');
    const [claimantName, setClaimantName] = useState('');
    const [complaint, setComplaint] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImages(files);
            setPreviews(files.map(file => URL.createObjectURL(file)));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            setImages(files);
            setPreviews(files.map(file => URL.createObjectURL(file)));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('restaurant', restaurant);
            formData.append('amount', amount);
            formData.append('claimantName', claimantName);
            formData.append('complaint', complaint);
            images.forEach(image => {
                formData.append('image', image);
            });

            await api.post('/claims', formData);

            setLoading(false);
            onClaimSubmitted();
            onClose();
            navigate('/claims');
        } catch (err) {
            console.error("Submission failed", err);
            setError("Failed to submit claim. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="scm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="scm-panel">

                {/* Header */}
                <div className="scm-header">
                    <div className="scm-header-icon">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h2 className="scm-title">File New Claim</h2>
                        <p className="scm-subtitle">Submit a food safety claim for AI analysis</p>
                    </div>
                    <button className="scm-close-btn" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="scm-divider" />

                <form onSubmit={handleSubmit} className="scm-form">
                    
                    <div className="scm-form-columns">
                        {/* Left Column: Text Inputs */}
                        <div className="scm-col-left">
                            <div className="scm-row">
                                <div className="scm-field">
                                    <label className="scm-label">
                                        <User size={14} />
                                        Claimant Name
                                    </label>
                                    <input
                                        className="scm-input"
                                        type="text"
                                        value={claimantName}
                                        onChange={(e) => setClaimantName(e.target.value)}
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>
                                <div className="scm-field">
                                    <label className="scm-label">
                                        <UtensilsCrossed size={14} />
                                        Restaurant Name
                                    </label>
                                    <input
                                        className="scm-input"
                                        type="text"
                                        value={restaurant}
                                        onChange={(e) => setRestaurant(e.target.value)}
                                        placeholder="e.g. Burger King"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="scm-field">
                                <label className="scm-label">
                                    <DollarSign size={14} />
                                    Refund Amount
                                </label>
                                <div className="scm-input-prefix-wrap">
                                    <span className="scm-prefix">$</span>
                                    <input
                                        className="scm-input scm-input-prefixed"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="scm-field">
                                <label className="scm-label">
                                    <FileText size={14} />
                                    Complaint
                                    <span className="scm-label-hint">Tell us what happened</span>
                                </label>
                                <textarea
                                    className="scm-textarea"
                                    value={complaint}
                                    onChange={(e) => setComplaint(e.target.value)}
                                    placeholder="Describe the food safety issue in detail — symptoms, timing, and any other relevant information..."
                                    rows={4}
                                    required
                                />
                                <span className="scm-char-count">{complaint.length} / 1000</span>
                            </div>
                        </div>

                        {/* Right Column: Image Upload */}
                        <div className="scm-col-right scm-field">
                            <label className="scm-label">
                                <ImageIcon size={14} />
                                Evidence Images
                                <span className="scm-label-hint">drag & drop or click</span>
                            </label>
                            <div
                                className={`scm-upload-box scm-upload-tall ${dragOver ? 'drag-over' : ''} ${previews.length > 0 ? 'has-files' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="scm-file-input"
                                />
                                {previews.length > 0 ? (
                                    <div className="scm-previews">
                                        {previews.map((src, idx) => (
                                            <div key={idx} className="scm-preview-thumb scm-preview-large">
                                                <img src={src} alt={`Evidence ${idx + 1}`} />
                                                <span className="scm-preview-overlay">{idx + 1}</span>
                                            </div>
                                        ))}
                                        <div className="scm-preview-add scm-preview-large">
                                            <Upload size={18} />
                                            <span>Add</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="scm-upload-placeholder">
                                        <div className="scm-upload-icon">
                                            <Upload size={32} />
                                        </div>
                                        <p className="scm-upload-text">Upload Evidence</p>
                                        <p className="scm-upload-sub">Supports JPG, PNG</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div> {/* End scm-form-columns */}

                    {error && (
                        <div className="scm-error">
                            <span>⚠ {error}</span>
                        </div>
                    )}

                    <div className="scm-actions">
                        <button type="button" className="scm-btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="scm-btn-submit" disabled={loading}>
                            {loading ? (
                                <span className="scm-loading">
                                    <span className="scm-spinner" />
                                    Analyzing...
                                </span>
                            ) : 'Submit Claim'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitClaimModal;
