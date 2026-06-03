import {
    RssFeed,
    Chat,
    PlayCircleFilledOutlined,
    HelpOutline,
    WorkOutline,
    Bookmark,
    Group,
    School,
} from "@mui/icons-material";
import CloseFriends from "../close-friends/CloseFriends";
import { Users } from "../../dummyData";
import "./side-bar.scss";

const Sidebar = () => {
    return (
        <div className="side-bar">
            <div className="side-bar-wrapper">
                <ul className="side-bar-list">
                    <li className="side-bar-list-item">
                        <RssFeed className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Feed</span>
                    </li>
                    <li className="side-bar-list-item">
                        <Chat className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Chat</span>
                    </li>
                    <li className="side-bar-list-item">
                        <PlayCircleFilledOutlined className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Video</span>
                    </li>
                    <li className="side-bar-list-item">
                        <Group className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Groups</span>
                    </li>
                    <li className="side-bar-list-item">
                        <Bookmark className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Bookmarks</span>
                    </li>
                    <li className="side-bar-list-item">
                        <HelpOutline className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Questions</span>
                    </li>
                    <li className="side-bar-list-item">
                        <WorkOutline className="side-bar-icon" />
                        <span className="side-bar-list-item-text">jobs</span>
                    </li>
                    <li className="side-bar-list-item">
                        <School className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Courses</span>
                    </li>
                </ul>
                <button className="side-bar-button">Show More</button>
                <hr className="side-bar-horizontal-line" />
                <ul className="side-bar-friend-list">
                    {
                        Users.map(user => (
                            <CloseFriends key={user.id} user={user} />
                        ))

                    }
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
