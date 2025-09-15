import { useState, useEffect } from 'react';
import Btn from 'react-bootstrap/Button';
import { Modal, Card, Accordion, /*Container, Row, Col, Collapse*/ } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import { Alert, InputLabel } from '@mui/material';
// import Autocomplete from '@mui/material/Autocomplete';
// import TextField from '@mui/material/TextField';
// import reactLogo from '../../assets/react.svg';
import dollarLogo from '../../assets/dollar.svg';
import styles from './Spending.module.css';
import { getAllCanItemsUser, type CanItemUser} from '../../services/ItemConnection';
import { createCanItemUser, deleteCanItemUser } from '../../services/ItemConnection';
import { getBalancesUser } from '../../services/BalanceConnection';
import { getMe } from '../../services/Auth';
// import trashIcon from '../../assets/trash3.svg';

function SpendingPage() {
  const [userId, setUserId] = useState<number | null>(null);
  // const [can, setCan] = useState(false);
  // const [totalCan, setTotalCan] = useState(0);
  // const [myTotalCan] = useState<number>(500);
  // const [myTotalMoney] = useState<number>(15941.40);
  // const [totalMoney, setTotalMoney] = useState(0);
  const [totalCanUser, setTotalCanUser] = useState(0);
  const [myTotalCanUser] = useState<number>(1000);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], 
    price: '',
    description: ''
  });
  // const [txns, setTxns] = useState<Item[]>([]);
  // const [canTxns, setCanTxns] = useState<CanItem[]>([]);
  const [canUserTxns, setCanUserTxns] = useState<CanItemUser[]>([]);
 
  useEffect(() => {
  (async () => {
    try {
      const me = await getMe();
      const id = Number(me.id);
      setUserId(id);

      // run both with the local id to avoid the stale 0
      await Promise.all([
        fetchBalancesById(id),
        fetchItemsById(id),
      ]);
    } catch (e) {
      console.error('init load failed', e);
    } finally {
      setLoading(false);
    }
  })();
}, []);
  const fetchBalancesById = async (id: number) => {
  try {
    const canData = await getBalancesUser(id);
    if (canData.length > 0) setTotalCanUser(canData[canData.length - 1].total);
  } catch (err) {
    console.error('Failed to fetch balance', err);
  }
};

const fetchItemsById = async (id: number) => {
  try {
    const canUserData = await getAllCanItemsUser(id);
    if (canUserData.length > 0) setCanUserTxns(canUserData);
  } catch (err) {
    console.error('Failed to fetch items', err);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;

      let sanitizedValue = value;

      if (id === 'description') {
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s.,!?'-]/g, '');
      }

      if (id === 'price') {
        sanitizedValue = value.replace(',', '.');

        sanitizedValue = sanitizedValue.replace(/[^0-9.]/g, '');

        const parts = sanitizedValue.split('.');
        if (parts.length > 2) {
          sanitizedValue = parts[0] + '.' + parts[1]; 
        }
      }

      setFormData(prevState => ({
          ...prevState,
          [id]: sanitizedValue,
      }));
  };

  function getRelativeTime(dateString: string): string {
    const now = new Date();
    const then = new Date(dateString);
  
    // Strip the time portion by setting to midnight
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const utcThen = Date.UTC(then.getFullYear(), then.getMonth(), then.getDate());
  
    const diffDays = Math.floor((utcNow - utcThen) / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const handleSubmitItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      // Prepare payload
      const payload = {
        price: parseFloat(formData.price),
        date: formData.date,
        description: formData.description,
        userId: userId!
      };

      // Call your API
      // if (can) {
      //   await createCanItem(payload);
      // } else {
      //   await createItem(payload);
      // }
      await createCanItemUser(payload, userId!);

      setToast({ type: 'success', message: 'Item added successfully!' });

      // Refresh data
      await fetchItemsById(userId!);
      await fetchBalancesById(userId!);

      // Close modal and reset form
      setShowModalAdd(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        price: '',
        description: ''
      });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to add item.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    console.log('Delete item with ID:', itemId);  

    // if (can) {
    //   setCanTxns(prev => prev.filter(item => item.canItemId !== itemId));
    // } else {
    //   setTxns(prev => prev.filter(item => item.itemId !== itemId));
    // }
    setCanUserTxns(prev => prev.filter(item => item.canItemUserId !== itemId));
    
    try {
      // if(can)
      // {
      //   await deleteCanItem(itemId); 
      // }
      // else
      // {
      //   await deleteItem(itemId);  
      // }
      await deleteCanItemUser(itemId, userId!);  
      setToast({ type: 'success', message: 'Item deleted successfully!' });
      await fetchItemsById(userId!);  // Refresh after deletion
      await fetchBalancesById(userId!);
    } catch(err) {
      setToast({ type: 'error', message: 'Failed to delete item.' });
      console.error(err);
    }
  }

  return (
    <>
    <div className="container mt-4">
      <div className="text-center">
        <div className="mb-4">
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
           
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img src={dollarLogo} className="logo react" alt="Dollar logo" style={{height: '6em'}} />
          </a>
        </div>
        
        {/* <h1 className="display-4 mb-4"> {can? <>&#36;{Number(myTotalCan).toFixed(2)}</> : <>&#8364;{Number(myTotalMoney).toFixed(2)}</>}</h1>
        <h1 className="display-4 mb-4"> {can? <>&#36;{Number(totalCan).toFixed(2)}</> : <>&#8364;{Number(totalMoney).toFixed(2)}</>}</h1> */}
        <h1 className="display-4 mb-4"> {<>&#36;{Number(myTotalCanUser).toFixed(2)}</>}</h1>
        <h1 className="display-4 mb-4"> {<>&#36;{Number(totalCanUser).toFixed(2)}</>}</h1>
        {/* <Btn variant="primary" className="mb-4" onClick={() => setCan(!can)}>
          Canadian 
        </Btn> */}
        
        <div className="card mx-auto" style={{maxWidth: '400px'}}>
          <div className="card-body">
            <button 
              className="btn btn-primary btn-lg mb-3" 
              onClick={() => setShowModalAdd(true)}
            >
              Add Item
            </button>
          
            <Accordion>
              {(canUserTxns).map((txn, idx) => (
                <Accordion.Item eventKey={String(idx)} key={((txn as CanItemUser).canItemUserId) || idx} className={styles.customAccordionItem}>
                  <Accordion.Header>
                     {<>&#36;</>}{txn.price} 
                  </Accordion.Header>
                  <Accordion.Body>
                    <Card
                      key={(txn as CanItemUser).canItemUserId || idx}
                      className="w-100 p-0"
                      border="primary"
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <Card.Header className="fw-bold">
                        {txn.description}
                      </Card.Header>
                      <Card.Body>
                        <Card.Text>
                          <i className="bi bi-trash3" style={{ float: 'right', cursor: 'pointer' }}
                            onClick={() => {
                              const itemId = (txn as CanItemUser)?.canItemUserId;
                              if (itemId !== undefined && itemId !== null) {
                                handleDeleteItem(itemId);
                              } else {
                                console.warn("Tried to delete item with undefined ID", txn);
                              }
                            }}
                          ></i>
                          {/* <i className="bi bi-pencil-square" style={{ float: 'right', cursor: 'pointer' }}></i> */}
                          Amount: {<>&#36;</> }{txn.price}  <br />
                          Date: {new Date(txn.date).toLocaleDateString()}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>{getRelativeTime(txn.date)}</Card.Footer>
                    </Card>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
        
        <p className="text-muted mt-4">
          This Web Application is built by Tone 
        </p>
      </div>
    </div>

    <Modal show={showModalAdd} onHide={() => setShowModalAdd(false)} centered >
        <div style={{ backgroundColor: '#fff0e6', borderRadius: '10px', padding: '20px' }}>
          <Form onSubmit={handleSubmitItem}>
        <Modal.Header>
          <Modal.Title>New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form.Group className="mb-3">
          <InputLabel style={{ color: "black" }}>Date</InputLabel>
          <Form.Control
            id="date" 
            type="date"
            value={formData.date}
            // placeholder={textContent.priceInputPlaceholder}
            // isInvalid={!!errors.price}
            onChange={handleInputChange}
            
            style={{ borderTopRightRadius: '5px', borderBottomRightRadius: '5px' }}
            
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <InputLabel style={{ color: "black" }}>Price</InputLabel>
              <InputGroup>
                <Form.Control
                id="price" // price need to get filled in but put disclaimer
                type="text"
                value={formData.price}
                // placeholder={textContent.priceInputPlaceholder}
                // isInvalid={!!errors.price}
                onChange={handleInputChange}
                
                style={{ borderTopRightRadius: '5px', borderBottomRightRadius: '5px' }}
                
                />
              </InputGroup>

          </Form.Group>

          {toast?.message && (
              <div className={styles.successToast}>
                  <Alert severity={toast.type} onClose={() => setToast(null)}>
                      {toast.message}
                  </Alert>
              </div>
          )}
            
            
          <Form.Group className="mb-3">
          <InputLabel style={{color: "black"}}>Description</InputLabel>
            <InputGroup>
              <Form.Control
              id="description" 
              type="text"
              value={formData.description}
              // placeholder={textContent.priceInputPlaceholder}
              // isInvalid={!!errors.price}
              onChange={handleInputChange}
              
              style={{ borderTopRightRadius: '5px', borderBottomRightRadius: '5px' }}
              
              />
            </InputGroup>
          
          </Form.Group>
            
        </Modal.Body>
        <Modal.Footer>
            
        
        <Btn variant="danger" onClick={() => { setShowModalAdd(false); /*handleCancel();*/ }}>
          Cancel
        </Btn>
        <Btn
          variant="primary"
          type="submit"
        >
            {loading? (<>  <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                          />Add  </>) : (`Add`)}
          
      </Btn>
          </Modal.Footer>
          </Form>
          </div>
        </Modal></>
  )
}

export default SpendingPage;
