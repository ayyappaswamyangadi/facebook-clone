import axios from "axios"
import { useEffect, useState, useContext } from "react"
import NewsFeed from "../../components/news-feed/NewsFeed"
import RightBar from "../../components/right-bar/RightBar"
import Sidebar from "../../components/side-bar/Sidebar"
import Topbar from "../../components/topbar/Topbar"
import EditProfileModal from "../../components/edit-profile/EditProfileModal"
import { AuthContext } from "../../components/context/AuthContext"
import { PhotoCamera } from "@mui/icons-material"
import "./profile.scss"
import { useParams } from 'react-router'

const PF = process.env.REACT_APP_PUBLIC_FOLDER;

const Profile = () => {
    const [user, setUser] = useState({})
    const [showEdit, setShowEdit] = useState(false)
    const { user: currentUser } = useContext(AuthContext)
    const userName = useParams().userName;

    useEffect(() => {
        const fetchUser = async () => {
            const response = await axios.get(`/users?userName=${userName}`);
            setUser(response.data)
        }
        fetchUser()
    }, [userName])

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
                        <div className="profile-cover">
                            {/* Cover image */}
                            <img
                                src={coverSrc}
                                alt=""
                                className="profile-cover-img"
                                onError={(e) => { e.target.onerror = null; e.target.src = "/assets/no-image.svg"; }}
                            />
                            {/* Camera button on cover – only for own profile */}
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

                            {/* Profile picture */}
                            <div className="profile-user-img-wrapper">
                                <img
                                    src={profileSrc}
                                    alt=""
                                    className="profile-user-img"
                                    onError={(e) => { e.target.onerror = null; e.target.src = PF + "profiles/no-avatar.png"; }}
                                />
                                {/* Camera button on avatar – only for own profile */}
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
                    </div>
                    <div className="profile-right-bottom">
                        <NewsFeed userName={userName} />
                        <RightBar user={user} />
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
