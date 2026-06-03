import Topbar from "../../components/topbar/Topbar"
import "./not-found.scss"
import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <>
            <Topbar />
            <div className="not-found-content">
                <h1 className='not-found-title'>Sorry, page NotFound</h1>
                <Link className="not-found-go-to-home-page" to="/">Home Page</Link>
            </div>
        </>
    )
}

export default NotFound