import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItemById } from '../features/items/itemsSlice';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import './CharacterDetails.css';

const CharacterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedItem, loadingItem, errorItem } = useSelector((state) => state.items);

  useEffect(() => {
    if (id) {
      dispatch(fetchItemById(id));
    }
  }, [dispatch, id]);

  if (loadingItem) return <Spinner />;
  if (errorItem) return <ErrorBox message={errorItem} />;
  if (!selectedItem) return <ErrorBox message="Character not found." />;

  return (
    <div className="details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back
      </button>
      <div className="details-card">
        <img src={selectedItem.image} alt={selectedItem.name} className="details-image" />
        <div className="details-info">
          <h1>{selectedItem.name}</h1>
          <ul>
            <li><strong>Status:</strong> {selectedItem.status}</li>
            <li><strong>Species:</strong> {selectedItem.species}</li>
            <li><strong>Type:</strong> {selectedItem.type || 'N/A'}</li>
            <li><strong>Gender:</strong> {selectedItem.gender}</li>
            <li><strong>Origin:</strong> {selectedItem.origin.name}</li>
            <li><strong>Last Known Location:</strong> {selectedItem.location.name}</li>
            <li><strong>Number of Episodes:</strong> {selectedItem.episode.length}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetails;