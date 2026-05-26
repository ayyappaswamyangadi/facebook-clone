import { useContext, useRef, useState } from "react";
import { Close, PhotoCamera } from "@mui/icons-material";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./edit-profile.scss";

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;

  const [form, setForm] = useState({
    desc: user.desc || "",
    city: user.city || "",
    from: user.from || "",
    relationship: user.relationship || "",
  });
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const profileInputRef = useRef();
  const coverInputRef = useRef();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updates = { ...form };

      // Upload profile picture if changed
      if (profileFile) {
        const data = new FormData();
        data.append("file", profileFile, Date.now() + "_" + profileFile.name);
        const res = await axios.post("/upload/profile", data);
        updates.profilePicture = res.data.filename;
      }

      // Upload cover picture if changed
      if (coverFile) {
        const data = new FormData();
        data.append("file", coverFile, Date.now() + "_" + coverFile.name);
        const res = await axios.post("/upload/cover", data);
        updates.coverPicture = "covers/" + res.data.filename;
      }

      await axios.put("/users/" + currentUser._id, updates);

      // Update local context
      dispatch({ type: "UPDATE_USER", payload: updates });
      onUpdate({ ...user, ...updates });
      onClose();
    } catch (err) {
      console.log(err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const profilePreview = profileFile
    ? URL.createObjectURL(profileFile)
    : user.profilePicture
    ? public_folder + "profiles/" + user.profilePicture
    : public_folder + "profiles/no-avatar.png";

  const coverPreview = coverFile
    ? URL.createObjectURL(coverFile)
    : user.coverPicture
    ? user.coverPicture.startsWith("covers/")
      ? public_folder + user.coverPicture
      : public_folder + "covers/" + user.coverPicture
    : public_folder + "profiles/no-cover.png";

  const relationships = [
    { value: "", label: "— Select —" },
    { value: 1, label: "Single" },
    { value: 2, label: "In a relationship" },
    { value: 3, label: "Married" },
  ];

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-profile-header">
          <h2>Edit Profile</h2>
          <button className="edit-profile-close" onClick={onClose}>
            <Close />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Cover photo */}
          <div className="edit-cover-section">
            <p className="edit-section-label">Cover Photo</p>
            <div
              className="edit-cover-preview"
              onClick={() => coverInputRef.current.click()}
            >
              <img src={coverPreview} alt="cover" className="edit-cover-img" />
              <div className="edit-cover-overlay">
                <PhotoCamera />
                <span>Change Cover Photo</span>
              </div>
            </div>
            <input
              type="file"
              ref={coverInputRef}
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => setCoverFile(e.target.files[0])}
            />
          </div>

          {/* Profile picture */}
          <div className="edit-avatar-section">
            <p className="edit-section-label">Profile Picture</p>
            <div className="edit-avatar-wrapper">
              <img
                src={profilePreview}
                alt="profile"
                className="edit-avatar-img"
              />
              <button
                type="button"
                className="edit-avatar-btn"
                onClick={() => profileInputRef.current.click()}
              >
                <PhotoCamera fontSize="small" />
              </button>
            </div>
            <input
              type="file"
              ref={profileInputRef}
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => setProfileFile(e.target.files[0])}
            />
          </div>

          {/* Bio fields */}
          <div className="edit-fields">
            <div className="edit-field-group">
              <label>Bio</label>
              <textarea
                name="desc"
                value={form.desc}
                onChange={handleChange}
                placeholder="Describe yourself…"
                maxLength={100}
                rows={3}
              />
              <span className="edit-char-count">{form.desc.length}/100</span>
            </div>

            <div className="edit-field-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Current city"
              />
            </div>

            <div className="edit-field-group">
              <label>Hometown</label>
              <input
                type="text"
                name="from"
                value={form.from}
                onChange={handleChange}
                placeholder="Hometown"
              />
            </div>

            <div className="edit-field-group">
              <label>Relationship Status</label>
              <select
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
              >
                {relationships.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="edit-error">{error}</p>}

          <div className="edit-profile-actions">
            <button
              type="button"
              className="edit-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-btn-save"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
