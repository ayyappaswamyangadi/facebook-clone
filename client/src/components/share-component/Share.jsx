import { Cancel, EmojiEmotions, Label, PermMedia, Room } from "@mui/icons-material"
import { useContext, useRef, useState, useEffect } from "react"
import EmojiPicker from "emoji-picker-react"
import "./Share.scss"
import { AuthContext } from '../context/AuthContext'
import axios from 'axios';
import { Link } from 'react-router-dom'

const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

const Share = () => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;
    const { user } = useContext(AuthContext)

    const [desc, setDesc] = useState("")
    const [file, setFile] = useState(null)
    const [location, setLocation] = useState("")
    const [showLocationInput, setShowLocationInput] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showTagInput, setShowTagInput] = useState(false)
    const [tagSearch, setTagSearch] = useState("")
    const [friends, setFriends] = useState([])
    const [taggedFriends, setTaggedFriends] = useState([])
    const [error, setError] = useState("")
    const [isSharing, setIsSharing] = useState(false)

    const textareaRef = useRef()
    const emojiPickerRef = useRef()
    const fileInputRef = useRef()

    useEffect(() => {
        if (showTagInput && friends.length === 0) {
            axios.get("/users/friends/" + user._id)
                .then(res => setFriends(res.data))
                .catch(err => console.log(err))
        }
    }, [showTagInput, user._id, friends.length])

    useEffect(() => {
        const handler = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleOnChange = (e) => {
        const selected = e.target.files[0]
        if (!selected) return

        if (selected.size > MAX_IMAGE_BYTES) {
            setError(`Image is too large. Maximum allowed size is ${MAX_IMAGE_MB} MB. Your file is ${(selected.size / 1024 / 1024).toFixed(1)} MB.`)
            setFile(null)
            // reset the input so the same file can be re-selected after compression
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
        }

        setError("")
        setFile(selected)
    }

    const onEmojiClick = (emojiData) => {
        const emoji = emojiData.emoji
        const textarea = textareaRef.current
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            setDesc(desc.substring(0, start) + emoji + desc.substring(end))
            setTimeout(() => {
                textarea.selectionStart = start + emoji.length
                textarea.selectionEnd = start + emoji.length
                textarea.focus()
            }, 0)
        } else {
            setDesc(prev => prev + emoji)
        }
    }

    const handleTagFriend = (friend) => {
        if (!taggedFriends.find(f => f._id === friend._id)) {
            setTaggedFriends(prev => [...prev, friend])
        }
        setTagSearch("")
    }

    const removeTag = (friendId) => {
        setTaggedFriends(prev => prev.filter(f => f._id !== friendId))
    }

    const submitHandler = async (e) => {
        e.preventDefault()
        setError("")

        if (!desc.trim() && !file) {
            setError("Please write something or add a photo before sharing.")
            return
        }

        setIsSharing(true)

        const newPost = {
            userId: user._id,
            desc: desc.trim(),
            location: location.trim(),
            tags: taggedFriends.map(f => ({ _id: f._id, userName: f.userName })),
        }

        try {
            if (file) {
                const data = new FormData()
                data.append("file", file)
                const uploadRes = await axios.post('/upload', data)
                newPost.img = uploadRes.data
            }

            await axios.post('/post', newPost)
            window.location.reload()
        } catch (err) {
            console.log(err)
            setError("Failed to share post. Please try again.")
            setIsSharing(false)
        }
    }

    const filteredFriends = friends.filter(f =>
        f.userName.toLowerCase().includes(tagSearch.toLowerCase()) &&
        !taggedFriends.find(t => t._id === f._id)
    )

    const profileSrc = user.profilePicture
        ? (user.profilePicture.startsWith('http') ? user.profilePicture : public_folder_path + "profiles/" + user.profilePicture)
        : public_folder_path + "profiles/no-avatar.png"

    return (
        <div className='share'>
            {/* Loading overlay while submitting */}
            {isSharing && (
                <div className="share-loading-overlay">
                    <div className="share-loading-spinner" />
                    <span>Sharing your post…</span>
                </div>
            )}

            <div className={`share-wrapper${isSharing ? " share-wrapper--disabled" : ""}`}>
                <div className="share-top">
                    <Link to={"/profile/" + user.userName}>
                        <img src={profileSrc} alt="profile-pic" className="share-profile-pic" />
                    </Link>
                    <textarea
                        ref={textareaRef}
                        placeholder={"What's in your mind, " + user.userName + "?"}
                        className="share-input"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        rows={1}
                        disabled={isSharing}
                    />
                </div>

                {taggedFriends.length > 0 && (
                    <div className="share-tags">
                        {taggedFriends.map(f => (
                            <span key={f._id} className="share-tag">
                                @{f.userName}
                                <button className="share-tag-remove" onClick={() => removeTag(f._id)} disabled={isSharing}>×</button>
                            </span>
                        ))}
                    </div>
                )}

                {location && (
                    <div className="share-location-display">
                        <Room fontSize="small" htmlColor="red" />
                        <span>{location}</span>
                        <button className="share-location-clear" onClick={() => setLocation("")} disabled={isSharing}>
                            <Cancel fontSize="small" />
                        </button>
                    </div>
                )}

                {showLocationInput && (
                    <div className="share-location-input">
                        <Room fontSize="small" htmlColor="red" />
                        <input
                            type="text"
                            placeholder="Add your location…"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setShowLocationInput(false); } }}
                        />
                        <button className="share-location-done" onClick={() => setShowLocationInput(false)}>Done</button>
                    </div>
                )}

                {showTagInput && (
                    <div className="share-tag-panel">
                        <div className="share-tag-search">
                            <Label fontSize="small" htmlColor="blue" />
                            <input
                                type="text"
                                placeholder="Search friends to tag…"
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                autoFocus
                            />
                            <button className="share-location-done" onClick={() => setShowTagInput(false)}>Done</button>
                        </div>
                        {filteredFriends.length > 0 ? (
                            <ul className="share-tag-list">
                                {filteredFriends.map(f => (
                                    <li key={f._id} className="share-tag-item" onClick={() => handleTagFriend(f)}>
                                        <img
                                            src={f.profilePicture
                                                ? (f.profilePicture.startsWith('http') ? f.profilePicture : public_folder_path + "profiles/" + f.profilePicture)
                                                : public_folder_path + "profiles/no-avatar.png"}
                                            alt=""
                                            className="share-tag-avatar"
                                        />
                                        <span>{f.userName}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="share-tag-empty">
                                {friends.length === 0 ? "No friends to tag yet" : "No matches found"}
                            </p>
                        )}
                    </div>
                )}

                {showEmojiPicker && (
                    <div className="share-emoji-picker" ref={emojiPickerRef}>
                        <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height={350} />
                    </div>
                )}

                <hr className="share-horizontal-line" />

                {file && (
                    <div className="share-container">
                        <img className="share-image" src={URL.createObjectURL(file)} alt="" />
                        <Cancel className="share-cancel-image" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} />
                        <span className="share-image-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                )}

                {error && <p className="share-error">{error}</p>}

                <form encType="multipart/form-data" method="POST" className="share-bottom" onSubmit={submitHandler}>
                    <div className="share-options">
                        <label htmlFor="file" className={`share-option${isSharing ? " share-option--disabled" : ""}`}>
                            <PermMedia htmlColor="tomato" className="share-icon" />
                            <span className="share-option-text">Photo/Video</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="file"
                                name="file"
                                accept=".png,.jpeg,.jpg"
                                onChange={handleOnChange}
                                onClick={(e) => { e.target.value = null }}
                                disabled={isSharing}
                            />
                        </label>
                        <div
                            className={`share-option${taggedFriends.length > 0 ? " share-option--active" : ""}${isSharing ? " share-option--disabled" : ""}`}
                            onClick={() => { if (!isSharing) { setShowTagInput(p => !p); setShowEmojiPicker(false); setShowLocationInput(false); } }}
                        >
                            <Label htmlColor="blue" className="share-icon" />
                            <span className="share-option-text">Tag{taggedFriends.length > 0 ? ` (${taggedFriends.length})` : ""}</span>
                        </div>
                        <div
                            className={`share-option${location ? " share-option--active" : ""}${isSharing ? " share-option--disabled" : ""}`}
                            onClick={() => { if (!isSharing) { setShowLocationInput(p => !p); setShowEmojiPicker(false); setShowTagInput(false); } }}
                        >
                            <Room htmlColor="red" className="share-icon" />
                            <span className="share-option-text">Location</span>
                        </div>
                        <div
                            className={`share-option${showEmojiPicker ? " share-option--active" : ""}${isSharing ? " share-option--disabled" : ""}`}
                            onClick={() => { if (!isSharing) { setShowEmojiPicker(p => !p); setShowTagInput(false); setShowLocationInput(false); } }}
                        >
                            <EmojiEmotions htmlColor="goldenrod" className="share-icon" />
                            <span className="share-option-text">Emoji</span>
                        </div>
                    </div>
                    <button className="share-button" type="submit" disabled={isSharing}>
                        {isSharing ? (
                            <>
                                <span className="share-btn-spinner" />
                                Sharing…
                            </>
                        ) : "Share"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Share
