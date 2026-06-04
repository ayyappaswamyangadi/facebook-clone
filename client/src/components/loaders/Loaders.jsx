import "./loaders.scss";

export const Spinner = ({ size = "md", fullPage = false, label = "" }) => (
  <div className={`spinner-container${fullPage ? " spinner-container--fullpage" : ""}`}>
    <div className={`spinner spinner--${size}`} />
    {fullPage && label && <span className="spinner-label">{label}</span>}
  </div>
);

export const PostSkeleton = () => (
  <div className="post-skeleton">
    <div className="post-skeleton__header">
      <div className="skeleton post-skeleton__avatar" />
      <div className="post-skeleton__meta">
        <div className="skeleton post-skeleton__name" />
        <div className="skeleton post-skeleton__date" />
      </div>
    </div>
    <div className="skeleton post-skeleton__text-1" />
    <div className="skeleton post-skeleton__text-2" />
    <div className="skeleton post-skeleton__image" />
    <div className="post-skeleton__actions">
      <div className="skeleton post-skeleton__actions-btn" />
      <div className="skeleton post-skeleton__actions-btn" />
    </div>
  </div>
);

export const StoriesBarSkeleton = ({ count = 4 }) => (
  <div className="story-skeleton-bar">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton story-skeleton" />
    ))}
  </div>
);

export const ConversationSkeleton = () => (
  <div className="conversation-skeleton">
    <div className="skeleton conversation-skeleton__avatar" />
    <div className="skeleton conversation-skeleton__name" />
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <div>
    <div className="skeleton profile-header-skeleton__cover" />
    <div className="skeleton profile-header-skeleton__avatar" />
    <div className="profile-header-skeleton__info">
      <div className="skeleton profile-header-skeleton__name" />
      <div className="skeleton profile-header-skeleton__bio" />
      <div className="skeleton profile-header-skeleton__btn" />
    </div>
  </div>
);

export const RightBarSkeleton = ({ count = 4 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rightbar-skeleton__item">
        <div className="skeleton rightbar-skeleton__item-avatar" />
        <div className="skeleton rightbar-skeleton__item-name" />
      </div>
    ))}
  </div>
);

export const NotifSkeleton = ({ count = 4 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="notif-skeleton__item">
        <div className="skeleton notif-skeleton__item-avatar" />
        <div className="notif-skeleton__item-content">
          <div className="skeleton notif-skeleton__item-text" />
          <div className="skeleton notif-skeleton__item-time" />
        </div>
      </div>
    ))}
  </div>
);

export const PostAuthorSkeleton = () => (
  <div className="post-author-skeleton">
    <div className="skeleton post-author-skeleton__avatar" />
    <div className="post-author-skeleton__meta">
      <div className="skeleton post-author-skeleton__name" />
      <div className="skeleton post-author-skeleton__date" />
    </div>
  </div>
);
