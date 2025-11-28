import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItems } from '../features/items/itemsSlice';
import CharacterCard from '../components/CharacterCard';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import './CharacterList.css';

const CharacterList = () => {
  const dispatch = useDispatch();
  const { list, loadingList, errorList } = useSelector((state) => state.items);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      dispatch(fetchItems(query));
    }
  }, [dispatch, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const search = formData.get('search');
    setSearchParams({ q: search });
  };

  return (
    <div className="list-container">
      <h1>Search Characters</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          name="search"
          defaultValue={query}
          placeholder="Enter character name..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {loadingList && <Spinner />}
      {errorList && <ErrorBox message={errorList} />}

      {!loadingList && !errorList && (
        <>
          <ul className="character-grid">
            {list.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </ul>
          {query && list.length === 0 && (
            <p className="no-results">No characters found for "{query}".</p>
          )}
        </>
      )}
    </div>
  );
};

export default CharacterList;