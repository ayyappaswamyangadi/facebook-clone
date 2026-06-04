import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search } from "@mui/icons-material";
import { Spinner } from "../loaders/Loaders";
import "./search.scss";

const SearchDropdown = ({ onClose }) => {
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const debounceTimer = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer.current);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get("/users/search?q=" + encodeURIComponent(val));
        setResults(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="search-dropdown">
      <div className="search-input-row">
        <Search className="search-dd-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-dd-input"
          placeholder="Search Facebook"
          value={query}
          onChange={handleChange}
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(""); setResults([]); }}>
            ✕
          </button>
        )}
      </div>

      {loading && <Spinner size="sm" />}

      {!loading && results.length > 0 && (
        <ul className="search-results">
          {results.map((u) => (
            <li key={u._id}>
              <Link
                to={`/profile/${u.userName}`}
                className="search-result-item"
                onClick={onClose}
              >
                <img
                  src={
                    u.profilePicture
                      ? public_folder + "profiles/" + u.profilePicture
                      : public_folder + "profiles/no-avatar.png"
                  }
                  alt={u.userName}
                  className="search-result-avatar"
                />
                <span className="search-result-name">{u.userName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <div className="search-no-results">No results for "{query}"</div>
      )}
    </div>
  );
};

export default SearchDropdown;
