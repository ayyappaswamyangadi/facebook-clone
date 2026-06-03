import "./post.scss"
import { MoreVert, Edit, Delete, Close, Room } from "@mui/icons-material";
import { useContext, useState, useEffect, useRef } from "react"
import axios from 'axios'
import moment from 'moment'
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Comments from "../comments/Comments";

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const NO_AVATAR = PF + "profiles/no-avatar.png";
const NO_IMAGE = "/assets/no-image.svg";

const Post = ({ post, onDelete }) => {
    const { user: currentUser } = useContext(AuthContext)
    const [user, setUser] = useState({});
    const [like, setLike] = useState(post.likes.length)
    const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser._id))
    const [showComments, setShowComments] = useState(false)
    const [commentCount, setCommentCount] = useState(post.commentCount ?? 0)
    const [showMenu, setShowMenu] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editDesc, setEditDesc] = useState(post.desc || "")
    const [postDesc, setPostDesc] = useState(post.desc || "")
    const menuRef = useRef()

    const isOwnPost = post.userId === currentUser._id

    useEffect(() => {
        const fetchUser = async () => {
            const res = await axios.get(`/users?userId=${post.userId}`)
            setUser(res.data)
        }
        fetchUser()
    }, [post.userId])

    useEffect(() => {
        const fetchCommentCount = async () => {
            try {
                const res = await axios.get("/comments/" + post._id)
                setCommentCount(res.data.length)
            } catch (err) {}
        }
        fetchCommentCount()
    }, [post._id])

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const likeHandler = () => {
        try {
            axios.put("/post/" + post._id + "/like", { userId: currentUser._id })
        } catch (err) {}
        setLike(isLiked ? like - 1 : like + 1)
        setIsLiked(!isLiked)
    }

    const handleDelete = async () => {
        setShowMenu(false)
        if (!window.confirm("Delete this post?")) return
        try {
            await axios.delete("/post/" + post._id, { data: { userId: currentUser._id } })
            onDelete && onDelete(post._id)
        } catch (err) {
            console.log(err)
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.put("/post/" + post._id, { userId: currentUser._id, desc: editDesc })
            setPostDesc(editDesc)
            setShowEditModal(false)
        } catch (err) {
            console.log(err)
        }
    }

    const displayName = isOwnPost ? "You" : (user.userName || "")

    const profileSrc = user.profilePicture
        ? (user.profilePicture.startsWith('http')
            ? user.profilePicture
            : PF + "profiles/" + user.profilePicture)
        : NO_AVATAR

    return (
        <div className="post">
            <div className="post-wrapper">
                <div className="post-top">
                    <div className="post-top-left">
                        <Link to={`/profile/${user.userName}`} className="post-links">
                            <img
                                src={profileSrc}
                                alt=""
                                className="post-profile-img"
                                onError={(e) => { e.target.onerror = null; e.target.src = NO_AVATAR; }}
                            />
                        </Link>
                        <Link to={`/profile/${user.userName}`} className="post-links">
                            <span className="post-user-name">{displayName}</span>
                        </Link>
                        <span className="post-date">{moment.parseZone(post.createdAt).fromNow()}</span>
                    </div>

                    {isOwnPost && (
                        <div className="post-top-right" ref={menuRef}>
                            <div className="post-menu-trigger" onClick={() => setShowMenu(p => !p)}>
                                <MoreVert />
                            </div>
                            {showMenu && (
                                <div className="post-menu">
                                    <button className="post-menu-item" onClick={() => { setShowMenu(false); setEditDesc(postDesc); setShowEditModal(true); }}>
                                        <Edit fontSize="small" /> Edit post
                                    </button>
                                    <button className="post-menu-item post-menu-item--danger" onClick={handleDelete}>
                                        <Delete fontSize="small" /> Delete post
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {!isOwnPost && (
                        <div className="post-top-right">
                            <MoreVert />
                        </div>
                    )}
                </div>

                <div className="post-center">
                    <span className="post-text">{postDesc}</span>

                    {/* Tagged friends */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="post-tags">
                            <span className="post-tags-label">with </span>
                            {post.tags.map((t, i) => (
                                <span key={t._id || i}>
                                    <Link
                                        to={`/profile/${t.userName || t}`}
                                        className="post-tag-link"
                                    >
                                        @{t.userName || t}
                                    </Link>
                                    {i < post.tags.length - 1 && ", "}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Location */}
                    {post.location && (
                        <div className="post-location">
                            <Room style={{ fontSize: 14 }} htmlColor="#e41e3f" />
                            <span>{post.location}</span>
                        </div>
                    )}

                    {post.img && (
                        <img
                            src={post.img.startsWith('http') ? post.img : PF + post.img}
                            alt=""
                            className="post-img"
                            onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE; }}
                        />
                    )}
                </div>

                <div className="post-bottom">
                    <div className="post-bottom-left">
                        <img
                            src={`${PF}like.png`}
                            alt=""
                            className={`like-img${isLiked ? " liked-active" : ""}`}
                            onClick={likeHandler}
                        />
                        <img
                            src={`${PF}heart.png`}
                            alt=""
                            className="heart-img"
                            onClick={likeHandler}
                        />
                        <span className="post-like-counter">{like} {like === 1 ? "person" : "people"} like this</span>
                    </div>
                    <div className="post-bottom-right">
                        <span
                            className="post-comment-text"
                            onClick={() => setShowComments(prev => !prev)}
                        >
                            {commentCount} {commentCount === 1 ? "comment" : "comments"}
                        </span>
                    </div>
                </div>

                {showComments && (
                    <Comments
                        postId={post._id}
                        postOwnerId={post.userId}
                        onLoaded={setCommentCount}
                    />
                )}
            </div>

            {/* Edit modal */}
            {showEditModal && (
                <div className="post-edit-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="post-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="post-edit-header">
                            <h3>Edit Post</h3>
                            <button className="post-edit-close" onClick={() => setShowEditModal(false)}>
                                <Close />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="post-edit-form">
                            <textarea
                                className="post-edit-textarea"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                rows={4}
                                placeholder="What's on your mind?"
                                autoFocus
                            />
                            <div className="post-edit-actions">
                                <button type="button" className="post-edit-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="post-edit-save">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Post
