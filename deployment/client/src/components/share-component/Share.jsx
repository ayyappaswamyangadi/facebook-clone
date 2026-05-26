import { Cancel, EmojiEmotions, Label, PermMedia, Room } from "@mui/icons-material"
import { useContext, useRef, useState } from "react"
import "./Share.scss"
import { AuthContext } from '../context/AuthContext'
import axios from 'axios';
import { Link } from 'react-router-dom'

const Share = () => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;
    const desc = useRef();

    const { user } = useContext(AuthContext)

    const [file, setFile] = useState(null);

    const handleOnChange = (event) => {
        setFile(event.target.files[0])
    }

    const submitHandler = async (event) => {
        event.preventDefault();
        const newPost = {
            userId: user._id,
            desc: desc.current.value
        }
        if (file) {
            const data = new FormData();

            const fileName = Date.now() + file.name;
            data.append("file", file, fileName);
            newPost.img = fileName;

            try {
                await axios.post('/upload', data)
            } catch (err) {
                console.log(err);
            }
        }

        try {
            await axios.post('/post', newPost);
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className='share'>
            <div className="share-wrapper">
                <div className="share-top">
                    <Link to={"/profile/" + user.userName}><img src={user.profilePicture ? public_folder_path + "profiles/" + user.profilePicture : public_folder_path + "/profiles/no-avatar.png"} alt="profile-pic" className="share-profile-pic" /></Link>
                    <input type="text"
                        placeholder={"what's in your mind " + user.userName + "?"} className="share-input" ref={desc} />
                </div>
                <hr className="share-horizontal-line" />
                {
                    file && (
                        <div className="share-container">
                            <img className="share-image" src={URL.createObjectURL(file)} alt="" />
                            <Cancel className="share-cancel-image" onClick={() => setFile(null)} />
                        </div>
                    )
                }
                <form encType="multipart/form-data" method="POST" className="share-bottom" onSubmit={submitHandler}>
                    <div className="share-options">
                        <label htmlFor="file" className="share-option">
                            <PermMedia htmlColor="tomato" className="share-icon" />

                            <span className="share-option-text">photo or video</span>
                            <input type="file" id="file" name="file" accept=".png,.jpeg,.jpg" onChange={handleOnChange} onClick={(event) => {
                                event.target.value = null
                            }} />
                        </label>
                        <div className="share-option">
                            <Label htmlColor="blue" className="share-icon" />
                            <span className="share-option-text">Tag</span>
                        </div><div className="share-option">
                            <Room htmlColor="red" className="share-icon" />
                            <span className="share-option-text">Location</span>
                        </div><div className="share-option">
                            <EmojiEmotions htmlColor="goldenrod" className="share-icon" />
                            <span className="share-option-text">Feelings</span>
                        </div>
                    </div>
                    <button className="share-button" type="submit">Share</button>
                </form>
            </div>
        </div>
    )
}

export default Share