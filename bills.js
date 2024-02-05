const CurrentBillsPanel = () => {
  return <div>current</div>;
  /*
  return (
    <div className='flex'>
      <BillsControl />
      <CurrentBillsContent />
      <CurrentBillsPaging />
    </div>
  );
  */
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
