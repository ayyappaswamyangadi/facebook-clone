import "./OnlineFriends.scss"

const OnlineFriend = ({ user }) => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER

    return (
        <li className="right-bar-friend">
            <div className="right-bar-profile-img">
                <img src={public_folder_path + user.profilePicture} alt="" className="profile-img" />
                <span className="right-bar-online"></span>
            </div>
            <span className="right-bar-user-name">{user.userName}</span>
        </li>
    )
}

export default OnlineFriend