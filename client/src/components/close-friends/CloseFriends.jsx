import "./CloseFriends.scss"


const CloseFriends = ({ user }) => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER

    return (
        <li className="side-bar-friend">
            <img
                src={user.profilePicture
                    ? (user.profilePicture.startsWith('http')
                        ? user.profilePicture
                        : public_folder_path + user.profilePicture)
                    : public_folder_path + "profiles/no-avatar.png"}
                alt={user.userName}
                className="side-bar-friend-img"
            />
            <span className="side-bar-friend-name">{user.userName}</span>
        </li>
    )
}

export default CloseFriends