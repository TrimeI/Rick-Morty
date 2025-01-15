import React, { useState, useEffect, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
import CharacterInfo from './CharacterInfo';

const GET_CHARACTERS = gql`
  query GetCharacters($page: Int) {
    characters(page: $page) {
      info {
        next
      }
      results {
        id
        name
        status
        species
        gender
        origin {
          name
        }
        image
      }
    }
  }
`;

const translations = {
  en: {
    title: "Rick and Morty Characters",
    filterStatus: "Filter by Status",
    filterSpecies: "Filter by Species",
    sortBy: "Sort by",
    all: "All",
    alive: "Alive",
    dead: "Dead",
    unknown: "Unknown",
    changeLanguage: "Change Language",
  },
  de: {
    title: "Rick und Morty Charaktere",
    filterStatus: "Nach Status filtern",
    filterSpecies: "Nach Spezies filtern",
    sortBy: "Sortieren nach",
    all: "Alle",
    alive: "Lebendig",
    dead: "Tot",
    unknown: "Unbekannt",
    changeLanguage: "Sprache ändern",
  },
};

const App = () => {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [language, setLanguage] = useState('en');
  const observerRef = useRef(null);
  const itemsPerLoad = 3;

  const { loading, error, data, fetchMore } = useQuery(GET_CHARACTERS, {
    variables: { page: 1 },
    notifyOnNetworkStatusChange: true,
  });

  const t = translations[language];

  useEffect(() => {
    if (data) {
      setCharacters((prev) => [...prev, ...data.characters.results]);
      setLoadingMore(false);
    }
  }, [data]);

  useEffect(() => {
    let result = characters;

    // Apply filters
    if (selectedStatus) {
      result = result.filter((char) => char.status === selectedStatus);
    }
    if (selectedSpecies) {
      result = result.filter((char) => char.species === selectedSpecies);
    }

    // Apply sorting
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredCharacters(result);
  }, [characters, selectedStatus, selectedSpecies, sortBy]);

  const handleScroll = (entries) => {
    const [entry] = entries;

    if (entry.isIntersecting && !loadingMore && data?.characters.info.next) {
      setLoadingMore(true);

      fetchMore({
        variables: { page: page + 1 },
      }).then((fetchMoreResult) => {
        setCharacters((prev) => [
          ...prev,
          ...fetchMoreResult.data.characters.results,
        ]);
        setPage((prev) => prev + 1);
        setLoadingMore(false);
      }).catch((error) => {
        console.error('Error fetching more characters:', error);
        setLoadingMore(false);
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleScroll, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    });
    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [observerRef, loadingMore, data]);

  if (loading && page === 1) return <p>Loading...</p>;
  if (error) return <p>Error! {error.message}</p>;

  return (
    <div className="container">
      <h1>{t.title}</h1>

      {/* Filters, Sorting, and Language Selector */}
      <div className="controls">
        <div>
          <label>{t.filterStatus}:</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t.all}</option>
            <option value="Alive">{t.alive}</option>
            <option value="Dead">{t.dead}</option>
            <option value="unknown">{t.unknown}</option>
          </select>
        </div>

        <div>
          <label>{t.filterSpecies}:</label>
          <select
            value={selectedSpecies}
            onChange={(e) => {
              setSelectedSpecies(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t.all}</option>
            <option value="Human">Human</option>
            <option value="Alien">Alien</option>
          </select>
        </div>

        <div>
          <label>{t.sortBy}:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">None</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>

        <div>
          <label>{t.changeLanguage}:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      {/* Character List */}
      <div className="character-list">
        {filteredCharacters.slice(0, page * itemsPerLoad).map((character) => (
          <CharacterInfo key={character.id} character={character} />
        ))}
      </div>

      {/* Observer */}
      <div ref={observerRef} style={{ height: '50px', background: 'transparent' }}>
        {loadingMore && <p>Loading more...</p>}
      </div>
    </div>
  );
};

export default App;
