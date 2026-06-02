import axios from "axios"
import { useEffect, useState } from "react"
import NewsFeed from "../../components/news-feed/NewsFeed"
import RightBar from "../../components/right-bar/RightBar"
import Sidebar from "../../components/side-bar/Sidebar"
import Topbar from "../../components/topbar/Topbar"
import "./profile.scss"
import { useParams } from 'react-router'

const Profile = () => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;
    const [user, setUser] = useState({})
    const userName = useParams().userName;

    useEffect(() => {
        const fetchUser = async () => {
            const response = await axios.get(`/users?userName=${userName}`);
            setUser(response.data)
        }
        fetchUser()
    }, [userName])
    return (
        <div>
            <Topbar />
            <div className="profile">
                <Sidebar />
                <div className="profile-right">
                    <div className="profile-right-top">
                        <div className="profile-cover">
                            <img src={user.coverPicture ? (user.coverPicture.startsWith('http') ? user.coverPicture : public_folder_path + user.coverPicture) : public_folder_path + "profiles/no-cover.png"} alt="" className="profile-cover-img" />
                            <img src={user.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : public_folder_path + "profiles/" + user.profilePicture) : public_folder_path + "profiles/no-avatar.png"} alt="" className="profile-user-img" />
                        </div>
                        <div className="profile-info">
                            <h4 className="profile-info-name">{user.userName}</h4>
                            <span className="profile-info-desc">{user.desc}</span>
                        </div>
                    </div>
                    <div className="profile-right-bottom">
                        <NewsFeed userName={userName} />
                        <RightBar user={user} />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Profile