import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext"
import "./Topbar.scss";
import { Search, Person, Chat, Notifications } from '@mui/icons-material'
import { Link } from "react-router-dom";

const Topbar = () => {
  const { user } = useContext(AuthContext);
  const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;

  return <div className="topBarContainer">

    <div className="topBarLeft">
      <Link className="logo" to="/">facebook</Link>
    </div>

    <div className="topBarCenter">
      <div className="searchBar">
        <Search className="searchIcon" />
        <input type="text" placeholder="Search for friend, post, video" className="searchInput" />
      </div>
    </div>

    <div className="topBarRight">
      <div className="topBarLinks">
        <span className="topBarLink">Homepage</span>
        <span className="topBarLink">Timeline</span>
      </div>
      <div className="topBarIcons">
        <div className="topBarIconItem">
          <Person />
          <span className="topBarIconBadge">1</span>
        </div>
        <div className="topBarIconItem">

          <Link to="/messenger" >
            <Chat className="chat" />
            <span className="topBarIconBadge">13</span>
          </Link>
        </div>
        <div className="topBarIconItem">
          <Notifications />
          <span className="topBarIconBadge">99</span>
        </div>
      </div>
      <Link to={`/profile/${user.userName}`}>
        <img src={user.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : public_folder_path + "profiles/" + user.profilePicture) : public_folder_path + "profiles/no-avatar.png"} alt="profile-picture" className="topBarImg" />
      </Link>
    </div>

  </div>;
};

export default Topbar;
