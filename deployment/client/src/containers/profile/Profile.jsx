import axios from "axios";
import { useContext, useEffect, useState } from "react";
import NewsFeed from "../../components/news-feed/NewsFeed";
import RightBar from "../../components/right-bar/RightBar";
import Sidebar from "../../components/side-bar/Sidebar";
import Topbar from "../../components/topbar/Topbar";
import EditProfileModal from "../../components/edit-profile/EditProfileModal";
import "./profile.scss";
import { useParams } from "react-router";
import { AuthContext } from "../../components/context/AuthContext";
import { Edit } from "@mui/icons-material";

const Profile = () => {
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const userName = useParams().userName;
  const isOwnProfile = currentUser.userName === userName;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users?userName=" + userName);
        setProfileUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [userName]);

  const coverSrc = () => {
    if (!profileUser.coverPicture) {
      return public_folder + "profiles/no-cover.png";
    }
    // Support both: bare filename (legacy) and "covers/filename" (new)
    if (profileUser.coverPicture.startsWith("covers/")) {
      return public_folder + profileUser.coverPicture;
    }
    return public_folder + profileUser.coverPicture;
  };

  const profileSrc = () => {
    return profileUser.profilePicture
      ? public_folder + "profiles/" + profileUser.profilePicture
      : public_folder + "profiles/no-avatar.png";
  };

  const handleProfileUpdate = (updatedData) => {
    setProfileUser((prev) => ({ ...prev, ...updatedData }));
    // Update the auth context user too if it's own profile
    if (isOwnProfile) {
      dispatch({ type: "UPDATE_USER", payload: updatedData });
    }
  };

  return (
    <div>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profile-right">
          {/* Cover + avatar */}
          <div className="profile-right-top">
            <div className="profile-cover">
              <img
                src={coverSrc()}
                alt="cover"
                className="profile-cover-img"
              />
              <img
                src={profileSrc()}
                alt={profileUser.userName}
                className="profile-user-img"
              />
            </div>
            <div className="profile-info">
              <div className="profile-info-header">
                <div>
                  <h4 className="profile-info-name">{profileUser.userName}</h4>
                  {profileUser.desc && (
                    <span className="profile-info-desc">{profileUser.desc}</span>
                  )}
                </div>
                {isOwnProfile && (
                  <button
                    className="profile-edit-btn"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit fontSize="small" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom: feed + info */}
          <div className="profile-right-bottom">
            <NewsFeed userName={userName} />
            <RightBar user={profileUser} />
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Profile;
