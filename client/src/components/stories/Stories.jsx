import { useContext, useEffect, useRef, useState } from "react";
import { Add, Close, PlayArrow } from "@mui/icons-material";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { StoriesBarSkeleton } from "../loaders/Loaders";
import "./stories.scss";

const Stories = () => {
  const { user } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const [storyGroups, setStoryGroups] = useState({});
  const [userMap, setUserMap] = useState({});
  const [viewStory, setViewStory] = useState(null); // { stories: [], index: 0 }
  const [showCreate, setShowCreate] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [storyDesc, setStoryDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingStories, setLoadingStories] = useState(true);
  const fileRef = useRef();
  const progressTimer = useRef();

  // Fetch timeline stories
  useEffect(() => {
    const fetchStories = async () => {
      setLoadingStories(true);
      try {
        const res = await axios.get("/stories/timeline/" + user._id);
        setStoryGroups(res.data);

        // Fetch user info for each userId in the groups
        const ids = Object.keys(res.data);
        const userInfos = await Promise.all(
          ids.map((id) => axios.get("/users?userId=" + id))
        );
        const map = {};
        userInfos.forEach((r, i) => {
          map[ids[i]] = r.data;
        });
        setUserMap(map);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingStories(false);
      }
    };
    fetchStories();
  }, [user._id]);

  // Auto-advance viewer
  useEffect(() => {
    if (!viewStory) return;
    progressTimer.current = setTimeout(() => {
      if (viewStory.index < viewStory.stories.length - 1) {
        setViewStory((prev) => ({ ...prev, index: prev.index + 1 }));
      } else {
        setViewStory(null);
      }
    }, 5000);
    return () => clearTimeout(progressTimer.current);
  }, [viewStory]);

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!storyFile && !storyDesc.trim()) return;
    setUploading(true);
    try {
      let img = "";
      if (storyFile) {
        const data = new FormData();
        data.append("file", storyFile);
        const uploadRes = await axios.post("/upload", data);
        img = uploadRes.data;
      }
      await axios.post("/stories", {
        userId: user._id,
        img,
        desc: storyDesc,
      });
      setShowCreate(false);
      setStoryFile(null);
      setStoryDesc("");
      window.location.reload();
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const openStories = (userId) => {
    setViewStory({ stories: storyGroups[userId], index: 0, userId });
  };

  const profileSrc = (uid) => {
    const u = userMap[uid];
    if (!u) return public_folder + "profiles/no-avatar.png";
    if (!u.profilePicture) return public_folder + "profiles/no-avatar.png";
    return u.profilePicture.startsWith("http")
      ? u.profilePicture
      : public_folder + "profiles/" + u.profilePicture;
  };

  const storySrc = (story) => {
    if (!story.img) return null;
    if (story.img.startsWith("http")) return story.img;
    return story.img.startsWith("stories/")
      ? public_folder + story.img
      : public_folder + "stories/" + story.img;
  };

  if (loadingStories) return <StoriesBarSkeleton count={5} />;

  return (
    <>
      <div className="stories-bar">
        {/* Add your story */}
        <div className="story-card story-add-card" onClick={() => setShowCreate(true)}>
          <img
            src={
              user.profilePicture
                ? user.profilePicture.startsWith("http")
                  ? user.profilePicture
                  : public_folder + "profiles/" + user.profilePicture
                : public_folder + "profiles/no-avatar.png"
            }
            alt="add"
            className="story-card-bg"
          />
          <div className="story-add-btn">
            <Add />
          </div>
          <span className="story-card-name">Add Story</span>
        </div>

        {/* Friends' stories */}
        {Object.keys(storyGroups).map((uid) => (
          <div
            key={uid}
            className="story-card"
            onClick={() => openStories(uid)}
          >
            {storySrc(storyGroups[uid][0]) ? (
              <img
                src={storySrc(storyGroups[uid][0])}
                alt="story"
                className="story-card-bg"
              />
            ) : (
              <div className="story-card-bg story-text-bg">
                <span>{storyGroups[uid][0].desc}</span>
              </div>
            )}
            <img src={profileSrc(uid)} alt="user" className="story-card-avatar" />
            <span className="story-card-name">
              {userMap[uid]?.userName || "..."}
            </span>
            {storyGroups[uid].length > 1 && (
              <span className="story-card-count">{storyGroups[uid].length}</span>
            )}
          </div>
        ))}
      </div>

      {/* Story Viewer */}
      {viewStory && (
        <div className="story-viewer-overlay" onClick={() => setViewStory(null)}>
          <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
            {/* Progress bars */}
            <div className="story-progress-bars">
              {viewStory.stories.map((_, i) => (
                <div key={i} className="story-progress-track">
                  <div
                    className={`story-progress-fill ${
                      i < viewStory.index
                        ? "complete"
                        : i === viewStory.index
                        ? "active"
                        : ""
                    }`}
                  />
                </div>
              ))}
            </div>
            {/* Header */}
            <div className="story-viewer-header">
              <img
                src={profileSrc(viewStory.userId)}
                alt="user"
                className="story-viewer-avatar"
              />
              <span className="story-viewer-name">
                {userMap[viewStory.userId]?.userName}
              </span>
              <button
                className="story-viewer-close"
                onClick={() => setViewStory(null)}
              >
                <Close />
              </button>
            </div>
            {/* Content */}
            <div className="story-viewer-content">
              {storySrc(viewStory.stories[viewStory.index]) ? (
                <img
                  src={storySrc(viewStory.stories[viewStory.index])}
                  alt="story"
                  className="story-viewer-img"
                />
              ) : (
                <div className="story-viewer-text-only">
                  <p>{viewStory.stories[viewStory.index].desc}</p>
                </div>
              )}
              {viewStory.stories[viewStory.index].desc && storySrc(viewStory.stories[viewStory.index]) && (
                <div className="story-viewer-desc">
                  {viewStory.stories[viewStory.index].desc}
                </div>
              )}
            </div>
            {/* Navigation */}
            <button
              className="story-nav story-nav-prev"
              onClick={() =>
                viewStory.index > 0 &&
                setViewStory((p) => ({ ...p, index: p.index - 1 }))
              }
            >
              ‹
            </button>
            <button
              className="story-nav story-nav-next"
              onClick={() =>
                viewStory.index < viewStory.stories.length - 1
                  ? setViewStory((p) => ({ ...p, index: p.index + 1 }))
                  : setViewStory(null)
              }
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreate && (
        <div className="story-create-overlay" onClick={() => setShowCreate(false)}>
          <div className="story-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="story-create-header">
              <h3>Create Story</h3>
              <button onClick={() => setShowCreate(false)}>
                <Close />
              </button>
            </div>
            <form onSubmit={handleCreateStory}>
              <div className="story-create-preview">
                {storyFile ? (
                  <img
                    src={URL.createObjectURL(storyFile)}
                    alt="preview"
                    className="story-create-preview-img"
                  />
                ) : (
                  <div
                    className="story-create-placeholder"
                    onClick={() => fileRef.current.click()}
                  >
                    <PlayArrow fontSize="large" />
                    <span>Add Photo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                ref={fileRef}
                style={{ display: "none" }}
                onChange={(e) => setStoryFile(e.target.files[0])}
              />
              {storyFile && (
                <button
                  type="button"
                  className="story-change-photo-btn"
                  onClick={() => fileRef.current.click()}
                >
                  Change Photo
                </button>
              )}
              <textarea
                className="story-create-desc"
                placeholder="Add a description…"
                value={storyDesc}
                onChange={(e) => setStoryDesc(e.target.value)}
                maxLength={200}
              />
              <button
                type="submit"
                className="story-create-submit"
                disabled={uploading || (!storyFile && !storyDesc.trim())}
              >
                {uploading ? "Sharing…" : "Share Story"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;
