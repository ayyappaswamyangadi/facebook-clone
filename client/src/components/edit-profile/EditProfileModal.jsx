import { useContext, useRef, useState } from "react";
import { Close, Crop, PhotoCamera } from "@mui/icons-material";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import ImageCropModal from "../image-crop/ImageCropModal";
import "./edit-profile.scss";

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const { user: currentUser, dispatch } = useContext(AuthContext);

  const [form, setForm] = useState({
    userName: user.userName || "",
    email: user.email || "",
    desc: user.desc || "",
    city: user.city || "",
    from: user.from || "",
    relationship: user.relationship || "",
  });
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Crop modal state
  const [cropSrc, setCropSrc] = useState(null);
  const [cropTarget, setCropTarget] = useState(null); // "profile" | "cover"
  const [fetchingCrop, setFetchingCrop] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const profileInputRef = useRef();
  const coverInputRef = useRef();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCrop = (file, target, inputRef) => {
    if (!validateImageFile(file, inputRef)) return;
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setCropTarget(target);
  };

  // Fetch an existing image URL into a blob so canvas crop has no CORS issues
  const openCropFromUrl = async (url, target) => {
    if (!url) return;
    setFetchingCrop(true);
    setError("");
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setCropSrc(blobUrl);
      setCropTarget(target);
    } catch (err) {
      setError("Could not load image for cropping. Try uploading a new photo.");
    } finally {
      setFetchingCrop(false);
    }
  };

  const handleCropDone = (blob) => {
    const name = cropTarget === "profile" ? "profile.jpg" : "cover.jpg";
    const file = new File([blob], name, { type: "image/jpeg" });
    if (cropTarget === "profile") setProfileFile(file);
    else setCoverFile(file);
    if (cropSrc && cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropTarget(null);
  };

  const handleCropCancel = () => {
    if (cropSrc && cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropTarget(null);
    if (cropTarget === "profile" && profileInputRef.current) profileInputRef.current.value = "";
    if (cropTarget === "cover" && coverInputRef.current) coverInputRef.current.value = "";
  };

  const validateImageFile = (file, inputRef) => {
    if (!file) return false;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(
        `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_IMAGE_MB} MB. Please choose a smaller image.`
      );
      if (inputRef?.current) inputRef.current.value = "";
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setSaving(true);
    try {
      const updates = { ...form };

      // relationship is a Number enum [1,2,3] on the server — never send "" or it causes a Mongoose ValidationError
      if (!updates.relationship) delete updates.relationship;

      if (profileFile) {
        const data = new FormData();
        data.append("file", profileFile);
        const res = await axios.post("/upload", data);
        // Server returns the Cloudinary URL directly as a string
        updates.profilePicture = res.data;
      }

      if (coverFile) {
        const data = new FormData();
        data.append("file", coverFile);
        const res = await axios.post("/upload", data);
        updates.coverPicture = res.data;
      }

      await axios.put("/users/" + currentUser._id, updates);

      dispatch({ type: "UPDATE_USER", payload: updates });
      onUpdate({ ...user, ...updates });

      axios.post("/notifications", {
        userId: currentUser._id,
        senderId: currentUser._id,
        type: "profileUpdate",
      }).catch(() => {});

      onClose();
    } catch (err) {
      console.log(err);
      const msg = err.response?.data;
      if (typeof msg === "string") setError(msg);
      else setError("Failed to save changes. Username or email may already be taken.");
    } finally {
      setSaving(false);
    }
  };

  const resolveProfilePic = (pic) => {
    if (!pic) return PF + "profiles/no-avatar.png";
    if (pic.startsWith("http")) return pic;
    return PF + "profiles/" + pic;
  };

  const resolveCoverPic = (pic) => {
    if (!pic) return PF + "profiles/no-cover.png";
    if (pic.startsWith("http")) return pic;
    if (pic.startsWith("covers/")) return PF + pic;
    return PF + "covers/" + pic;
  };

  const profilePreview = profileFile
    ? URL.createObjectURL(profileFile)
    : resolveProfilePic(user.profilePicture);

  const coverPreview = coverFile
    ? URL.createObjectURL(coverFile)
    : resolveCoverPic(user.coverPicture);

  // Show crop option only when there's a real (non-placeholder) image
  const hasCoverPic = !!(coverFile || user.coverPicture);
  const hasProfilePic = !!(profileFile || user.profilePicture);

  const relationships = [
    { value: "", label: "— Select —" },
    { value: 1, label: "Single" },
    { value: 2, label: "In a relationship" },
    { value: 3, label: "Married" },
  ];

  if (cropSrc) {
    return (
      <ImageCropModal
        imageSrc={cropSrc}
        aspect={cropTarget === "cover" ? 851 / 315 : 1}
        title={cropTarget === "cover" ? "Crop Cover Photo" : "Crop Profile Picture"}
        onCrop={handleCropDone}
        onCancel={handleCropCancel}
      />
    );
  }

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
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
            <div className="edit-cover-preview">
              <img
                src={coverPreview}
                alt="cover"
                className="edit-cover-img"
                onError={(e) => { e.target.onerror = null; e.target.src = "/assets/no-image.svg"; }}
              />
              <div className="edit-cover-overlay">
                <button
                  type="button"
                  className="edit-cover-action-btn"
                  onClick={() => coverInputRef.current.click()}
                  disabled={fetchingCrop}
                >
                  <PhotoCamera fontSize="small" />
                  <span>Upload New</span>
                </button>
                {hasCoverPic && (
                  <button
                    type="button"
                    className="edit-cover-action-btn"
                    onClick={() => openCropFromUrl(coverPreview, "cover")}
                    disabled={fetchingCrop}
                  >
                    <Crop fontSize="small" />
                    <span>{fetchingCrop && cropTarget === "cover" ? "Loading…" : "Crop / Reposition"}</span>
                  </button>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={coverInputRef}
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) openCrop(f, "cover", coverInputRef);
              }}
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
                onError={(e) => { e.target.onerror = null; e.target.src = PF + "profiles/no-avatar.png"; }}
              />
              <button
                type="button"
                className="edit-avatar-btn edit-avatar-upload-btn"
                onClick={() => profileInputRef.current.click()}
                title="Upload new photo"
                disabled={fetchingCrop}
              >
                <PhotoCamera fontSize="small" />
              </button>
              {hasProfilePic && (
                <button
                  type="button"
                  className="edit-avatar-btn edit-avatar-crop-btn"
                  onClick={() => openCropFromUrl(profilePreview, "profile")}
                  title="Crop / reposition"
                  disabled={fetchingCrop}
                >
                  <Crop fontSize="small" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={profileInputRef}
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) openCrop(f, "profile", profileInputRef);
              }}
            />
          </div>

          {/* Account fields */}
          <div className="edit-section-divider">
            <p className="edit-section-label">Account Details</p>
          </div>
          <div className="edit-fields">
            <div className="edit-field-group">
              <label>Username</label>
              <input
                type="text"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder="Username"
                minLength={3}
                required
              />
            </div>

            <div className="edit-field-group">
              <label>Email <span className="edit-optional">(cannot be changed)</span></label>
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className="edit-field-readonly"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Bio / profile details */}
          <div className="edit-section-divider">
            <p className="edit-section-label">Profile Details</p>
          </div>
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
            <button type="button" className="edit-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="edit-btn-save" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
