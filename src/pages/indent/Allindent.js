import React, { useState, useEffect } from 'react';
import PageWithSidebar from '../../common/components/page-with-sidebar/PageWithSidebar';
import { info } from './Indent';
import axios from 'axios';
import { BACKEND_URL } from '../../common/utils/env.config';
import { useNavigate, useParams } from 'react-router-dom';
import { Field } from '../../common/components';
import { Tabs } from '../../common/components/tabs';
import { trip_status_filter } from '../orders/duck';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../../common/utils/config';
import { Loader } from '../../common/components';
import emptyBox from '../../common/images/empty-box.png';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export let modifyFlag = 0;
export let modifyId;

const is_admin = sessionStorage.getItem('is_admin');

const Allindent = () => {
  const temp = sessionStorage.getItem('user_id');
  const is_company = sessionStorage.getItem('is_company');
  const { url_user_id } = useParams();
  console.log('url_user', url_user_id);
  let user_name = null;
  if (parseInt(url_user_id) == 1) {
    user_name = 'Yash Khandhediya';
  } else {
    user_name = 'Shivam Gajjar';
  }
  const navigate = useNavigate();
  const [dataFetch, setDataFetch] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [price, setPrice] = useState({});
  const [rcslPrice, setRcslPrice] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [popupCardId, setPopupCardId] = useState(null);
  const [showBtn, setShowBtn] = useState(true);
  const [showOfflineBtn, setShowOfflineBtn] = useState(false);
  const [offlinePrice, setOfflinePrice] = useState(0);
  const [showOfflinePricePrompt, setShowOfflinePricePrompt] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const filtered_info = query.length !== 0 ? searchData : filteredInfo;
  const [actionAlreadyDone, setActionAlreadyDone] = useState(false);

  console.log('IDFFFFFF', selectedTab);

  if (url_user_id == 'undefined' && sessionStorage.getItem('is_company') == 1) {
    navigate('/User');
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;

    return `${formattedTime} | ${formattedDate}`;
  }

  const fetchData = async () => {
    let filteredData = [];
    info.length = 0;
    setLoading(true);
    try {
      const response = await axios.get(BACKEND_URL + `/indent/get_indents?created_by=${url_user_id}`);
      // console.log('RESPONSE', response, response.data.length);
      if (response.data.length > 0 && info.length == 0) {
        console.log('RESPONSE', response, response.data.length);
        for (let i = 0; i < response.data.length; i++) {
          info.push(response.data[i]);
          console.log(response.data[i].length);
        }
      }
      console.log('yash');
      console.log(info);
      setAllData(info);
      let tab_dummy = JSON.parse(sessionStorage.getItem('activeTab')) || 0;
      if (tab_dummy == 0) {
        filteredData = info;
      } else {
        filteredData = info.filter((data) => data.trip_status == tab_dummy - 1);
      }

      setFilteredInfo(filteredData);
      console.log(filteredData.length, allData.length);
      setDataFetch(true);
    } catch (err) {
      console.log('ERRRRRRRR', err);
    } finally {
      setLoading(false);
    }
  };

  let count = 1;
  useEffect(() => {
    // if (sessionStorage.getItem('is_kyc') == 1) {
    //   if (count == 1) {
    //     toast('Complete Your KYC First', { type: 'error' });
    //     count++;
    //   }
    //   navigate('/seller/home');
    //   return;
    // } else if (sessionStorage.getItem('is_kyc') == 2) {
    //   if (count == 1) {
    //     toast('KYC Verification Is Pending.', { type: 'error' });
    //     count++;
    //   }
    //   navigate('/seller/home');
    //   return;
    // }

    fetchData();
  }, [url_user_id]);

  const handleModify = (id) => {
    console.log('Idddddddddddd', id);
    modifyId = id;
    modifyFlag = 1;
    axios
      .get(BACKEND_URL + `/indent/get_indents_by_id?id=${id}`)
      .then((res) => {
        console.log('TTTTTTTTT', res);
        let data = res.data;
        navigate('/indent', { state: { data: data } });
      })
      .catch((err) => {
        console.log('ERRRRRRRRRRRRR', err);
      });
  };

  const checkConfirmRejectButtonShowCondition = (data) => {
    console.log('yasah');
    if (is_admin == 2) {
      return false;
    } else
      return (
        data.trip_status !== 2 &&
        data.trip_status !== 3 &&
        data.trip_status !== 0 &&
        data?.counter_price == null
      );
  };

  const checkCounterPriceShowCondition = (data) => {
    console.log('yasah');
    if (is_company == 1) {
      return false;
    } else
      return (
        data.trip_status !== 2 &&
        data.trip_status !== 3 &&
        data.trip_status !== 0 &&
        data?.counter_price == null
      );
  };

  const checkCounterPriceDisabledCondition = (data) => {
    console.log('yasah');
    if (is_company == 1) {
      return false;
    } else
      return (
        data.trip_status !== 2 &&
        data.trip_status !== 3 &&
        data.trip_status !== 0 &&
        data?.counter_price == null
      );
  };

  const handlePriceChange = (id, value) => {
    setPrice({ ...price, [id]: value }); // Update the price for the corresponding card
  };

  const handleRcslPriceChange = (id, value) => {
    setRcslPrice({ ...rcslPrice, [id]: value });
  };

  const handlePrice = (id) => {
    setLoading(true);
    const headers = { 'Content-Type': 'application/json', Authorization: ACCESS_TOKEN };
    console.log('Price', price);
    axios
      .post(
        BACKEND_URL + '/indent/admin_price',
        {
          id: id,
          price: parseInt(price[id]),
        },
        { headers },
      )
      .then((res) => {
        console.log('RESPONSEEEEEE11', res);
        toast('Price Successfully Submitted', { type: 'success' });
        setLoading(false);
        window.location.reload();
      })
      .catch((err) => {
        console.log('Errorororor', err);
      });
  };

  const handleRcslPrice = (id) => {
    setLoading(true);
    const headers = { 'Content-Type': 'application/json', Authorization: ACCESS_TOKEN };
    console.log('Price', rcslPrice);
    axios
      .put(
        BACKEND_URL + '/indent/modify_indent',
        {
          id: id,
          counter_price: parseInt(rcslPrice[id]),
        },
        { headers },
      )
      .then((res) => {
        if (res?.data?.status_code == 500) {
          toast('Action is already done', { type: 'error' });
          setLoading(false);
          return;
        }
        console.log('RESPONSEEEEEE11', res);
        toast('RCSL Price Successfully Submitted', { type: 'success' });
        setLoading(false);
        window.location.reload();
      })
      .catch((err) => {
        console.log('Errorororor', err);
      });
  };

  const handleConfirmation = (id, status) => {
    setLoading(true);
    const headers = { 'Content-Type': 'application/json', Authorization: ACCESS_TOKEN };
    let newObj = {
      id: id,
      status_code: status,
    };
    if (offlinePrice != null) {
      newObj.offline_price = offlinePrice;
    }
    axios
      .post(BACKEND_URL + '/indent/booking_confirmation', newObj, { headers })
      .then((res) => {
        console.log('111111111', res);
        if (res?.data?.status_code == 401) {
          toast('Action is already done', { type: 'error' });
          setActionAlreadyDone(true);
          setLoading(false);
          return;
        }
        status == 2
          ? toast('Price Successfully Accepted', { type: 'success' })
          : toast('Price Successfully Rejected', { type: 'error' });
        setLoading(false);
        setShowBtn(false);
        setPopupCardId(null);
        window.location.reload();
      })
      .catch((err) => {
        console.log('222222222', err);
        setLoading(false);
        setShowBtn(true);
      });
  };

  const handleTabChange = (tabId) => {
    console.log('TAB SELECT', selectedTab);
    setSelectedTab(tabId);
  };

  useEffect(() => {
    let filteredData = allData;
    if (selectedTab == 0) {
      setFilteredInfo(filteredData);
    } else {
      filteredData = filteredData.filter((data) => data.trip_status == selectedTab - 1);
      setFilteredInfo(filteredData);
      console.log('INFOOOOOOOOO', filteredInfo);
    }
  }, [selectedTab]);

  const handleRejectClick = (id) => {
    setShowBtn(false);
    setShowPopup(true);
    setPopupCardId(id);
  };

  const handleConfirmClick = (id) => {
    setShowBtn(false);
    setShowOfflinePricePrompt(true);
    setPopupCardId(id);
  };

  const handleReasonChange = (e) => {
    setSelectedReason(e.target.value);
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

  const handleSubmitReason = (id, status) => {
    if (selectedReason) {
      handleConfirmation(id, status);
      setShowPopup(false);
      setPopupCardId(null);
      setSelectedReason('');
    } else {
      alert('Please select a reason.');
    }
  };
  const getSearchData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/indent/search_indent/?string=${query}&user_id=${url_user_id}`,
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

  // let timeLeft = Math.ceil((new Date() - new Date(info[0].pickupDate) )/(1000 * 60 * 60).toPrecision(1));
  // console.log("diff",timeLeft)
  // console.log("Information ",info)

  return (
    <PageWithSidebar>
      {loading && <Loader />}
      <div>
        <Tabs
          tabs={trip_status_filter}
          tabClassNames={'mr-6 px-3 py-3.5 text-[#7f7f7f] font-medium'}
          onTabChange={handleTabChange}
        />
      </div>
      <div className="relative my-4 w-1/4 px-4">
        <form className=" flex items-center gap-2 rounded-lg border bg-white px-3 py-1 text-[12px]">
          <FontAwesomeIcon icon={faSearch} className=" text-gray-500" />
          <input
            type="text"
            placeholder="Search By Indent"
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
      {filteredInfo.length === 0 && (
        <div className="flex h-96 flex-col items-center justify-center">
          <img src={emptyBox} className="h-60" />
          <p>{selectedTab === 0 && 'No Indents are created yet'}</p>
          <p>{selectedTab === 1 && 'No Indents Available'}</p>
          <p>{selectedTab === 2 && 'No pending bookings found'}</p>
          <p>{selectedTab === 3 && 'No confirmed bookings found'}</p>
          <p>{selectedTab === 4 && 'No Rejected bookings found'}</p>
        </div>
      )}
      {console.log('kkkkkkkkkkkk', info)}
      {dataFetch && (
        <div className="flex flex-wrap">
          {filtered_info.map((data, index) => (
            <div className="flex flex-row sm:w-full md:w-1/2 lg:w-1/3" key={index}>
              <div className="mx-3 mt-5 w-full rounded-lg bg-white p-4 shadow">
                <div className="mb-2 flex w-full flex-row items-end justify-between border-b border-gray-200 pb-2">
                  <div className="flex w-full flex-row">
                    <div className="text-primary w-[60%] text-sm font-semibold">
                      {data.id} | {data?.coordinator_name || ''} | {data?.coordinator_mobile || ''}
                    </div>
                    <button
                      className=""
                      onClick={() => {
                        handleModify(data.id);
                      }}>
                      <svg
                        className="text-primary h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="text-primary w-[40%] text-xs">
                    {formatTimestamp(data?.created_date)}
                    {/* {Math.ceil((new Date(data.pickupDate) - new Date() )/(1000 * 60 * 60).toPrecision(1))}h */}
                  </div>
                </div>
                <div className="-ml-4 -mr-4 border-b border-gray-200 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-row">
                      <input type="checkbox" className="form-checkbox ml-3 mr-2 mt-3 text-green-500" />
                      <ul className="ml-1 pl-2">
                        <li className="text-sm font-bold text-gray-600">
                          From <span className="font-normal">{data?.from_city || 'Bhavnager'}</span>
                        </li>
                        <li className="text-sm font-bold text-gray-600">
                          To <span className="font-normal">{data?.to_city || 'Mumbai'}</span>
                        </li>
                      </ul>
                    </div>
                    <span className="dark:bg-yellow-900 dark:text-yellow-300 me-2 rounded bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">
                      0 Stop(s)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x-2">
                  <div className="w-2/10 -ml-2 md:w-24">
                    <p className="mb-1 ml-1 w-full text-xs font-semibold text-purple-400 md:w-1/3 lg:text-xs">
                      TARGET PRICE
                    </p>
                    <p className="ml-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-gray-500">{`₹${data.customer_price}`}</p>
                  </div>
                  <div className="w-2/10 -ml-14">
                    <p className="text-primary mb-1 ml-1 text-xs font-semibold">TRUCK DETAILS</p>
                    <div className="px-2 text-[13px] text-zinc-500">
                      <p className="font-bold">
                        Type: <span className="font-normal">{data.truck_details.truck_type}</span>
                      </p>
                      <p className="font-bold">
                        Number: <span className="font-normal">{data.truck_details.truck_number}</span>
                      </p>
                      <p className="font-bold">
                        Vehical Capacity:
                        <span className="font-normal">
                          {data.truck_details.capacity} {data.truck_details.capacity_type}
                        </span>
                      </p>
                      <p className="font-bold">
                        Dimensions: <span className="font-normal">{data.truck_details.truck_dimension}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-6/10">
                    <p className=" text-primary mb-1 ml-1 w-full text-xs font-semibold">MATERIAL TYPE</p>
                    <p className="ml-1 text-sm text-gray-500">{data.material_details.material_type}</p>
                  </div>
                </div>
                <div className="-ml-4 -mr-4 flex items-end justify-between border-t border-gray-200">
                  <div className="mr-auto mt-3 text-sm text-gray-500">
                    <span className="dark:bg-purple-900 dark:text-purple-300 me-2 ml-2 rounded bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                      {'Weight'} : {data?.weight} {data?.weight_type}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="mr-2 self-end text-sm font-medium">
                      {/* {localStorage.getItem('user_name')} */}
                      {data?.name}
                    </div>
                    <div className="mr-2 self-end text-xs font-medium">
                      {/* {`Mobile No : ${localStorage.getItem('contact_no') || '9876543212'}`} */}
                      {`Mobile No : ${data?.contact_no || '9876543212'}`}
                    </div>
                  </div>
                </div>
                <div className="-ml-2 mt-6 flex flex-row items-end justify-between">
                  {data.trip_status == 0 ? (
                    <span className=" dark:bg-yellow-900 dark:text-yellow-300 me-2 rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Booking Price Pending
                    </span>
                  ) : data.trip_status == 1 ? (
                    <span className="dark:bg-purple-900 dark:text-purple-300 me-2 rounded bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      Booking Pending
                    </span>
                  ) : data.trip_status == 2 ? (
                    <span className="dark:bg-green-900 dark:text-green-300 me-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Booking Confirmed
                    </span>
                  ) : (
                    <span className="dark:bg-red-900 dark:text-red-300 me-2 rounded bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Booking Rejected
                    </span>
                  )}
                  <div className="flex w-[50%] flex-row items-end">
                    <label className="ml-16 w-[35%] px-0.5 py-0.5 text-sm font-bold md:text-xs">
                      Total Km :
                    </label>
                    <input
                      type="text"
                      value={data?.kilometer || '500'}
                      disabled
                      className="block w-[35%] cursor-not-allowed rounded-sm border-gray-300 bg-gray-100 px-0 py-0 text-center text-sm font-semibold shadow-sm"
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-row">
                  <label className="mt-0.5 text-xs font-bold">Remarks :</label>
                  <input
                    type="text"
                    value={data?.remarks || 'Important Remarks About Indent'}
                    disabled
                    className="ml-4 block w-[80%] cursor-not-allowed rounded-sm border-gray-300 bg-gray-100 px-2 py-0.5 text-xs shadow-sm"
                  />
                </div>
                <div className="flex flex-row items-center justify-between">
                  {is_admin == 2 ? ( // render based on is_admin value
                    <div className="flex flex-row items-end justify-between">
                      <div className="mt-4">
                        <label className="text-xs font-semibold text-purple-400">RCSL PRICE</label>
                        {data.actual_price == null ? (
                          <input
                            type="text"
                            value={price[data.id] || ''}
                            onChange={(e) => handlePriceChange(data.id, e.target.value)}
                            className="focus:border-primary ml-4 mt-2 h-8 w-24 rounded-md border border-gray-300 focus:outline-none focus:ring"
                          />
                        ) : (
                          <input
                            type="text"
                            value={`₹${data.actual_price ?? 0}`}
                            disabled
                            onChange={(e) => handlePriceChange(data.id, e.target.value)}
                            className="focus:border-primary ml-4 mt-2 h-8 w-24 rounded-md border border-gray-300 focus:outline-none focus:ring"
                          />
                        )}
                      </div>
                      <div className="mt-4">
                        {data.actual_price == null && (
                          <button
                            className="ml-3 rounded-lg bg-green-500 px-3 py-1 font-semibold text-white hover:bg-green-600"
                            onClick={() => {
                              handlePrice(data.id);
                            }}>
                            Save
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-row items-end justify-between">
                      <div className="mt-4">
                        <label className="text-xs font-semibold text-purple-400">
                          {data.actual_price == null ? 'ACTUAL PRICE PENDING' : 'RCSL PRICE'}
                        </label>
                        {data.actual_price != null && (
                          <input
                            type="text"
                            className="focus:border-primary ml-2 mt-2 h-8 w-36 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring "
                            disabled
                            value={`₹${data.actual_price ?? 0}`}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {showBtn && (
                    <div className="mt-6 flex flex-row">
                      {checkConfirmRejectButtonShowCondition(data) && (
                        <button
                          className="bg-primary hover:bg-primary mr-2 rounded-lg  px-3 py-2 text-xs font-semibold text-white"
                          onClick={() => {
                            handleConfirmation(data.id, 2);
                          }}>
                          Confirm
                        </button>
                      )}
                      {checkConfirmRejectButtonShowCondition(data) && (
                        <button
                          className="rounded-lg bg-red-500 px-3  py-2 text-xs font-semibold text-white hover:bg-red-600"
                          onClick={() => {
                            handleConfirmation(data.id, 3);
                          }}>
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {showOfflinePricePrompt && (
                  <div className="fixed inset-0 flex items-start justify-center bg-gray-200 bg-opacity-5">
                    <div className="mt-16 w-96 rounded-lg bg-white p-4">
                      <p className="mb-4 text-lg font-semibold"> Do you want to Add offline price?</p>
                      <div className="flex justify-end">
                        <button
                          className="bg-primary hover:bg-primary mr-2 rounded-lg px-3 py-2 text-xs font-semibold text-white"
                          onClick={() => {
                            setShowOfflineBtn(true);
                            setShowOfflinePricePrompt(false);
                          }}>
                          Yes
                        </button>
                        <button
                          className="rounded-lg bg-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-400"
                          onClick={() => {
                            setShowOfflinePricePrompt(false);
                            handleConfirmation(data.id, 2);
                          }}>
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {data?.actual_price != null && (
                  <div className="mt-2 flex flex-row items-center justify-between p-1 ">
                    <div className="mt-2">
                      <label className="text-xs font-semibold text-purple-400">COUNTER PRICE</label>
                      {data.counter_price == null &&
                      sessionStorage.getItem('activeTab') == 2 &&
                      sessionStorage.getItem('is_admin') != 2 ? (
                        <input
                          type="text"
                          value={rcslPrice[data.id] || ''}
                          onChange={(e) => handleRcslPriceChange(data.id, e.target.value)}
                          className="focus:border-primary ml-4 mt-2 h-8 w-36 rounded-md border border-gray-300 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={`₹${data.counter_price ?? 0}`}
                          disabled
                          onChange={(e) => handleRcslPriceChange(data.id, e.target.value)}
                          className="focus:border-primary ml-4 mt-2 h-8 w-36 cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring"
                        />
                      )}
                    </div>
                    {sessionStorage.getItem('is_admin') != 2 ? (
                      showBtn &&
                      sessionStorage.getItem('activeTab') == 2 && (
                        <div className="mt-2">
                          {data.trip_status !== 2 &&
                            data.trip_status !== 3 &&
                            data.trip_status !== 0 &&
                            data.counter_price == null && (
                              <button
                                className="mt-2 rounded-lg bg-green-500 px-2 py-1 font-semibold text-white hover:bg-green-600"
                                onClick={() => {
                                  handleRcslPrice(data.id);
                                }}>
                                Counter Offer
                              </button>
                            )}
                        </div>
                      )
                    ) : (
                      <div className="mt-4 flex flex-row">
                        {data.trip_status !== 2 &&
                          data.trip_status !== 3 &&
                          data.trip_status !== 0 &&
                          data.counter_price > 0 && (
                            <>
                              {showBtn && (
                                <button
                                  className="bg-primary hover:bg-primary mr-2 rounded-lg px-3 py-2 text-xs font-semibold text-white"
                                  onClick={() => {
                                    // handleConfirmation(data.id, 2);
                                    handleConfirmClick(data.id);
                                  }}>
                                  Confirm
                                </button>
                              )}
                              {showBtn && (
                                <button
                                  className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                                  onClick={() => handleRejectClick(data.id)}>
                                  Reject
                                </button>
                              )}
                            </>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {((showOfflineBtn && popupCardId == data.id) ||
                  (data.offline_price && data.offline_price > 0)) && (
                  <div className="mt-2 flex flex-row items-center justify-between p-1 ">
                    <div className="mt-2">
                      <label className="text-xs font-semibold text-purple-400">OFFLINE PRICE</label>
                      {data.counter_price != null &&
                      sessionStorage.getItem('is_company') == 1 &&
                      sessionStorage.getItem('activeTab') == 2 ? (
                        <input
                          type="text"
                          value={offlinePrice || ''}
                          onChange={(e) => setOfflinePrice(e.target.value)}
                          className="focus:border-primary ml-4 mt-2 h-8 w-36 rounded-md border border-gray-300 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={`₹${data.offline_price ?? 0}`}
                          disabled
                          // onChange={(e) => handleRcslPriceChange(data.id, e.target.value)}
                          className="focus:border-primary ml-4 mt-2 h-8 w-36 cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring"
                        />
                      )}
                    </div>

                    {sessionStorage.getItem('is_company') == 1 && (
                      <div className="mt-4 flex flex-row">
                        {data.trip_status !== 2 &&
                          data.trip_status !== 3 &&
                          data.trip_status !== 0 &&
                          data.counter_price > 0 && (
                            <>
                              {
                                <button
                                  className="bg-primary hover:bg-primary mr-2 rounded-lg px-3 py-2 text-xs font-semibold text-white"
                                  onClick={() => {
                                    handleConfirmation(data.id, 2);
                                  }}>
                                  Confirm
                                </button>
                              }
                              {/* {(
                                <button
                                  className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                                  onClick={() => handleConfirmation(data.id, 2)}>
                                  Reject
                                </button>
                              )} */}
                            </>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {showPopup && popupCardId == data.id && (
                  <div className="mt-2">
                    <div className="">
                      <h3 className="mb-2 text-sm font-semibold text-purple-400">
                        Select a reason for Rejection:
                      </h3>
                      <select
                        className="w-[60%] rounded-md border"
                        value={selectedReason}
                        onChange={handleReasonChange}>
                        <option value="" disabled>
                          Select a reason
                        </option>
                        <option value="Price is too High">Price is too High</option>
                        <option value="Indent Closed">Indent Closed</option>
                      </select>
                      <button
                        className="bg-primary ml-2 mr-2 rounded-md border p-2 text-sm text-white"
                        onClick={() => handleSubmitReason(data.id, 3)}>
                        Submit
                      </button>
                      <button
                        className="ml-2 mr-2 rounded-md border bg-red-500 p-2 text-sm text-white"
                        onClick={() => {
                          setShowPopup(false);
                          window.location.reload();
                        }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWithSidebar>
  );
};

export default Allindent;
