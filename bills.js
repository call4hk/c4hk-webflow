const DropdownControl = (props) => {
  const { values, onControlUpdate } = props;
  const [valuesObject, setValuesObject] = React.useState({});
  const [expanded, setExpanded] = React.useState(false);

  const onUpdate = (value, event) => {
    const obj = Object.assign({}, valuesObject);
    obj[value.value] = event.target.checked;
    setValuesObject(obj);
    onControlUpdate(obj);
  };

  const onDropdown = (expand) => {
    setExpanded(expand);
  };

  const handleKeydown = (event) => {
    if (expanded) {
      if (event.code === 'Escape' || event.key === 'Escape') {
        event.stopPropagation();
        setExpanded(false);
      }
    }
  };

  return (
    <div>
      <button className='rounded-xl border bg-white px-2.5 py-2.5'
        onClick={() => onDropdown(!expanded)}
        onKeyDown={handleKeydown}
      >
        Dropdown
      </button>
      {expanded &&
        <div className='absolute right-0 z-10 rounded-lg border bg-white p-2'>
          {values.map(value => {
            return (
              <div key={value} className='flex flex-row items-center'>
                <input
                  className='mr-2' type='checkbox'
                  onChange={event => onUpdate(value, event)}
                  checked={valuesObject[value.value]}
                />
                <p>{value.display}</p>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
};

const CurrentBillsControl = (props) => {
  const { className, onUpdate } = props;
  const values = [
    {
      display: 'Recommended',
      value: 'recommended',
    },
    {
      display: 'Latest Action - Newest to Oldest',
      value: 'action-n2o',
    },
    {
      display: 'Latest Action - Oldest to Newest',
      value: 'action-o2n',
    },
    {
      display: 'Total no. of co-sponsor - Most to Least',
      value: 'sponsor-m2l',
    },
    {
      display: 'Total no. of co-sponsor - Least to Most',
      value: 'sponsor-l2m',
    },
  ];
  return (
    <div className={`flex items-center ${className}`}>
      <span className='font-bold'>Sort:&nbsp;</span>
      <DropdownControl values={values} onControlUpdate={onUpdate} />
    </div>
  );
};

const PreviousBillsFilter = (props) => {
  const { className, onUpdate } = props;
  const values = [
    {
      display: 'All previous terms',
      value: 'all-previous',
    },
    {
      display: '117 (2021-2022)',
      value: '117',
    },
    {
      display: '116 (2020-2021)',
      value: '116',
    },
    {
      display: '115 (2019-2020)',
      value: '115',
    },
    {
      display: '114 (2018-2019)',
      value: '114',
    },
    {
      display: '113 (2017-2018)',
      value: '113',
    },
    {
      display: '112 (2016-2017)',
      value: '112',
    },
  ];
  return (
    <div className={`flex items-center ${className}`}>
      <span className='font-bold'>Filters:&nbsp;</span>
      <DropdownControl values={values} onControlUpdate={onUpdate} />
    </div>
  );
};

const CurrentBillsPaging = () => {
  return <div>Current bills paging</div>
};

const PreviousBillsPaging = (props) => {
  const { className, currentPage, totalPage, onRowsUpdate, onPageUpdate } = props;

  const onRowsPerPageUpdate = (value) => {
    onRowsUpdate(parseInt(value));
  };

  const onPageNumberUpdate = (value) => {
    onPageUpdate(value);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <p>Rows per page:&nbsp;</p>
      <select className='py-2 px-2 rounded-lg outline outline-1 select-dropdown-border' onChange={event => onRowsPerPageUpdate(event.target.value)}>
        <option value='10' selected>10</option>
        <option value='25'>25</option>
        <option value='50'>50</option>
        <option value='75'>75</option>
      </select>
      <div className='ml-8'>
        <BillsPagination currentPage={currentPage} totalPage={totalPage} onPageUpdate={onPageNumberUpdate} />
      </div>
    </div>
  );
};

const BillsPagination = (props) => {
  const { currentPage, totalPage, onPageUpdate } = props;

  const pageUpdate = (pageNumber) => {
    onPageUpdate(pageNumber);
  };

  const pageNumberList = [];
  for (let i = 0; i < totalPage; i++) {
    pageNumberList.push(i + 1);
  }

  return (
    <div className='flex'>
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

const BillPill = (props) => {
  const text = props.text;
  return (
    <div className='rounded-lg bg-rose-100 py-1 px-2'>
      <span>{text}</span>
    </div>
  );
};

const CurrentBill = (props) => {
  const { bill } = props;
  return (
    <div className='flex flex-col p-4 mb-4 bg-white rounded-lg'>
      <h2 className='text-2xl font-bold'>{bill.bill_title}</h2>
      <p className='text-sm'>{bill.sponsor_name}</p>
      <div className='flex flex-row'>
        <BillPill text={bill.status} />
      </div>
    </div>
  );
};

const CurrentBillsContent = (props) => {
  const { bills } = props;
  console.log('current bills content', props);

  if (!bills) {
    return null;
  }

  return (
    bills.map(bill => {
      return (
        <CurrentBill bill={bill} />
      )
    })
  );
};

const PreviousBillsTable = (props) => {
  const { bills } = props;
  console.log('previous bills content', props);

  if (!bills) {
    return null;
  }

  const TableHeader = () => {
    return (
      <div className='py-2.5 flex flex-row' style={{ backgroundColor: '#fcbc22' }}>
        <p className='pl-2.5 pr-3.5' style={{ flexBasis: '12%' }}>Bills No.</p>
        <p className='px-3.5' style={{ flexBasis: '40%' }}>Bills Name</p>
        <p className='px-3.5' style={{ flexBasis: '12%' }}>Sponsor</p>
        <p className='px-3.5' style={{ flexBasis: '12%' }}>Status</p>
        <p className='px-3.5' style={{ flexBasis: '6%' }}>Term</p>
        <p style={{ flexBasis: '18%' }}>Link to Congress.gov</p>
      </div>
    );
  };

  const TableRow = (props) => {
    const { bill } = props;

    const onLinkButton = (url) => {
      window.open(url, '_blank', 'noopener');
    };

    return (
      <div className='py-2.5 flex flex-row previous-bills-table-row-bg'>
        <p className='pl-2.5 pr-3.5' style={{ flexBasis: '12%' }}>{bill.bill_code}</p>
        <p className='px-3.5' style={{ flexBasis: '40%' }}>{bill.bill_title}</p>
        <p className='px-3.5' style={{ flexBasis: '12%' }}>{bill.sponsor_name}</p>
        <p className='px-3.5' style={{ flexBasis: '12%' }}>{bill.status}</p>
        <p className='px-3.5' style={{ flexBasis: '6%' }}>{bill.congress_term}</p>
        <div style={{ flexBasis: '18%' }}>
          <button className='rounded-xl border border-solid px-2.5 py-2.5' style={{ borderColor: '#433059', fontColor: '#433059' }} onClick={() => onLinkButton(bill.url)}>
            View bill in congress.gov
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className='flex flex-col'>
      <TableHeader />
      {bills.map(bill => {
        return <TableRow bill={bill} />;
      })}
    </div>
  );
};

const PreviousBillsList = (props) => {
  const { bills } = props;

  const PreviousBillListing = (props) => {
    const { bill } = props;
    return (
      <div className='p-2 rounded-lg bg-white mb-2'>
        <p>{bill.bill_title}</p>
        <span className='flex flex-row'>
          <p className='font-bold'>Bills No.:&nbsp;</p>
          <p>{bill.bill_code}</p>
        </span>
        <span className='flex flex-row'>
          <p className='font-bold'>Sponsor:&nbsp;</p>
          <p>{bill.sponsor_name}</p>
        </span>
        <span className='flex flex-row'>
          <p className='font-bold'>Status:&nbsp;</p>
          <p>{bill.status}</p>
        </span>
        <span className='flex flex-row'>
          <p className='font-bold'>Term:&nbsp;</p>
          <p>{bill.congress_term}</p>
        </span>
        <a target='_blank' href={bill.url}>View bill in Congress.gov</a>
      </div>
    );
  };

  return (
    <div className='flex flex-col'>
      {bills.map(bill => {
        return <PreviousBillListing bill={bill} />;
      })}
    </div>
  );
};

const CurrentBillsPanel = (props) => {
  const { bills } = props;

  const onControlUpdate = (control) => {
    console.log('current control update', control)
  };

  return (
    <div className='flex flex-col'>
      <CurrentBillsControl className='justify-end my-7' onUpdate={onControlUpdate} />
      <CurrentBillsContent bills={bills} />
      <CurrentBillsPaging />
    </div>
  );
};

const PreviousBillsPanel = (props) => {
  const { bills: allBills } = props;

  const [filteredBills, setFilteredBills] = React.useState(allBills);
  const [showBills, setShowBills] = React.useState([]);
  const [pageNum, setPageNum] = React.useState(1);
  const [totalPage, setTotalPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    setTotalPage(Math.ceil(allBills.length / 10));
    setFilteredBills(allBills);
    const showBills = allBills.slice(0, 10);
    setShowBills(showBills);
  }, [allBills]);

  React.useEffect(() => {
    const start = (pageNum - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const showBills = filteredBills.slice(start, end);
    setShowBills(showBills);
  }, [pageNum, rowsPerPage, filteredBills]);

  const onFilterUpdate = (filters) => {
    const filteredBills = allBills.filter(bill => {
      return !!filters[bill.congress_term];
    });
    setTotalPage(Math.ceil(filteredBills.length / rowsPerPage));
    setPageNum(1);
    setFilteredBills(filteredBills);
  };

  const onRowsUpdate = (value) => {
    setTotalPage(Math.ceil(filteredBills.length / value));
    setRowsPerPage(value);
  };

  const onPageUpdate = (value) => {
    setPageNum(value);
  };

  return (
    <div className='flex flex-col'>
      <PreviousBillsFilter className='justify-end my-7' onUpdate={onFilterUpdate} />
      <div className='hidden md:block'>
        <PreviousBillsTable bills={showBills} />
      </div>
      <div className='block md:hidden'>
        <PreviousBillsList bills={showBills} />
      </div>
      <PreviousBillsPaging
        className='justify-end py-2.5 bg-white'
        currentPage={pageNum}
        totalPage={totalPage}
        onRowsUpdate={onRowsUpdate}
        onPageUpdate={onPageUpdate}
      />
    </div>
  );
};

const CurrentBills = () => {
  const [allBills, setAllBills] = React.useState([]);

  React.useEffect(() => {
    getEndpoint('bills', 'current').then(bills => {
      console.log('current bills', bills);
      setAllBills(bills);
    });
  }, []);

  return <CurrentBillsPanel bills={allBills} />;
};

const PreviousBills = () => {
  const [allBills, setAllBills] = React.useState([]);

  React.useEffect(() => {
    getEndpoint('bills', 'past').then(bills => {
      console.log('all past bills', bills);
      setAllBills(bills);
    });
  }, []);

  return <PreviousBillsPanel bills={allBills} />;
};

ReactDOM.render(<CurrentBills />, document.getElementById('current-bills-container'));
ReactDOM.render(<PreviousBills />, document.getElementById('previous-bills-container'));
