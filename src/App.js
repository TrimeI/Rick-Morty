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
  const [filters, setFilters] = useState({ status: '', species: '', sortBy: '' });
  const [language, setLanguage] = useState('en');
  const [mode, setMode] = useState('pagination');
  const observerRef = useRef(null);

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
    const applyFilters = () => {
      let result = characters;
      const { status, species, sortBy } = filters;

      if (status) result = result.filter((char) => char.status === status);
      if (species) result = result.filter((char) => char.species === species);

      if (sortBy === 'name-asc') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'name-desc') {
        result.sort((a, b) => b.name.localeCompare(a.name));
      }

      setFilteredCharacters(result);
    };

    applyFilters();
  }, [characters, filters]);

  const handleScroll = (entries) => {
    const [entry] = entries;

    if (
      mode === 'infinite-scroll' &&
      entry.isIntersecting &&
      !loadingMore &&
      data?.characters.info.next
    ) {
      setLoadingMore(true);
      fetchMore({ variables: { page: page + 1 } })
        .then((fetchMoreResult) => {
          setCharacters((prev) => [
            ...prev,
            ...fetchMoreResult.data.characters.results,
          ]);
          setPage((prev) => prev + 1);
          setLoadingMore(false);
        })
        .catch(() => setLoadingMore(false));
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

  const changePage = (newPage) => {
    fetchMore({ variables: { page: newPage } })
      .then((fetchMoreResult) => {
        setCharacters(fetchMoreResult.data.characters.results);
        setPage(newPage);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (mode === 'pagination') {
      setPage(1);
      setCharacters([]);
      changePage(1);
    }
  }, [mode]);

  if (loading && page === 1) return <p>Loading...</p>;
  if (error) return <p>Error! {error.message}</p>;

  return (
    <div className="container">
      <h1>{t.title}</h1>

      <div className="controls">
        <div>
          <label>{t.filterStatus}:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
            value={filters.species}
            onChange={(e) => setFilters({ ...filters, species: e.target.value })}
          >
            <option value="">{t.all}</option>
            <option value="Human">Human</option>
            <option value="Alien">Alien</option>
          </select>
        </div>

        <div>
          <label>{t.sortBy}:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="">None</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>

        <div>
          <label>{t.changeLanguage}:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
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
        {filteredCharacters.map((character) => (
          <CharacterInfo key={character.id} character={character} />
        ))}
      </div>

      {mode === 'pagination' && (
        <div className="pagination-buttons">
          <button onClick={() => changePage(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => changePage(page + 1)}
            disabled={!data?.characters.info.next}
          >
            Next
          </button>
        </div>
      )}

      {mode === 'infinite-scroll' && (
        <div
          ref={observerRef}
          style={{ height: '50px', background: 'transparent' }}
        >
          {loadingMore && <p>Loading more...</p>}
        </div>
      )}
    </div>
  );
};

export default App;
