import axios from 'axios';
import React from 'react';
import { BACKEND_URL } from '../../common/utils/env.config';
import { createColumnHelper } from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { CustomDataTable, Loader } from '../../common/components';
import { Badge } from 'flowbite-react';
import PageWithSidebar from '../../common/components/page-with-sidebar/PageWithSidebar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const User = () => {
  const [userData, setUserData] = useState([]);
  const [fetchData, setFetchData] = useState(false);
  const navigate = useNavigate();
  const { comp_id } = useParams(); // Use useParams to get the route parameter
  const company_id = comp_id ? comp_id : sessionStorage.getItem('company_id');
  const [showkyc, setShowKyc] = useState(false);
  const [aadharImg, setAadharImg] = useState(null);
  const [userImg, setUserImg] = useState(null);
  const [kyc_status, setKyc_status] = useState(0);
  const is_admin = sessionStorage.getItem('is_admin');
  const [loading, setLoading] = useState(false);
  const [idUser, setIdUser] = useState(null);
  const [searchData, setSearchData] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const user_data = query.length !== 0 ? searchData : userData;

  const { state } = useLocation();

  console.log(state);

  useEffect(() => {
    setLoading(true);
    axios
      .get(BACKEND_URL + `/indent/get_users?company_id=${company_id}`)
      .then((res) => {
        setLoading(false);
        console.log('RESSSSSSSSSSSSS', res);
        setUserData(res.data);
        setFetchData(true);
      })
      .catch((err) => {
        setLoading(false);
        console.log('ERRRRRRRRRR', err);
      });
  }, []);

  const handleIndent = (row) => {
    console.log('yash row', row.original);
    navigate('/all-indent/' + row.original.id);
  };

  const handleFocused = () => {
    setIsFocused(true);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    setIsFocused(false);
  };
  const handleKYC = (row) => {
    // console.log("RRRRRRRR",row,row?.original?.id)
    setIdUser(row?.original?.id);
    setShowKyc(true);
    const headers = { 'Content-Type': 'application/json' };
    setLoading(true);
    axios
      .get(BACKEND_URL + `/kyc/?id=${row?.original?.id}&type=user_aadhar`, { responseType: 'blob' })
      .then((res) => {
        setLoading(false);
        console.log('Recharge Responsee', res);
        const imgUrl = URL.createObjectURL(res.data);
        setAadharImg(imgUrl);
        console.log('PICCCCCCCCCCCCCc', aadharImg);
        // let newVal = sessionStorage.getItem('balance') - rechargeAmount
        // sessionStorage.setItem('balance',newVal)
        // window.location.reload()
      })
      .catch((err) => {
        setLoading(false);
        console.log('Error In Rechargeee', err);
      });

    axios
      .get(BACKEND_URL + `/kyc/?id=${row?.original?.id}&type=selfie`, { responseType: 'blob' })
      .then((res) => {
        setLoading(false);
        console.log('Recharge Responsee', res);
        const imgUrl = URL.createObjectURL(res.data);
        setUserImg(imgUrl);
        console.log('PICCCCCCCCCCCCCc', userImg);
        // let newVal = sessionStorage.getItem('balance') - rechargeAmount
        // sessionStorage.setItem('balance',newVal)
        // window.location.reload()
      })
      .catch((err) => {
        setLoading(false);
        console.log('Error In Rechargeee', err);
      });
  };

  const handleAcceptKYC = () => {
    setKyc_status(1);
    const headers = { 'Content-Type': 'application/json' };
    setLoading(true);
    axios
      .post(BACKEND_URL + `/kyc/kyc_status/?client_type=user&status=${3}&id=${idUser}`, { headers })
      .then((res) => {
        setLoading(false);
        console.log('Response ', res);
        toast('KYC Verification Successfully', { type: 'success' });
        setShowKyc(false);
        localStorage.setItem('is_kyc', 3);
        navigate('/book');
        // window.location.reload()
      })
      .catch((err) => {
        setLoading(false);
        console.log('ERRRRRR', err);
        toast('Error in KYC verification', { type: 'error' });
      });
  };

  const getSearchData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/users/search_user/?string=${query}&company_id=${company_id}`,
      );
      console.log(response);
      setSearchData(response.data);
    } catch (err) {
      toast(`There is Some error while searching`, { type: 'error' });
    }
  };

  useEffect(() => {
    getSearchData();
  }, [query]);

  const getColumns = () => {
    const columnHelper = createColumnHelper();
    return [
      columnHelper.accessor('first_name', {
        header: 'First Name',
        cell: ({ row }) => {
          return (
            <div className="flex flex-col gap-2 text-left text-xs">
              {row?.original?.first_name && <div>{row?.original?.first_name}</div>}
            </div>
          );
        },
      }),
      columnHelper.accessor('email_address', {
        header: 'Email Address',
        cell: ({ row }) => {
          return (
            <div className="flex flex-col gap-2 text-left text-xs">
              {row?.original?.email_address && <div>{row?.original?.email_address}</div>}
            </div>
          );
        },
      }),
      columnHelper.accessor('contact_no', {
        header: 'Contact No.',
        cell: ({ row }) => {
          return (
            <div className="flex flex-col gap-2 text-left text-xs">
              {row?.original?.contact_no && <div>{row?.original?.contact_no}</div>}
            </div>
          );
        },
      }),
      // columnHelper.accessor('wallet_balance', {
      //   header: 'Wallet Balance',
      //   cell: ({ row }) => {
      //     return (
      //       <div className="flex flex-col gap-2 text-left text-xs">
      //         {row?.original?.wallet_balance && <div>{row?.original?.wallet_balance}</div>}
      //       </div>
      //     );
      //   },
      // }),
      columnHelper.accessor('kyc_status_id', {
        header: 'KYC Status',
        cell: ({ row }) => {
          return (
            <div className="flex flex-col gap-2 text-left text-xs">
              {/* {row?.original?.wallet_balance && <div>{row?.original?.wallet_balance}</div>} */}
              <div>
                {row?.original?.kyc_status_id == 1
                  ? 'Upload Pending'
                  : row?.original?.kyc_status_id == 2
                    ? 'Approve Pending'
                    : 'Approved'}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => {
          return (
            <div className="flex gap-2 text-left text-xs">
              {
                <button
                  id={row?.original?.id}
                  className="bg-primary hover:bg-primary min-w-fit rounded px-4 py-1.5 text-white"
                  onClick={() => handleIndent(row)}>
                  {'Indent'}
                </button>
              }
              {row?.original?.kyc_status_id != 3 && (
                <button
                  id={row?.original?.id}
                  className="bg-primary hover:bg-primary min-w-fit rounded px-4 py-1.5 text-white"
                  onClick={() => handleKYC(row)}>
                  {'KYC'}
                </button>
              )}
            </div>
          );
        },
      }),
    ];
  };

  const rowSubComponent = () => {
    return (
      <></>
      // <Badge className="flex w-fit items-center rounded-lg bg-orange-100 text-[8px]">
      //   <div className="flex items-center">
      //     <span className="mr-1 inline-flex h-4 w-4 rounded-full border-4 border-black"></span>
      //     {'Secured'}
      //   </div>
      // </Badge>
    );
  };

  return (
    <>
      <PageWithSidebar>
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="flex gap-1">
            Company
            <p>
              {`>`} {state}
            </p>
          </div>
          {is_admin === '2' && (
            <Link
              to={`/adminkyc`}
              className="bg-primary flex items-center gap-3 rounded px-4 py-1 text-white shadow">
              Back
            </Link>
          )}
        </div>
        <div className="relative my-4 w-1/4 px-4">
          <form className=" flex items-center gap-2 rounded-lg border bg-white px-3 py-1 text-[12px]">
            <FontAwesomeIcon icon={faSearch} className=" text-gray-500" />
            <input
              type="text"
              placeholder="Search By User Name"
              value={query}
              onChange={(e) => handleSearch(e)}
              onFocus={handleFocused}
              className="text-semibold m-0 w-full border-transparent p-0 text-[12px] placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-0"
            />
            {isFocused && (
              <FontAwesomeIcon
                icon={faXmark}
                className="cursor-pointer text-lg text-gray-500"
                onClick={clearSearch}
              />
            )}
          </form>
        </div>
        {loading && <Loader />}
        {fetchData && (
          <CustomDataTable
            columns={getColumns()}
            rowData={user_data}
            enableCheckBox={false}
            enableRowSelection={true}
            shouldRenderRowSubComponent={() => Boolean(Math.ceil(Math.random() * 10) % 2)}
            onRowSelectStateChange={(selected) => console.log('selected-=-', selected)}
            rowSubComponent={rowSubComponent}
            enablePagination={true}
            tableWrapperStyles={{ height: '78vh' }}
          />
        )}
        {showkyc && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-[30%] rounded-lg bg-white p-6">
              <div className="flex flex-row justify-between">
                <h2 className="mb-4 text-lg font-semibold">Validate KYC</h2>
                <button
                  className="mb-4 border-0 bg-transparent p-1 pt-0 text-2xl font-semibold leading-none text-black opacity-100 outline-none focus:outline-none"
                  onClick={() => {
                    setShowKyc(false);
                  }}>
                  <span className="block h-6 w-6 bg-transparent text-black opacity-50 outline-none focus:outline-none">
                    ×
                  </span>
                </button>
              </div>
              <div className="flex flex-row justify-evenly">
                <img src={aadharImg} alt="Aadhar Image" className="mb-4 w-40 shadow-md" />
                <img src={userImg} alt="User Image" className="mb-4 w-40 shadow-md" />
              </div>
              <div className="flex justify-center">
                <button className="rounded-lg bg-blue-500 px-4 py-2 text-white" onClick={handleAcceptKYC}>
                  Accept
                </button>
                <button
                  className="ml-2 rounded-lg bg-red-500 px-4 py-2 text-white"
                  onClick={() => setShowKyc(false)}>
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </PageWithSidebar>

      {/* <button className='bg-purple-200 font-semibold' onClick={handleUser}>User</button> */}
    </>
  );
};

export default User;
