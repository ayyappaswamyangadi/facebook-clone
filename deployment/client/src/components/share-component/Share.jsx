import { Cancel, EmojiEmotions, Label, PermMedia, Room } from "@mui/icons-material"
import { useContext, useRef, useState } from "react"
import "./Share.scss"
import { AuthContext } from '../context/AuthContext'
import axios from 'axios';
import { Link } from 'react-router-dom'

const FEELINGS = [
    { emoji: '😊', label: 'happy' },
    { emoji: '😢', label: 'sad' },
    { emoji: '😍', label: 'in love' },
    { emoji: '😠', label: 'angry' },
    { emoji: '😎', label: 'cool' },
    { emoji: '🥳', label: 'excited' },
    { emoji: '😴', label: 'tired' },
    { emoji: '🤒', label: 'sick' },
    { emoji: '😇', label: 'blessed' },
    { emoji: '🤔', label: 'thoughtful' },
    { emoji: '😤', label: 'frustrated' },
    { emoji: '🥰', label: 'grateful' },
];

const Share = () => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;
    const desc = useRef();

    const { user } = useContext(AuthContext)

    const [file, setFile] = useState(null);
    const [location, setLocation] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [feeling, setFeeling] = useState(null); // { emoji, label }
    const [tag, setTag] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [showLocation, setShowLocation] = useState(false);
    const [showFeeling, setShowFeeling] = useState(false);
    const [showTag, setShowTag] = useState(false);
    const [error, setError] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleOnChange = (event) => {
        setFile(event.target.files[0])
        setError('');
    }

    const handleLocationConfirm = () => {
        if (locationInput.trim()) {
            setLocation(locationInput.trim());
        }
        setShowLocation(false);
    };

    const handleTagConfirm = () => {
        if (tagInput.trim()) {
            setTag(tagInput.trim());
        }
        setShowTag(false);
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        const descValue = desc.current.value.trim();

        // Validation: require text OR image
        if (!descValue && !file) {
            setError("Please write something or add a photo before sharing.");
            return;
        }

        setError('');
        setIsPosting(true);

        const newPost = {
            userId: user._id,
            desc: descValue,
        };

        if (location.trim()) newPost.location = location.trim();
        if (feeling) newPost.feeling = `${feeling.emoji} ${feeling.label}`;
        if (tag.trim()) newPost.tag = tag.trim();

        if (file) {
            const data = new FormData();
            // Let the server generate the unique filename
            data.append("file", file);

            try {
                const uploadRes = await axios.post('/upload', data);
                // Use the server-returned filename so it always matches what's on disk
                newPost.img = uploadRes.data.filename;
            } catch (err) {
                console.log(err);
                setError("Failed to upload image. Please try again.");
                setIsPosting(false);
                return;
            }
        }

        try {
            await axios.post('/post', newPost);
            window.location.reload();
        } catch (err) {
            console.log(err);
            setError("Failed to share post. Please try again.");
            setIsPosting(false);
        }
    }

    return (
        <div className='share'>
            <div className="share-wrapper">
                {/* Top row: avatar + text input */}
                <div className="share-top">
                    <Link to={"/profile/" + user.userName}>
                        <img
                            src={user.profilePicture
                                ? public_folder_path + "profiles/" + user.profilePicture
                                : public_folder_path + "profiles/no-avatar.png"}
                            alt="profile-pic"
                            className="share-profile-pic"
                        />
                    </Link>
                    <div className="share-input-wrapper">
                        <input
                            type="text"
                            placeholder={`What's on your mind, ${user.userName}?`}
                            className="share-input"
                            ref={desc}
                            onChange={() => setError('')}
                        />
                        {/* Chips for selected location / feeling / tag */}
                        {(feeling || location || tag) && (
                            <div className="share-tags-row">
                                {feeling && (
                                    <span className="share-tag-chip">
                                        {feeling.emoji} feeling {feeling.label}
                                        <Cancel className="share-tag-close" onClick={() => setFeeling(null)} />
                                    </span>
                                )}
                                {location && (
                                    <span className="share-tag-chip">
                                        📍 {location}
                                        <Cancel className="share-tag-close" onClick={() => { setLocation(''); setLocationInput(''); }} />
                                    </span>
                                )}
                                {tag && (
                                    <span className="share-tag-chip">
                                        👤 with {tag}
                                        <Cancel className="share-tag-close" onClick={() => { setTag(''); setTagInput(''); }} />
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded: Location input */}
                {showLocation && (
                    <div className="share-expanded-input">
                        <Room htmlColor="red" fontSize="small" />
                        <input
                            className="share-meta-input"
                            placeholder="Where are you? (press Enter or click ✓)"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleLocationConfirm(); if (e.key === 'Escape') setShowLocation(false); }}
                            autoFocus
                        />
                        <button className="share-meta-confirm" onClick={handleLocationConfirm}>✓</button>
                        <button className="share-meta-cancel" onClick={() => setShowLocation(false)}>✕</button>
                    </div>
                )}

                {/* Expanded: Tag input */}
                {showTag && (
                    <div className="share-expanded-input">
                        <Label htmlColor="#1877f2" fontSize="small" />
                        <input
                            className="share-meta-input"
                            placeholder="Tag someone (username)…"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleTagConfirm(); if (e.key === 'Escape') setShowTag(false); }}
                            autoFocus
                        />
                        <button className="share-meta-confirm" onClick={handleTagConfirm}>✓</button>
                        <button className="share-meta-cancel" onClick={() => setShowTag(false)}>✕</button>
                    </div>
                )}

                {/* Expanded: Feelings grid */}
                {showFeeling && (
                    <div className="share-feeling-grid">
                        <p className="share-feeling-title">How are you feeling?</p>
                        <div className="share-feeling-options">
                            {FEELINGS.map((f) => (
                                <button
                                    key={f.label}
                                    className={`share-feeling-option ${feeling?.label === f.label ? 'selected' : ''}`}
                                    onClick={() => { setFeeling(f); setShowFeeling(false); }}
                                    type="button"
                                >
                                    <span className="share-feeling-emoji">{f.emoji}</span>
                                    <span className="share-feeling-label">{f.label}</span>
                                </button>
                            ))}
                        </div>
                        <button className="share-feeling-close" onClick={() => setShowFeeling(false)} type="button">Close</button>
                    </div>
                )}

                <hr className="share-horizontal-line" />

                {/* Image preview */}
                {file && (
                    <div className="share-container">
                        <img className="share-image" src={URL.createObjectURL(file)} alt="preview" />
                        <Cancel className="share-cancel-image" onClick={() => setFile(null)} />
                    </div>
                )}

                {/* Error message */}
                {error && <p className="share-error">{error}</p>}

                {/* Bottom bar */}
                <form encType="multipart/form-data" method="POST" className="share-bottom" onSubmit={submitHandler}>
                    <div className="share-options">
                        <label htmlFor="file" className="share-option">
                            <PermMedia htmlColor="tomato" className="share-icon" />
                            <span className="share-option-text">Photo/Video</span>
                            <input
                                type="file"
                                id="file"
                                name="file"
                                accept=".png,.jpeg,.jpg,.gif"
                                onChange={handleOnChange}
                                onClick={(event) => { event.target.value = null }}
                                style={{ display: 'none' }}
                            />
                        </label>

                        <div
                            className={`share-option ${tag ? 'share-option-active' : ''}`}
                            onClick={() => { setShowTag(!showTag); setShowLocation(false); setShowFeeling(false); }}
                        >
                            <Label htmlColor="#1877f2" className="share-icon" />
                            <span className="share-option-text">Tag</span>
                        </div>

                        <div
                            className={`share-option ${location ? 'share-option-active' : ''}`}
                            onClick={() => { setShowLocation(!showLocation); setShowTag(false); setShowFeeling(false); }}
                        >
                            <Room htmlColor="red" className="share-icon" />
                            <span className="share-option-text">Location</span>
                        </div>

                        <div
                            className={`share-option ${feeling ? 'share-option-active' : ''}`}
                            onClick={() => { setShowFeeling(!showFeeling); setShowLocation(false); setShowTag(false); }}
                        >
                            <EmojiEmotions htmlColor="goldenrod" className="share-icon" />
                            <span className="share-option-text">Feelings</span>
                        </div>
                    </div>

                    <button className="share-button" type="submit" disabled={isPosting}>
                        {isPosting ? 'Sharing…' : 'Share'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Share
