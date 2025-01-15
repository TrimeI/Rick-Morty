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
    pagination: "Pagination",
    infiniteScroll: "Infinite Scroll",
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
    pagination: "Seitennavigation",
    infiniteScroll: "Unendliches Scrollen",
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
  const [mode, setMode] = useState('pagination');
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
    let result = characters;

    if (selectedStatus) {
      result = result.filter((char) => char.status === selectedStatus);
    }
    if (selectedSpecies) {
      result = result.filter((char) => char.species === selectedSpecies);
    }

    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredCharacters(result);
  }, [characters, selectedStatus, selectedSpecies, sortBy]);

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
      }).then((fetchMoreResult) => {
        setCharacters((prev) => [
          ...prev,
          ...fetchMoreResult.data.characters.results,
        ]);
        setPage((prev) => prev + 1);
        setLoadingMore(false);
      }).catch((error) => {
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
      }).then((fetchMoreResult) => {
        setCharacters(fetchMoreResult.data.characters.results);
        setPage((prev) => prev + 1);
        window.scrollTo(0, 0);
      }).catch((error) => {});
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      fetchMore({
        variables: { page: page - 1 },
      }).then((fetchMoreResult) => {
        setCharacters(fetchMoreResult.data.characters.results);
        setPage((prev) => prev - 1);
        window.scrollTo(0, 0);
      }).catch((error) => {});
    }
  };

  useEffect(() => {
    if (mode === 'pagination') {
      setPage(1);
      setCharacters([]);
      fetchMore({
        variables: { page: 1 },
      }).then((fetchMoreResult) => {
        setCharacters(fetchMoreResult.data.characters.results);
      }).catch((error) => {});
    }
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

        <div>
          <label>
            <input
              type="radio"
              value="pagination"
              checked={mode === 'pagination'}
              onChange={() => setMode('pagination')}
            />
            {t.pagination}
          </label>
          <label>
            <input
              type="radio"
              value="infinite-scroll"
              checked={mode === 'infinite-scroll'}
              onChange={() => setMode('infinite-scroll')}
            />
            {t.infiniteScroll}
          </label>
        </div>
      </div>

      <div className="character-list">
        {characters.map((character) => (
          <CharacterInfo key={character.id} character={character} />
        ))}
      </div>

      {mode === 'pagination' && (
        <div className="pagination-buttons">
          <button onClick={goToPreviousPage} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page}</span>
          <button onClick={goToNextPage} disabled={!data?.characters.info.next}>
            Next
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
