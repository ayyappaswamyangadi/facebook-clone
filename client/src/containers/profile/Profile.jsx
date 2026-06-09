import axios from "axios"
import { useEffect, useState, useContext } from "react"
import NewsFeed from "../../components/news-feed/NewsFeed"
import RightBar from "../../components/right-bar/RightBar"
import Sidebar from "../../components/side-bar/Sidebar"
import Topbar from "../../components/topbar/Topbar"
import EditProfileModal from "../../components/edit-profile/EditProfileModal"
import { AuthContext } from "../../components/context/AuthContext"
import { ProfileHeaderSkeleton, PostSkeleton } from "../../components/loaders/Loaders"
import { PhotoCamera, VisibilityOff, Visibility } from "@mui/icons-material"
import Post from "../../components/post/post"
import "./profile.scss"
import { useParams } from 'react-router'

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

const Profile = () => {
    const [user, setUser] = useState({})
    const [loadingUser, setLoadingUser] = useState(true)
    const [showEdit, setShowEdit] = useState(false)
    const [activeTab, setActiveTab] = useState("posts")
    const [hiddenPosts, setHiddenPosts] = useState([])
    const [loadingHidden, setLoadingHidden] = useState(false)
    const { user: currentUser } = useContext(AuthContext)
    const userName = useParams().userName;

    useEffect(() => {
        const fetchUser = async () => {
            setLoadingUser(true)
            try {
                const response = await axios.get(`/users?userName=${userName}`);
                setUser(response.data)
            } catch (err) {
                console.log(err)
            } finally {
                setLoadingUser(false)
            }
        }
        fetchUser()
    }, [userName])

    useEffect(() => {
        if (activeTab === "hidden" && currentUser) {
            const fetchHidden = async () => {
                setLoadingHidden(true)
                try {
                    const res = await axios.get("/post/hidden/" + currentUser._id)
                    setHiddenPosts(res.data)
                } catch (err) {
                    console.log(err)
                } finally {
                    setLoadingHidden(false)
                }
            }
            fetchHidden()
        }
    }, [activeTab, currentUser])

    const handleUnhide = async (postId) => {
        try {
            await axios.put("/post/" + postId + "/unhide", { userId: currentUser._id })
            setHiddenPosts(prev => prev.filter(p => p._id !== postId))
        } catch (err) {
            console.log(err)
        }
    }

    const isOwnProfile = currentUser && user._id && currentUser._id === user._id

    const coverSrc = user.coverPicture
        ? (user.coverPicture.startsWith('http') ? user.coverPicture : PF + user.coverPicture)
        : PF + "profiles/no-cover.png"

    const profileSrc = user.profilePicture
        ? (user.profilePicture.startsWith('http') ? user.profilePicture : PF + "profiles/" + user.profilePicture)
        : PF + "profiles/no-avatar.png"

    return (
        <div>
            <Topbar />
            <div className="profile">
                <Sidebar />
                <div className="profile-right">
                    <div className="profile-right-top">
                        {loadingUser ? (
                            <ProfileHeaderSkeleton />
                        ) : (
                            <>
                                <div className="profile-cover">
                                    <img
                                        src={coverSrc}
                                        alt=""
                                        className="profile-cover-img"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='250' viewBox='0 0 800 250'%3E%3Crect width='800' height='250' fill='%23e4e6e9'/%3E%3C/svg%3E"; }}
                                    />
                                    {isOwnProfile && (
                                        <button
                                            className="profile-cover-edit-btn"
                                            onClick={() => setShowEdit(true)}
                                            title="Edit cover photo"
                                        >
                                            <PhotoCamera style={{ fontSize: 16 }} />
                                            <span>Edit Cover</span>
                                        </button>
                                    )}
                                    <div className="profile-user-img-wrapper">
                                        <img
                                            src={profileSrc}
                                            alt=""
                                            className="profile-user-img"
                                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
                                        />
                                        {isOwnProfile && (
                                            <button
                                                className="profile-avatar-edit-btn"
                                                onClick={() => setShowEdit(true)}
                                                title="Edit profile photo"
                                            >
                                                <PhotoCamera style={{ fontSize: 14 }} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="profile-info">
                                    <h4 className="profile-info-name">{user.userName}</h4>
                                    <span className="profile-info-desc">{user.desc}</span>
                                    {isOwnProfile && (
                                        <button
                                            className="profile-edit-btn"
                                            onClick={() => setShowEdit(true)}
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {isOwnProfile && (
                                    <div className="profile-tabs">
                                        <button
                                            className={`profile-tab${activeTab === "posts" ? " active" : ""}`}
                                            onClick={() => setActiveTab("posts")}
                                        >
                                            Posts
                                        </button>
                                        <button
                                            className={`profile-tab${activeTab === "hidden" ? " active" : ""}`}
                                            onClick={() => setActiveTab("hidden")}
                                        >
                                            <VisibilityOff style={{ fontSize: 16, marginRight: 4 }} />
                                            Hidden Posts
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="profile-right-bottom">
                        {activeTab === "posts" ? (
                            <>
                                <NewsFeed userName={userName} />
                                <RightBar user={user} />
                            </>
                        ) : (
                            <div className="profile-hidden-posts">
                                {loadingHidden ? (
                                    <>
                                        <PostSkeleton />
                                        <PostSkeleton />
                                    </>
                                ) : hiddenPosts.length === 0 ? (
                                    <div className="profile-hidden-empty">
                                        <Visibility style={{ fontSize: 48, color: "#bcc0c4" }} />
                                        <p>No hidden posts</p>
                                    </div>
                                ) : (
                                    hiddenPosts.map(post => (
                                        <div key={post._id} className="profile-hidden-post-wrapper">
                                            <Post post={post} />
                                            <button
                                                className="profile-unhide-btn"
                                                onClick={() => handleUnhide(post._id)}
                                            >
                                                <Visibility style={{ fontSize: 15 }} /> Unhide
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showEdit && (
                <EditProfileModal
                    user={user}
                    onClose={() => setShowEdit(false)}
                    onUpdate={(updated) => setUser(updated)}
                />
            )}
        </div>
    )
}

export default Profile
