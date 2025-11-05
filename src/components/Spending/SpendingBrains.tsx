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
import styles from './SpendingBrains.module.css';
import { getAllCanItemsUser, type CanItemUser} from '../../services/ItemConnection';
import { createCanItemUser, deleteCanItemUser } from '../../services/ItemConnection';
import { getBalancesUser } from '../../services/BalanceConnection';
import { getMe } from '../../services/Auth';
// import trashIcon from '../../assets/trash3.svg';
import { resetCanUserState } from '../../services/BalanceConnection';

function SpendingBrains() {
  const [userId, setUserId] = useState<number | null>(null);
  // const [can, setCan] = useState(false);
  // const [totalCan, setTotalCan] = useState(0);
  // const [myTotalCan] = useState<number>(500);
  // const [myTotalMoney] = useState<number>(15941.40);
  // const [totalMoney, setTotalMoney] = useState(0);
  const [totalCanUser, setTotalCanUser] = useState(0);
  // const [myTotalCanUser] = useState<number>(1000);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const pad = (n: number) => String(n).padStart(2, '0');
  const nowForDatetimeLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [formData, setFormData] = useState({
    date: nowForDatetimeLocal(),
    price: '',
    description: ''
  });
  // const [txns, setTxns] = useState<Item[]>([]);
  // const [canTxns, setCanTxns] = useState<CanItem[]>([]);
  const [canUserTxns, setCanUserTxns] = useState<CanItemUser[]>([]);
  const [myTotalCanUser, setMyTotalCanUser] = useState<string>('0.00');
  const handleMyTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) v = parts[0] + '.' + parts[1];
    setMyTotalCanUser(v);
  };

useEffect(() => {
  (async () => {
    try {
      const me = await getMe();
      const id = Number(me.id);
      setUserId(id);

      await Promise.all([
        fetchBalancesById(id),
        fetchItemsById(id),
      ]);
    } catch (e) {
      console.error('init load failed', e);
      // ✅ Default user fallback
      const defaultId = 3; // ← change this to whatever user ID you want
      setUserId(defaultId);
      await Promise.all([
        fetchBalancesById(defaultId),
        fetchItemsById(defaultId),
      ]);
    } finally {
      setLoading(false);
    }
  })();
}, []);

const fetchBalancesById = async (id: number) => {
  try {
    const canData = await getBalancesUser(id);

    if (!Array.isArray(canData) || canData.length === 0) {
      setTotalCanUser(0);        // current total
      setMyTotalCanUser('0.00'); // target total (editable)
      return;
    }

    // Helpers to sort safely
    const getTime = (o: any, k: 'createdAt' | 'updatedAt') =>
      o?.[k] ? new Date(o[k]).getTime() : null;

    // Oldest = first added (prefer createdAt; fallback to smallest PK)
    const byOldest = [...canData].sort((a: any, b: any) => {
      const at = getTime(a, 'createdAt');
      const bt = getTime(b, 'createdAt');
      if (at != null && bt != null) return at - bt;
      const ak = a.canBalanceUserId ?? a.id ?? Number.MAX_SAFE_INTEGER;
      const bk = b.canBalanceUserId ?? b.id ?? Number.MAX_SAFE_INTEGER;
      return ak - bk;
    });
    const target = byOldest[0]; // first-ever balance

    // Newest = last/current (prefer updatedAt; fallback to largest PK)
    const byNewest = [...canData].sort((a: any, b: any) => {
      const at = getTime(a, 'updatedAt') ?? getTime(a, 'createdAt');
      const bt = getTime(b, 'updatedAt') ?? getTime(b, 'createdAt');
      if (at != null && bt != null) return bt - at;
      const ak = a.canBalanceUserId ?? a.id ?? -1;
      const bk = b.canBalanceUserId ?? b.id ?? -1;
      return bk - ak;
    });
    const current = byNewest[0]; // latest balance

    const targetTotal = Number(target?.total) || 0;
    const currentTotal = Number(current?.total) || 0;

    // UI states
    setMyTotalCanUser(targetTotal.toFixed(2)); // the editable “Target total”
    setTotalCanUser(currentTotal);             // the displayed “Current total”
  } catch (err) {
    console.error('Failed to fetch balance', err);
  }
};



const fetchItemsById = async (id: number) => {
  try {
    const canUserData = await getAllCanItemsUser(id);
    setCanUserTxns(canUserData); // no guard; [] will clear the UI
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
          [id]: sanitizedValue
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
      await createCanItemUser(payload);

      setToast({ type: 'success', message: 'Item added successfully!' });

      // Refresh data
      await fetchItemsById(userId!);
      await fetchBalancesById(userId!);

      // Close modal and reset form
      setShowModalAdd(false);
      setFormData({
        date: nowForDatetimeLocal(),
        price: '',
        description: ''
      });
    } catch (err) {
      setToast({ type: 'error', message: `Failed to add item.` });
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
<div
  className={`${styles.centerWrapper}`}
>
    
      <div className="text-center">
        <div className="mb-4">
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer" style={{ display: 'none' }}>
           
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" style={{display: 'flex', justifyContent: 'center', alignItems: 'center',}} className={styles.card}>
            <img src={dollarLogo} className="logo react" alt="Dollar logo" style={{height: '6em', filter: 'invert(1)'}} />
          </a>
        </div>
        
        {/* <h1 className="display-4 mb-4"> {can? <>&#36;{Number(myTotalCan).toFixed(2)}</> : <>&#8364;{Number(myTotalMoney).toFixed(2)}</>}</h1>
        <h1 className="display-4 mb-4"> {can? <>&#36;{Number(totalCan).toFixed(2)}</> : <>&#8364;{Number(totalMoney).toFixed(2)}</>}</h1> */}
{/* Totals Card */}
<div className="d-flex justify-content-center my-4">
  <Card className={`w-100 text-center ${styles.card}`} style={{ maxWidth: '420px' }}>
    <Card.Body className="py-4">
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-center gap-2">
          <span className="fs-5 ">Target total</span>
          {/* <span className="badge bg-warning text-dark">editable</span> */}
        </div>

        

        <div className={`d-inline-flex align-items-center justify-content-center mt-2 ${styles.editableInputWrapper}`}>
          <span className="me-1 display-6">$</span>
          <input
            id="myTotalCanUser"
            type="text"
            value={myTotalCanUser}
            style={{color:'white'}}
            onChange={handleMyTotalChange}
            onBlur={() => {
              const n = parseFloat(myTotalCanUser || '0');
              setMyTotalCanUser(isNaN(n) ? '0.00' : n.toFixed(2));
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // stop form submission or unwanted side-effects
                const parsed = parseFloat((myTotalCanUser || '0').replace(',', '.'));
                if (Number.isNaN(parsed)) {
                  setToast({ type: 'error', message: 'Please enter a valid number for the target total.' });
                  return;
                }

                try {
                  setLoading(true);
                  await resetCanUserState(userId!, parsed);
                  setToast({ type: 'success', message: 'Account reset. Current total updated.' });

                  // Refresh data
                  await fetchItemsById(userId!);
                  await fetchBalancesById(userId!);
                } catch (err) {
                  setToast({ type: 'error', message: 'Failed to reset. Please try again.' });
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }
            }}
            className={`display-6 text-center ${styles.bigMoneyInput}`}
            aria-label="Edit your target total"
            aria-describedby="targetHelp"
          />
          <i
            className="bi bi-pencil-square ms-2"
            aria-hidden="true"
            title="Click the number to edit"
          ></i>
        </div>

        <div id="targetHelp" className={`mt-2 ${styles.editableHint}`}>
          Click the number to edit your target
        </div>
      </div>

      <hr className="my-3" />

      <div>
        <div className="fs-6 text-muted">Current total</div>
        <div className="display-6">${Number(totalCanUser).toFixed(2)}</div>
      </div>
    </Card.Body>
  </Card>
</div>




       
        {/* <Btn variant="primary" className="mb-4" onClick={() => setCan(!can)}>
          Canadian 
        </Btn> */}

        <div className={`card mx-auto ${styles.card}`} style={{maxWidth: '400px'}}>
          <div className="card-body">
            <button 
              className="btn btn-primary btn-lg mb-3" 
              onClick={() => {
                setFormData(f => ({ ...f, date: nowForDatetimeLocal() }));
                setShowModalAdd(true);
              }}
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
        
        <p className=" mt-4">
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
            type="datetime-local"
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

export default SpendingBrains;
