import React from 'react';

const CharacterInfo = ({ character }) => {
  return (
    <li className="card" style={{ margin: '1rem', padding: '1rem', border: '1px solid #ddd' }}>
      <img src={character.image} alt={character.name} style={{ width: '150px', height: '150px' }} />
      <h3>{character.name}</h3>
      <p>Status: {character.status}</p>
      <p>Species: {character.species}</p>
      <p>Gender: {character.gender}</p>
      <p>Origin: {character.origin.name}</p>
    </li>
  );
};

export default CharacterInfo;