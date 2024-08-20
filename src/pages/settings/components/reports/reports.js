import { Link } from 'react-router-dom';
import PageWithSidebar from '../../../../common/components/page-with-sidebar/PageWithSidebar';
import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../../../common/utils/env.config';
import { toast } from 'react-toastify';

const Report = () => {
  const [businessEmails, setBusinessEmails] = useState('');
  const [businessContacts, setBusinessContacts] = useState('');
  const [operationEmails, setOperationEmails] = useState('');
  const [operationContacts, setOperationContacts] = useState('');

  const [emailError, setEmailError] = useState('');
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    fetch(`${BACKEND_URL}/users/get_communications_details/?user_id=${localStorage.getItem('user_id')}`)
      .then((response) => response.json())
      .then((data) => {
        setBusinessEmails(data.business_email || '');
        setBusinessContacts(data.business_number || '');
        setOperationEmails(data.operation_email || '');
        setOperationContacts(data.operation_number || '');
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleAddItem = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value) {
        if (type.includes('Email')) {
          if (!value.includes('@')) {
            setEmailError('Please enter a valid email address.');
            return;
          }
          setEmailError('');
        } else if (type.includes('Contact')) {
          if (value.length !== 10 || !/^\d+$/.test(value)) {
            setContactError('Please enter a valid 10-digit contact number.');
            return;
          }
          setContactError('');
        }

        switch (type) {
          case 'businessEmail':
            setBusinessEmails((prev) => (prev ? `${prev}, ${value}` : value));
            break;
          case 'businessContact':
            setBusinessContacts((prev) => (prev ? `${prev}, ${value}` : value));
            break;
          case 'operationEmail':
            setOperationEmails((prev) => (prev ? `${prev}, ${value}` : value));
            break;
          case 'operationContact':
            setOperationContacts((prev) => (prev ? `${prev}, ${value}` : value));
            break;
          default:
            break;
        }
        e.target.value = '';
      } else {
        if (type.includes('Email')) {
          setEmailError('Please enter a valid email address.');
        } else {
          setContactError('Please enter a valid contact number.');
        }
      }
    }
  };

  const handleRemoveItem = (type, itemToRemove) => {
    switch (type) {
      case 'businessEmail':
        setBusinessEmails((prev) =>
          prev
            .split(',')
            .filter((email) => email.trim() !== itemToRemove)
            .join(', '),
        );
        break;
      case 'businessContact':
        setBusinessContacts((prev) =>
          prev
            .split(',')
            .filter((contact) => contact.trim() !== itemToRemove)
            .join(', '),
        );
        break;
      case 'operationEmail':
        setOperationEmails((prev) =>
          prev
            .split(',')
            .filter((email) => email.trim() !== itemToRemove)
            .join(', '),
        );
        break;
      case 'operationContact':
        setOperationContacts((prev) =>
          prev
            .split(',')
            .filter((contact) => contact.trim() !== itemToRemove)
            .join(', '),
        );
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      business_email: businessEmails,
      business_number: businessContacts,
      operation_email: operationEmails,
      operation_number: operationContacts,
      user_id: localStorage.getItem('user_id'),
    };

    fetch(`${BACKEND_URL}/users/add_communications_details`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        toast.success('Save successful!');
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <PageWithSidebar>
      <div className="header mx-2 border-b border-[#b3b3b3] bg-[#FAFBFC] p-2 text-xl">Settings-Early COD</div>
      <div className="mx-2 w-full bg-[#EDEDED] px-6 pb-16">
        <div className="pb-5 pt-2 font-bold text-[#656565]">
          <Link to={'/settings'} className="font-semibold text-green-500">
            Settings
          </Link>{' '}
          &gt; Seller Remittance &gt; Early COD Remittance
        </div>
        <div className="flex flex-col gap-3 bg-white p-7">
          <h2 className="text-lg text-xl  font-bold">Reports</h2>
          <p className="blurred-text mb-4">
            Communications related to business or operations will be sent to the email ids & contact numbers
            provided below.
          </p>

          <div className="mb-4">
            <h3 className="mb-2 text-lg font-bold">For Business Related Communication</h3>
            <p className="blurred-text">
              Add email id(s) and mobile number(s) to receive business related communication like COD
              Remittance, etc.
            </p>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
                  Email Id
                </label>
                <div
                  className={`mt-1 flex flex-wrap items-center justify-start gap-1
                     rounded-md border border-gray-300 p-1 shadow-sm ${emailError ? 'border-red-500' : ''}`}>
                  {businessEmails.split(',').map(
                    (email, index) =>
                      email.trim() && (
                        <span key={index} className="inline-block rounded-md bg-red-200 px-2 py-1">
                          {email.trim()}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem('businessEmail', email.trim())}>
                            &times;
                          </button>
                        </span>
                      ),
                  )}
                  <input
                    type="email"
                    id="businessEmail"
                    className={`block border-none outline-none focus:border-none focus:ring-0 sm:text-sm `}
                    placeholder="Enter email id and enter"
                    onKeyDown={(e) => handleAddItem(e, 'businessEmail')}
                  />
                </div>

                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="businessContact" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="businessContact"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      contactError ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter contact number and press enter"
                    onKeyDown={(e) => handleAddItem(e, 'businessContact')}
                  />
                  {contactError && <p className="text-sm text-red-500">{contactError}</p>}
                </div>
                <div className="mt-2 text-sm">
                  {businessContacts.split(',').map(
                    (contact, index) =>
                      contact.trim() && (
                        <span key={index} className="mb-2 mr-2 inline-block rounded-md bg-red-200 px-2 py-1">
                          {contact.trim()}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem('businessContact', contact.trim())}>
                            &times;
                          </button>
                        </span>
                      ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-lg font-bold">For Operation Related Communication</h3>
            <p className="blurred-text">
              Add email id(s) and mobile number(s) to receive operations related communication like Label,
              Order Invoice, Manifest, NDR, etc.
            </p>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="operationEmail" className="block text-sm font-medium text-gray-700">
                  Email Id
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="operationEmail"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      emailError ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter email id and press enter"
                    onKeyDown={(e) => handleAddItem(e, 'operationEmail')}
                  />
                  {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                </div>
                <div className="mt-2 text-sm">
                  {operationEmails.split(',').map(
                    (email, index) =>
                      email.trim() && (
                        <span key={index} className="mb-2 mr-2 inline-block rounded-md bg-red-200 px-2 py-1">
                          {email.trim()}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem('operationEmail', email.trim())}>
                            &times;
                          </button>
                        </span>
                      ),
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label htmlFor="operationContact" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="operationContact"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      contactError ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter contact number and press enter"
                    onKeyDown={(e) => handleAddItem(e, 'operationContact')}
                  />
                  {contactError && <p className="text-sm text-red-500">{contactError}</p>}
                </div>
                <div className="mt-2 text-sm">
                  {operationContacts.split(',').map(
                    (contact, index) =>
                      contact.trim() && (
                        <span key={index} className="mb-2 mr-2 inline-block rounded-md bg-red-200 px-2 py-1">
                          {contact.trim()}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem('operationContact', contact.trim())}>
                            &times;
                          </button>
                        </span>
                      ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-[100px] rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
            onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </PageWithSidebar>
  );
};

export default Report;
