import "./OnlineFriends.scss"

const NO_AVATAR = process.env.REACT_APP_PUBLIC_FOLDER + "profiles/no-avatar.png"

const OnlineFriend = ({ user }) => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER

    const src = user.profilePicture
        ? public_folder_path + user.profilePicture.replace(/^\//, "")
        : NO_AVATAR

    return (
        <li className="right-bar-friend">
            <div className="right-bar-profile-img">
                <img
                    src={src}
                    alt={user.userName}
                    className="profile-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = NO_AVATAR; }}
                />
                <span className="right-bar-online"></span>
            </div>
            <span className="right-bar-user-name">{user.userName}</span>
        </li>
    )
}

export default OnlineFriend