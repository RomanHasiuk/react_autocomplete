import React, { useState, useEffect, useCallback } from 'react';
import { Person } from '../../types/Person';
import classNames from 'classnames';

interface Props {
  people: Person[];
  onSelected: (person: Person | null) => void;
  delay?: number;
}

export const Autocomplete: React.FC<Props> = ({
  people,
  onSelected,
  delay = 300,
}) => {
  const [query, setQuery] = useState('');
  const [filteredPeople, setFilteredPeople] = useState<Person[]>(people);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setFilteredPeople(people);
  }, [people]);

  const debounce = (func: () => void, timeout: number) => {
    let timer: NodeJS.Timeout;

    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => func(), timeout);
    };
  };

  const filterPeople = useCallback(() => {
    if (!query) {
      setFilteredPeople(people);

      return;
    }

    const filtered = people.filter(person =>
      person.name.toLowerCase().includes(query.toLowerCase()),
    );

    setFilteredPeople(filtered);
  }, [query, people]);

  useEffect(() => {
    const debouncedFilter = debounce(filterPeople, delay);

    debouncedFilter();
  }, [query, filterPeople, delay]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setDropdownOpen(true);
    if (selectedPerson) {
      setSelectedPerson(null);
      onSelected(null);
    }
  };

  const handleSelectPerson = (person: Person) => {
    setQuery(person.name);
    setSelectedPerson(person);
    setDropdownOpen(false);
    onSelected(person);
  };

  return (
    <div className={classNames('dropdown', { 'is-active': isDropdownOpen })}>
      <div className="dropdown-trigger">
        <input
          type="text"
          placeholder="Enter a part of the name"
          className="input"
          data-cy="search-input"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setDropdownOpen(true)}
        />
      </div>

      {isDropdownOpen && (
        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {filteredPeople.length > 0 ? (
              filteredPeople.map(person => (
                <div
                  key={person.slug}
                  className="dropdown-item"
                  data-cy="suggestion-item"
                  onClick={() => handleSelectPerson(person)}
                >
                  <p className="has-text-link">{person.name}</p>
                </div>
              ))
            ) : (
              <div className="dropdown-item" data-cy="no-suggestions-message">
                <p className="has-text-danger">No matching suggestions</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
