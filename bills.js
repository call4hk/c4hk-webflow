const BillsControl = () => {
  return <div>Bills control</div>;
};

const CurrentBillsPaging = () => {
  return <div>Current bills paging</div>
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
    <div className='flex flex-col mb-4 bg-white rounded-lg'>
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

const CurrentBillsPanel = (props) => {
  const { bills } = props;
  return (
    <div className='flex flex-col'>
      <BillsControl />
      <CurrentBillsContent bills={bills} />
      <CurrentBillsPaging />
    </div>
  );
};

const PreviousBillsPanel = (props) => {
  const { bills } = props;
  return <div>previous</div>;
  /*
  return (
    <div className='flex'>
      <BillsControl />
      <PreviousBillsContent />
      <PreviousBillsPaging />
    </div>
  );
  */
};

const CurrentBills = () => {
  const [allBills, setAllBills] = React.useState([
    {
      bill_title: 'test title',
      sponsor_name: 'Test Sponsor',
      status: 'Intro to House',
    },
    {
      bill_title: 'test title 2',
      sponsor_name: 'Test Sponsor2',
      status: 'Intro to House',
    }
  ]);

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
      console.log('past bills', bills);
      setAllBills(bills);
    });
  }, []);

  return <PreviousBillsPanel bills={allBills} />;
};

ReactDOM.render(<CurrentBills />, document.getElementById('current-bills-container'));
ReactDOM.render(<PreviousBills />, document.getElementById('previous-bills-container'));
