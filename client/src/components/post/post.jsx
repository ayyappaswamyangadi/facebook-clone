import "./post.scss"
import { MoreVert } from "@mui/icons-material";
// import { Users } from "../../dummyData";
import { useContext, useState, useEffect } from "react"
import axios from 'axios'
import moment from 'moment'
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Post = ({ post }) => {

    // const user = Users.filter(user => (user.id === post.userId))
    // console.log(user[0].userName)

    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER
    const { user: currentUser } = useContext(AuthContext)
    const [user, setUser] = useState({});

    useEffect(() => {
        const fetchUser = async () => {
            const user = await axios.get(`/users?userId=${post.userId}`)
            setUser(user.data)
        }
        fetchUser()
    }, [post.userId])


    const [like, setLike] = useState(post.likes.length)
    const [isLiked, setIsLiked] = useState(false)

    const likeHandler = () => {
        try {
            axios.put("/post/" + post._id + "/like", { userId: currentUser._id })
        } catch (err) {

        }
        setLike(isLiked ? like - 1 : like + 1)
        setIsLiked(!isLiked)
    }
    return (
        <div className="post">
            <div className="post-wrapper">
                <div className="post-top">
                    <div className="post-top-left">
                        <Link to={`/profile/${user.userName}`} className="post-links">
                            <img src={user.profilePicture ? public_folder_path + "/profiles/" + user.profilePicture : public_folder_path + "profiles/no-avatar.png"} alt="profile-picture" className="post-profile-img" />
                        </Link>
                        <Link to={`/profile/${user.userName}`} className="post-links">
                            <span className="post-user-name">{user.userName}</span>
                        </Link>
                        <span className="post-date">{moment.parseZone(post.createdAt).fromNow()}</span>
                    </div>
                    <div className="post-top-right">
                        <MoreVert />
                    </div>
                </div>
                <div className="post-center">
                    <span className="post-text">{post?.desc}</span>
                    <img src={public_folder_path + post.img} alt="" className="post-img" />
                </div>
                <div className="post-bottom">
                    <div className="post-bottom-left">
                        <img src={`${public_folder_path}` + "like.png"} alt="" className="like-img" onClick={likeHandler} />
                        <img src={`${public_folder_path}` + "heart.png"} alt="" className="heart-img" onClick={likeHandler} />
                        <span className="post-like-counter">{like} people like it</span>
                    </div>
                    <div className="post-bottom-right">
                        <span className="post-comment-text">{post.comment} comments</span>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Post