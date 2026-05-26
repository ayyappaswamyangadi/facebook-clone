import "./Home.scss"
import NewsFeed from "../../components/news-feed/NewsFeed";
import Sidebar from "../../components/side-bar/Sidebar";
import RightBar from "../../components/right-bar/RightBar";
import Topbar from "../../components/topbar/Topbar";


const Home = () => {
  return (
    <div>
      <Topbar />
      <div className="home-container">
        <Sidebar />
        <NewsFeed />
        <RightBar />

      </div>
    </div>
  );
};

export default Home;
