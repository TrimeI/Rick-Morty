import React from 'react';

const CharacterInfo = ({ character }) => {
  const { image, name, status, species, gender, origin } = character;

  return (
    <li className="card">
      <img src={image} alt={name} className="card-image" />
      <div className="card-content">
        <h3 className="card-title">{name}</h3>
        <CharacterDetails 
          status={status} 
          species={species} 
          gender={gender} 
          origin={origin.name} 
        />
      </div>
    </li>
  );
};

const CharacterDetails = ({ status, species, gender, origin }) => (
  <div className="card-details">
    <p>Status: {status}</p>
    <p>Species: {species}</p>
    <p>Gender: {gender}</p>
    <p>Origin: {origin}</p>
  </div>
);

export default CharacterInfo;
