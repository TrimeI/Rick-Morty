import React from 'react';

const CharacterInfo = ({ character, t }) => {
  const { image, name, status, species, gender, origin } = character;

  return (
    <li className="card">
      <img src={image} alt={name} className="card-image" />
      <div className="card-content">
        <h3 className="card-title">
          {name}
        </h3>
        <CharacterDetails 
          status={t[status.toLowerCase()] || status}
          species={species} 
          gender={gender} 
          origin={origin.name} 
          t={t} 
        />
      </div>
    </li>
  );
};

const CharacterDetails = ({ status, species, gender, origin, t }) => (
  <div className="card-details">
    <p>
      <strong>{t.status}:</strong> {status}
    </p>
    <p>
      <strong>{t.species}:</strong> {species}
    </p>
    <p>
      <strong>{t.gender}:</strong> {gender}
    </p>
    <p>
      <strong>{t.origin}:</strong> {origin}
    </p>
  </div>
);

export default CharacterInfo;
