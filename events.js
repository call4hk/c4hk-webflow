const EventsToolBar = (props) => {
  const allEventsList = props.eventsList;
  const [filterMap, setFilterMap] = React.useState(new Map());
  const ecalSyncButtonRef = React.useRef(null);
  const [updateSelect, setUpdateSelect] = React.useState(0);

  const allOrganizersSet =
    [...allEventsList.map(event => event.organizers)]
      .reduce((acc, cv) => {
        cv.map(organizer => acc.add(organizer))
        return acc;
      }, new Set());
  const organizers = [...allOrganizersSet].sort();
  const allCategoriesSet =
    [...allEventsList.map(event => event.category)]
      .reduce((acc, cv) => {
        cv.map(category => acc.add(category))
        return acc;
      }, new Set());
  const categories = [...allCategoriesSet].sort();
  const timeZones = [...new Set(allEventsList.map(event => event.timezone))].sort();
  const cities = [...new Set(allEventsList.map(event => event.city))].sort();

  const onFilterUpate = (key, value) => {
    const newFilterMap = new Map(filterMap);
    newFilterMap.set(key, value);
    setFilterMap(newFilterMap);
  };

  const onClearFilters = () => {
    setUpdateSelect(updateSelect + 1);
    setFilterMap(new Map());
  };

  React.useEffect(() => {
    let filteredList = allEventsList;
    for (const key of filterMap.keys()) {
      filteredList =
        filteredList.filter(event => {
          if (Array.isArray(event[key])) {
            return event[key].includes(filterMap.get(key));
          } else {
            return event[key] === filterMap.get(key);
          }
        });
    }
    props.onEventsListFiltered(filteredList);
  }, [filterMap]);

  const onSyncCalClick = () => {
    if (ecalSyncButtonRef.current) {
      ecalSyncButtonRef.current.click();
    }
  };

  return (
    <div className='flex flex-col lg:flex-row items-center justify-between'>
      <div className='flex flex-row flex-wrap items-center gap-2 self-start lg:self-center'>
        <p>Filters:</p>
        <EventSelect update={updateSelect} name='organizer' first='Host' mapkey='organizers' values={organizers} onFilterUpate={onFilterUpate} />
        <EventSelect update={updateSelect} name='category' first='Categories' mapkey='category' values={categories} onFilterUpate={onFilterUpate} />
        <EventSelect update={updateSelect} name='timezone' first='Timezones' mapkey='timezone' values={timeZones} onFilterUpate={onFilterUpate} />
        <EventSelect update={updateSelect} name='location' first='Locations' mapkey='city' values={cities} onFilterUpate={onFilterUpate} />
        <span className='cursor-pointer hover:underline' onClick={onClearFilters}>Clear Filters</span>
      </div>
      {!!props.showSync && <div className='sync-to-cal mt-3 lg:mt-0 self-center sm:self-end'>
        <button ref={ecalSyncButtonRef} class='hidden-important ecal-sync-widget-button' data-ecal-widget-id='65725ac006f50f000da15384'>Sync to Calendar</button>
        <button className='sync-to-cal text-xl font-bold px-8 pt-3 pb-2' onClick={onSyncCalClick}>Sync to Calendar</button>
      </div>}
    </div>
  );
};

const EventSelect = (props) => {
  const { name, mapkey, first, values, update, onFilterUpate } = props;
  const id = name + '_filter';
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    selectRef.current.selectedIndex = 0;
  }, [update]);

  return (
    <select ref={selectRef} className='w-32 truncate py-2 px-2 rounded-lg select-dropdown-border' name={id} id={id} onChange={event => onFilterUpate(mapkey, event.target.value)}>
      <option value='' disabled selected>{first}</option>
      {values.map(val => {
        return (
          <option value={val}>{val}</option>
        );
      })}
    </select>
  );
};  

const CategoryPill = (props) => {
  const text = props.text;
  return (
    <div className='cat-pill rounded-lg pb-1 px-2'>
      <span>{text}</span>
    </div>
  );
};

const EventCard = (props) => {
  const event = props.event;
  const categories = event.category;
  const dateString = getFormattedDate(event.date);
  const time = `${event.start_time} - ${event.end_time} ${event.timezone}`;
  const organizersCount = event.organizers.length;
  const organizers = organizersCount < 3 ?
    event.organizers.join(', ') :
    event.organizers.slice(0, 2).join(', ') + ` + ${organizersCount - 2} orgs`;

  let dateTime = `${dateString} ${time}`;
  if (!!event.happens_weekly) {
    const endDateString = getFormattedDate(event.end_date);
    dateTime = `${dateString} ${event.start_time} ${event.timezone} - ${endDateString} ${event.end_time} ${event.timezone}`;
  }

  const handleCardClick = (eventId) => {
    window.open('/event-details?eventid=' + eventId, '_blank', 'noopener');
  };

  const onLocationClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div className='event-card bg-white rounded-lg overflow-hidden' role='button' onClick={() => handleCardClick(event.hk_event_id)}>
      <div style={{ height: '227px' }} className='flex justify-center items-center overflow-hidden'>
        <img className='min-h-full' src={event.image_url} />
      </div>
      <div style={{ minHeight: '274px' }} className='flex flex-col p-5 gap-y-2 flex-1'>
        <h2 className='text-2xl font-bold pt-px'>{event.title}</h2>
        <span style={{ color: '#f09c38' }} className='pt-px'>{dateTime}</span>
        <a className='hover:underline' onClick={onLocationClick} href={`https://www.google.com/maps/search/?api=1&query=${event.location}`} target='_blank'>{event.location}</a>
        <div className='flex flex-wrap gap-1'>
          {categories.map(category => {
            return <CategoryPill text={category} />
          })}
        </div>
        <div className='flex-1 flex items-end'>
          <div className='flex items-center'>
            <div className='rounded-full' style={{ minHeight: '33px', minWidth: '33px', backgroundColor: '#d9d9d9' }} />
            <p className='ml-3'>{organizers}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsPanel = (props) => {
  const allEventsList = props.eventsList;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filteredEventsList, setFilteredEventsList] =  React.useState(allEventsList);

  React.useEffect(() => {
    setCurrentPage(1);
    setFilteredEventsList(props.eventsList);
  }, [props.eventsList]);

  const displayEventsList = filteredEventsList && filteredEventsList.slice(6 * (currentPage - 1), 6 * currentPage);
  const totalPage = filteredEventsList && Math.ceil(filteredEventsList.length / 6);

  const onPageNumUpdate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const onEventsListFiltered = (filteredList) => {
    setFilteredEventsList(filteredList);
    setCurrentPage(1);
  };

  return (
    <div>
      <EventsToolBar eventsList={allEventsList} onEventsListFiltered={onEventsListFiltered} showSync={props.showSync} />
      <div className='grid mt-5 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {displayEventsList.map(event => {
          return <EventCard event={event} />;
        })}
      </div>
      <EventsPagination currentPage={currentPage} totalPage={totalPage} onPageNumUpdate={onPageNumUpdate} />
    </div>
  );
};

const EventsPagination = (props) => {
  const { currentPage, totalPage } = props;

  const pageUpdate = (pageNumber) => {
    props.onPageNumUpdate(pageNumber);
  };

  const pageNumberList = [];
  // prev page
  if (currentPage > 1) {
    pageNumberList.push(currentPage - 1);
  }
  // current page
  pageNumberList.push(currentPage);
  // next page
  if (currentPage < totalPage) {
    pageNumberList.push(currentPage + 1);
  }

  return (
    <div className='flex justify-center py-8'>
      {currentPage > 1 && <div role='button' className='w-8 h-8 flex pt-px justify-center items-center hover:bg-yellow-50 rounded-full' onClick={() => pageUpdate(currentPage - 1)}>
        <span>&lt;</span>
      </div>}
      {pageNumberList.map(pageNum => {
        let currentPageBg = '';
        if (pageNum === currentPage) {
          currentPageBg = 'bg-slate-50';
        }
        return (
          <div role='button' className={`w-8 h-8 flex pt-px justify-center items-center hover:bg-yellow-50 rounded-full ${currentPageBg}`} onClick={() => pageUpdate(pageNum)}>
            <span>{pageNum}</span>
          </div>
        );
      })}
      {currentPage < totalPage && <div role='button' className='w-8 h-8 flex pt-px justify-center items-center hover:bg-yellow-50 rounded-full' onClick={() => pageUpdate(currentPage + 1)}>
        <span>&gt;</span>
      </div>}
    </div>
  );
};

const Upcoming = () => {
  const [allEventsList, setAllEventsList] = React.useState([]);

  React.useEffect(() => {
    getEndpoint('events').then(events => {
      setAllEventsList(events);
    });
  }, []);

  return (
    <EventsPanel eventsList={allEventsList} showSync={true} />
  );
};

const Previous = () => {
  const [allEventsList, setAllEventsList] = React.useState([]);

  React.useEffect(() => {
    getEndpoint('events', 'past').then(events => {
      setAllEventsList(events);
    });
  }, []);

  return (
    <EventsPanel eventsList={allEventsList} showSync={false} />
  );
};

ReactDOM.render(<Upcoming />, document.getElementById('upcoming-events-container'));
ReactDOM.render(<Previous />, document.getElementById('previous-events-container'));
