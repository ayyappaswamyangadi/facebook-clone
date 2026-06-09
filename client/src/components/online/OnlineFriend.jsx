import "./OnlineFriends.scss"

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

const OnlineFriend = ({ user }) => {
    const src = user.profilePicture
        ? (user.profilePicture.startsWith('http')
            ? user.profilePicture
            : PF + "profiles/" + user.profilePicture.replace(/^profiles\//, ""))
        : PLACEHOLDER_AVATAR;

    return (
        <li className="right-bar-friend">
            <div className="right-bar-profile-img">
                <img
                    src={src}
                    alt={user.userName}
                    className="profile-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
                />
                <span className="right-bar-online"></span>
            </div>
            <span className="right-bar-user-name">{user.userName}</span>
        </li>
    )
}

export default OnlineFriend