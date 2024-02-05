const BillsControl = () => {
  return <div>Bills control</div>;
};

const CurrentBillsPaging = () => {
  return <div>Current bills paging</div>
};

const CurrentBillsContent = (props) => {
  const { bills } = props;

  const CurrentBill = (props) => {
    const { bill } = props;
    return (
      <div className='flex'>
        <h2>{bill.bill_title}</h2>
        <p>{bill.sponsor_name}</p>
      </div>
    );
  };

  return (
    bills.map(bill => {
      return (
        <CurrentBill bill={bill} />
      )
    })
  );
};

const CurrentBillsPanel = () => {
  return (
    <div className='flex'>
      <BillsControl />
      <CurrentBillsContent />
      <CurrentBillsPaging />
    </div>
  );
};

const PreviousBillsPanel = () => {
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
  const [allBills, setAllBills] = React.useState([]);

  React.useEffect(() => {
    getEndpoint('bills', 'current').then(bills => {
      console.log('current bills', bills);
      setAllBills(bills);
    });
  }, []);

  return <CurrentBillsPanel />;
};

const PreviousBills = () => {
  const [allBills, setAllBills] = React.useState([]);

  React.useEffect(() => {
    getEndpoint('bills', 'past').then(bills => {
      console.log('past bills', bills);
      setAllBills(bills);
    });
  }, []);

  return <PreviousBillsPanel />;
};

ReactDOM.render(<CurrentBills />, document.getElementById('current-bills-container'));
ReactDOM.render(<PreviousBills />, document.getElementById('previous-bills-container'));
