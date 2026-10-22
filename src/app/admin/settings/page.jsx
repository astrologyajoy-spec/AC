'use client';
import { useState, useEffect } from 'react'; // useEffect hooks add kora holo

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    id: 1,
    shop_name: '',
    legal_name: '',
    owner_name: '',
    gstin: '',
    pan: '',
    trade_license: '',
    udyam_msme: '',
    fssai_no: '',
    cin: '',
    iec_code: '',
    phone: '',
    alt_phone: '',
    email: '',
    website: '',
    address: '',
    dispatch_address: '',
    state: '',
    state_code: '',
    pincode: '',
    account_holder_name: '',
    bank_name: '',
    branch_name: '',
    account_no: '',
    ifsc_code: '',
    micr_code: '',
    upi_id: '',
    logo_url: '',
    signature_url: '',
    invoice_prefix: '',
    invoice_terms: ''
  });

  const [loading, setLoading] = useState(true); // Data fetch loading track

  // ==================== NEW CODE: AUTOMATIC DATA LOAD ====================
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/shop/profile');
        const result = await res.json();
        if (result.success && result.data) {
          // Database er null values gulo ke empty string e convert kora hchche
          const cleanData = {};
          Object.keys(result.data).forEach(key => {
            cleanData[key] = result.data[key] === null ? '' : result.data[key];
          });
          setFormData(cleanData);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shop/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Profile Updated Successfully!"); // Success alert updated
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to connect to the server!");
    }
  };

  // Loading screen layout
  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial', fontWeight: 'bold' }}>Loading Shop Profile Data...</div>;
  }

  // High Visibility Border Styles (Ager design thik ache)
  const styles = {
    container: { padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#1a202c' },
    heading: { borderBottom: '3px solid #2b6cb0', paddingBottom: '10px', color: '#2b6cb0', marginBottom: '25px', fontSize: '26px', fontWeight: 'bold' },
    sectionHeading: { background: '#ebf8ff', padding: '10px 15px', color: '#2b6cb0', marginTop: '30px', borderRadius: '6px', fontSize: '18px', fontWeight: 'bold', borderLeft: '5px solid #2b6cb0' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' },
    label: { display: 'flex', flexDirection: 'column', fontWeight: 'bold', fontSize: '14px', color: '#4a5568' },
    input: { width: '100%', padding: '12px', marginTop: '6px', border: '2px solid #2d3748', borderRadius: '6px', fontSize: '15px', outline: 'none', backgroundColor: '#ffffff', color: '#000000' },
    textarea: { width: '100%', padding: '12px', marginTop: '6px', border: '2px solid #2d3748', borderRadius: '6px', fontSize: '15px', height: '90px', resize: 'vertical', backgroundColor: '#ffffff', color: '#000000' },
    button: { padding: '14px 35px', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '35px', transition: 'background 0.2s' }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Shop Profile Configuration</h2>
      <form onSubmit={handleSubmit}>
        
        {/* SECTION 1: Identity */}
        <h3 style={styles.sectionHeading}>1. Company Identity</h3>
        <div style={styles.grid}>
          <label style={styles.label}>Shop Name *
            <input type="text" name="shop_name" value={formData.shop_name} onChange={handleChange} style={styles.input} required />
          </label>
          <label style={styles.label}>Legal Name (Trade Name)
            <input type="text" name="legal_name" value={formData.legal_name} onChange={handleChange} style={styles.input} />
          </label>
          <label style={{...styles.label, gridColumn: 'span 2'}}>Owner Name
            <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} style={styles.input} />
          </label>
        </div>

        {/* SECTION 2: Contact Info */}
        <h3 style={styles.sectionHeading}>2. Contact Specifications</h3>
        <div style={styles.grid}>
          <label style={styles.label}>Primary Phone *
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={styles.input} required />
          </label>
          <label style={styles.label}>Alternative Phone
            <input type="text" name="alt_phone" value={formData.alt_phone} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>Official Email ID
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>Website URL
            <input type="url" name="website" value={formData.website} onChange={handleChange} style={styles.input} />
          </label>
        </div>

        {/* SECTION 3: Legal Registrations */}
        <h3 style={styles.sectionHeading}>3. Legal & Tax Registrations</h3>
        <div style={styles.grid}>
          <label style={styles.label}>GSTIN
            <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} style={styles.input} maxLength="15" />
          </label>
          <label style={styles.label}>PAN
            <input type="text" name="pan" value={formData.pan} onChange={handleChange} style={styles.input} maxLength="10" />
          </label>
          <label style={styles.label}>Trade License
            <input type="text" name="trade_license" value={formData.trade_license} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>Udyam MSME
            <input type="text" name="udyam_msme" value={formData.udyam_msme} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>FSSAI No
            <input type="text" name="fssai_no" value={formData.fssai_no} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>CIN
            <input type="text" name="cin" value={formData.cin} onChange={handleChange} style={styles.input} maxLength="21" />
          </label>
          <label style={{...styles.label, gridColumn: 'span 2'}}>IEC Code
            <input type="text" name="iec_code" value={formData.iec_code} onChange={handleChange} style={styles.input} />
          </label>
        </div>

        {/* SECTION 4: Address Details */}
        <h3 style={styles.sectionHeading}>4. Address Logistics</h3>
        <div style={{...styles.grid, gridTemplateColumns: '1fr'}}>
          <label style={styles.label}>Billing Address
            <textarea name="address" value={formData.address} onChange={handleChange} style={styles.textarea}></textarea>
          </label>
          <label style={styles.label}>Dispatch Address
            <textarea name="dispatch_address" value={formData.dispatch_address} onChange={handleChange} style={styles.textarea}></textarea>
          </label>
        </div>
        <div style={{...styles.grid, gridTemplateColumns: '1fr 1fr 1fr'}}>
          <label style={styles.label}>State
            <input type="text" name="state" value={formData.state} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>State Code
            <input type="number" name="state_code" value={formData.state_code} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>Pincode
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} style={styles.input} maxLength="6" />
          </label>
        </div>

        {/* SECTION 5: Banking Details */}
        <h3 style={styles.sectionHeading}>5. Financial & Settlement Accounts</h3>
        <div style={styles.grid}>
          <label style={styles.label}>Account Holder Name
            <input type="text" name="account_holder_name" value={formData.account_holder_name} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>Bank Name
            <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>Branch Name
            <input type="text" name="branch_name" value={formData.branch_name} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>Account Number
            <input type="text" name="account_no" value={formData.account_no} onChange={handleChange} style={styles.input} />
          </label>
          <label style={styles.label}>IFSC Code
            <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} style={styles.input} maxLength="11" />
          </label>
          <label style={styles.label}>MICR Code
            <input type="text" name="micr_code" value={formData.micr_code} onChange={handleChange} style={styles.input} maxLength="9" />
          </label>
          <label style={{...styles.label, gridColumn: 'span 2'}}>UPI ID
            <input type="text" name="upi_id" value={formData.upi_id} onChange={handleChange} style={styles.input} />
          </label>
        </div>

        {/* SECTION 6: Branding */}
        <h3 style={styles.sectionHeading}>6. Document Branding & Declarations</h3>
        <div style={styles.grid}>
          <label style={styles.label}>Logo URL
            <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} style={styles.input} placeholder="https://..." />
          </label>
          <label style={styles.label}>Signature URL
            <input type="text" name="signature_url" value={formData.signature_url} onChange={handleChange} style={styles.input} placeholder="https://..." />
          </label>
          <label style={{...styles.label, gridColumn: 'span 2'}}>Invoice Bill Prefix
            <input type="text" name="invoice_prefix" value={formData.invoice_prefix} onChange={handleChange} style={styles.input} />
          </label>
          <label style={{...styles.label, gridColumn: 'span 2'}}>Terms & Conditions
            <textarea name="invoice_terms" value={formData.invoice_terms} onChange={handleChange} style={styles.textarea} placeholder="Terms of services..."></textarea>
          </label>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button type="submit" style={styles.button}>Update Profile</button>
        </div>
      </form>
    </div>
  );
}