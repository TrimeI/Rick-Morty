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
    sortName: "Name",
    sortOrigin: "Origin",
    all: "All",
    alive: "Alive",
    dead: "Dead",
    unknown: "Unknown",
    changeLanguage: "Change Language",
    pagination: "Pagination",
    infiniteScroll: "Infinite Scroll",
    status: "Status",
    species: "Species",
    gender: "Gender",
    origin: "Origin",
    next: "Next", 
    previous: "Previous", 
    page: "Page", 
  },
  de: {
    title: "Rick und Morty Charaktere",
    filterStatus: "Nach Status filtern",
    filterSpecies: "Nach Spezies filtern",
    sortBy: "Sortieren nach",
    sortName: "Name",
    sortOrigin: "Herkunft",
    all: "Alle",
    alive: "Lebendig",
    dead: "Tot",
    unknown: "Unbekannt",
    changeLanguage: "Sprache ändern",
    pagination: "Seitennavigation",
    infiniteScroll: "Unendliches Scrollen",
    status: "Status",
    species: "Spezies",
    gender: "Geschlecht",
    origin: "Herkunft",
    next: "Weiter", 
    previous: "Zurück", 
    page: "Seite", 
  },
};

const App = () => {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [sortByName, setSortByName] = useState('');
  const [sortByOrigin, setSortByOrigin] = useState('');
  const [language, setLanguage] = useState('en');
  const [mode, setMode] = useState('pagination');
  const [modeChanged, setModeChanged] = useState(false);
  const observerRef = useRef(null);
  const itemsPerLoad = 20;

  const { loading, error, data, fetchMore } = useQuery(GET_CHARACTERS, {
    variables: { page: 1 },
    notifyOnNetworkStatusChange: true,
  });

  const t = translations[language];

  useEffect(() => {
    if (data && mode === 'infinite-scroll') {
      setCharacters((prev) => [...prev, ...data.characters.results]);
      setLoadingMore(false);
    }
  }, [data]);

  useEffect(() => {
    let result = [...characters];

    if (selectedStatus) {
      result = result.filter((char) => char.status === selectedStatus);
    }
    if (selectedSpecies) {
      result = result.filter((char) => char.species === selectedSpecies);
    }

    if (sortByName === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortByName === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sortByOrigin === 'origin-asc') {
      result.sort((a, b) => a.origin.name.localeCompare(b.origin.name));
    } else if (sortByOrigin === 'origin-desc') {
      result.sort((a, b) => b.origin.name.localeCompare(a.origin.name));
    }

    setFilteredCharacters(result);
  }, [characters, selectedStatus, selectedSpecies, sortByName, sortByOrigin]);

  const handleScroll = (entries) => {
    const [entry] = entries;

    if (
      mode === 'infinite-scroll' &&
      entry.isIntersecting &&
      !loadingMore &&
      data?.characters.info.next
    ) {
      setLoadingMore(true);

      fetchMore({
        variables: { page: page + 1 },
      })
        .then((fetchMoreResult) => {
          setCharacters((prev) => [...prev, ...fetchMoreResult.data.characters.results]);
          setPage((prev) => prev + 1);
          setLoadingMore(false);
        })
        .catch((error) => {
          setLoadingMore(false);
        });
    }
  };

  useEffect(() => {
    if (mode === 'infinite-scroll') {
      const observer = new IntersectionObserver(handleScroll, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      });
      if (observerRef.current) observer.observe(observerRef.current);

      return () => {
        if (observerRef.current) observer.unobserve(observerRef.current);
      };
    }
  }, [observerRef, loadingMore, data, mode]);

  const goToNextPage = () => {
    if (data?.characters.info.next) {
      fetchMore({
        variables: { page: page + 1 },
      })
        .then((fetchMoreResult) => {
          setCharacters(fetchMoreResult.data.characters.results);
          setPage((prev) => prev + 1);
          if (mode === 'pagination') {
            window.scrollTo(0, 0);
          }
        })
        .catch((error) => {});
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      fetchMore({
        variables: { page: page - 1 },
      })
        .then((fetchMoreResult) => {
          setCharacters(fetchMoreResult.data.characters.results);
          setPage((prev) => prev - 1);
          if (mode === 'pagination') {
            window.scrollTo(0, 0);
          }
        })
        .catch((error) => {});
    }
  };

  useEffect(() => {
    if (mode === 'pagination') {
      setPage(1);
      setCharacters([]);
      fetchMore({
        variables: { page: 1 },
      })
        .then((fetchMoreResult) => {
          setCharacters(fetchMoreResult.data.characters.results);
          if (!modeChanged) {
            window.scrollTo(0, 0);
          }
        })
        .catch((error) => {});
    } else if (mode === 'infinite-scroll') {
      setPage(1);
    }
    setModeChanged(false);
  }, [mode, fetchMore]);

  if (loading && page === 1) return <p>Loading...</p>;
  if (error) return <p>Error! {error.message}</p>;

  return (
    <div className="container">
      <h1>{t.title}</h1>

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
            value={sortByName}
            onChange={(e) => setSortByName(e.target.value)}
          >
            <option value="">{t.sortName}</option>
            <option value="name-asc">{t.sortName} (A-Z)</option>
            <option value="name-desc">{t.sortName} (Z-A)</option>
          </select>

          <select
            value={sortByOrigin}
            onChange={(e) => setSortByOrigin(e.target.value)}
          >
            <option value="">{t.sortOrigin}</option>
            <option value="origin-asc">{t.sortOrigin} (A-Z)</option>
            <option value="origin-desc">{t.sortOrigin} (Z-A)</option>
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

        <div>
          <label>
            <input
              type="radio"
              value="pagination"
              checked={mode === 'pagination'}
              onChange={() => {
                setMode('pagination');
                setModeChanged(true);
              }}
            />
            {t.pagination}
          </label>
          <label>
            <input
              type="radio"
              value="infinite-scroll"
              checked={mode === 'infinite-scroll'}
              onChange={() => {
                setMode('infinite-scroll');
                setModeChanged(true);
              }}
            />
            {t.infiniteScroll}
          </label>
        </div>
      </div>

      <div className="character-list">
        {filteredCharacters.map((character) => (
          <CharacterInfo key={character.id} character={character} t={translations[language]} />
        ))}
      </div>

      {mode === 'pagination' && (
        <div className="pagination-buttons">
          <button onClick={goToPreviousPage} disabled={page === 1}>
            {t.previous}
          </button>
          <span>Page {page}</span>
          <button onClick={goToNextPage} disabled={!data?.characters.info.next}>
            {t.next}
          </button>
        </div>
      )}

      {mode === 'infinite-scroll' && (
        <div ref={observerRef} style={{ height: '50px', background: 'transparent' }}>
          {loadingMore && <p>Loading more...</p>}
        </div>
      )}
    </div>
  );
};

export default App;
