import React, { useEffect, useState } from 'react';
import PageWithSidebar from '../../common/components/page-with-sidebar/PageWithSidebar';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { GrEdit } from 'react-icons/gr';
import AddTruckModal from './components/AddTruckModal';
import axios from 'axios';
import { BACKEND_URL } from '../../common/utils/env.config';
import { Loader } from '../../common/components';
import { toast } from 'react-toastify';
import emptyBox from '../../common/images/empty-box.png';
import truck from '../../common/images/truck.png';
import lcvTruck from '../../common/images/lcv_truck.png';
import hyva from '../../common/images/hyva.png';
import container from '../../common/images/container.png';
import trailer from '../../common/images/trailer.png';
import { createColumnHelper } from '@tanstack/react-table';
import { CustomDataTable } from '../../common/components';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

function TruckLists() {
  const [showDelete, setShowDelete] = useState(false);
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [truckData, setTruckData] = useState([]);
  const [loading, setLoading] = useState(false);
  const company_id = sessionStorage.getItem('company_id');
  const companyName = sessionStorage.getItem('user_name');
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [userData, setUserData] = useState([]);
  const [fetchData, setFetchData] = useState(false);
  const [showTruckTable, setShowTruckTable] = useState(false);
  const is_admin = sessionStorage.getItem('is_admin');
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const { state } = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchData, setSearchData] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  // const companyID = is_admin == 2 ? state.id : company_id;
  const truck_data = query.length !== 0 ? searchData : truckData;
  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPage((prev) => (prev <= 1 ? prev : prev - 1));
  };

  const handleChange = (event) => {
    setPageSize(event.target.value);
  };

  useEffect(() => {
    // if (state) {
    //   getTruckData(state.id);
    //   return;
    // }
    // if (is_admin === '2') {
    //   fetchDataFromAPI();
    // } else {
    getTruckData(company_id);
    // }
  }, [is_admin, company_id, page, pageSize]);

  console.log(state);

  const fetchDataFromAPI = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/company/all_company/`);
      const filteredData = res.data.filter((item) => item.kyc_status_id === 1);
      setUserData(filteredData);
      setFetchData(true);
    } catch (err) {
      console.log('Error fetching company data', err);
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    const columnHelper = createColumnHelper();
    return [
      columnHelper.accessor('name', {
        header: 'Company Name',
        cell: ({ row }) => (
          <div className="flex flex-col gap-2 text-left text-xs">
            {row?.original?.name && <div>{row?.original?.name}</div>}
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email Address',
        cell: ({ row }) => (
          <div className="flex flex-col gap-2 text-left text-xs">
            {row?.original?.email && <div>{row?.original?.email}</div>}
          </div>
        ),
      }),
      columnHelper.accessor('contact', {
        header: 'Contact No.',
        cell: ({ row }) => (
          <div className="flex flex-col gap-2 text-left text-xs">
            {row?.original?.contact && <div>{row?.original?.contact}</div>}
          </div>
        ),
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-2 text-left text-xs">
            <div
              className="min-w-fit cursor-pointer rounded bg-sky-500 px-4 py-1.5 text-white hover:bg-sky-700"
              onClick={() => handleKYC(row?.original?.id, row?.original?.name)}>
              Show Details
            </div>
          </div>
        ),
      }),
    ];
  };

  const rowSubComponent = (row) => {
    return <div>Details for {row.companyName}</div>;
  };

  const handleKYC = (companyId, companyName) => {
    getTruckData(companyId, companyName);
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

  const getSearchData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/trucktype/search_truck_type/?string=${query}&company_id=${company_id}`,
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

  const getTruckData = async (companyId, companyName) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/trucktype/get_truck_types/?created_by=${companyId}&page=${page}&page_size=${pageSize}`,
      );
      setTruckData(response.data);
      setSelectedCompanyName(companyName);
      setShowTruckTable(true);
    } catch (err) {
      console.log('Error fetching truck data', err);
      toast('There is some error while fetching data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const data = truckData.find((data) => data.id === id);
    console.log(id);
    setEditData(data);
    setShowAddTruck(true);
  };

  const handleDelete = async (id) => {
    setShowDelete(false);
    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/trucktype/delete_truck_type/?truck_type_id=${id}`);
      if (state) {
        getTruckData(state.id, state.name);
      } else {
        getTruckData(company_id, selectedCompanyName);
      }
      toast('Delete Successfully', { type: 'success' });
    } catch (err) {
      console.log('Error deleting truck data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetEdit = () => {
    setEditData(null);
  };

  const handleClose = () => {
    handleSetEdit();
    setShowAddTruck(false);
  };

  const handleShowAddTruckModal = () => {
    setShowAddTruck((prev) => !prev);
  };

  const handleShowDeleteModal = (id) => {
    setDeleteId(id);
    setShowDelete((prev) => !prev);
  };

  const handleShowList = () => {
    setShowTruckTable(false);
  };

  return (
    <PageWithSidebar>
      {loading && <Loader />}
      {is_admin === '2' && !showTruckTable ? (
        fetchData ? (
          userData.length > 0 ? (
            <CustomDataTable
              columns={getColumns()}
              rowSubComponent={rowSubComponent}
              rowData={userData}
              enableRowSelection={true}
              shouldRenderRowSubComponent={() => Boolean(Math.ceil(Math.random() * 10) % 2)}
              onRowSelectStateChange={(selected) => console.log('selected-=-', selected)}
              enablePagination={true}
              tableWrapperStyles={{ height: '78vh' }}
            />
          ) : (
            <div className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center bg-white">
              <img src={emptyBox} className="h-60" />
              <p>No Action Required</p>
            </div>
          )
        ) : null
      ) : (
        <div>
          <p className="mx-3 mt-3 text-lg font-medium">
            Truck Master {is_admin == 2 && `>`}
            {state ? state?.name : selectedCompanyName}
          </p>
          <div className="flex items-center justify-between gap-5 px-4">
            <div className="relative w-1/4">
              <form className="my-4 flex items-center gap-2 rounded-lg border bg-white px-3 py-1 text-[12px]">
                <FontAwesomeIcon icon={faSearch} className=" text-gray-500" />
                <input
                  type="text"
                  placeholder="Search By Truck Name"
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
            <div className="flex justify-end gap-5">
              {is_admin === '2' && (
                <button
                  className="flex items-center gap-3 rounded bg-sky-500 px-4 py-1 text-white shadow"
                  onClick={() => navigate(`/adminkyc`)}>
                  Back
                </button>
              )}
              <button
                className="flex items-center gap-3 rounded bg-sky-500 px-4 py-1 text-white shadow"
                onClick={handleShowAddTruckModal}>
                <span className="text-2xl">+</span>
                Add Truck
              </button>
            </div>
          </div>
          <div className="ml-3 mt-3 w-[98%] min-w-[90%] overflow-hidden rounded-lg shadow">
            <table className=" w-full text-[12px]">
              <thead className="border bg-white">
                <tr>
                  <th className="w-16 border px-4 py-2 text-center">Sr. No</th>{' '}
                  <th className="w-20 border px-4 py-2 text-center">Truck Type</th>{' '}
                  <th className="w-20 border  px-4 py-2 text-center">Truck Image</th>
                  <th className="w-24  border px-4 py-2 text-center">Vehical Capacity</th>
                  <th className="w-28 border  px-4 py-2 text-center">Truck Number</th>
                  <th className="w-28 border  px-4 py-2 text-center">Truck Dimensions</th>
                  <th className="w-24 border  px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {truck_data &&
                  truck_data?.map((data, index) => (
                    <tr key={data.id} className={`border  bg-white  font-semibold text-gray-500`}>
                      <td className=" border px-4 py-4 text-center">{index + 1}</td>
                      <td className=" border px-4 py-4 text-center">
                        {data.truck_type ? data.truck_type : '-'}
                      </td>
                      <td className=" border px-4 py-4 text-center">
                        {data.truck_type === 'Truck' && <img src={truck} className="inline-block h-10" />}
                        {data.truck_type === 'LCV' && <img src={lcvTruck} className="inline-block h-10" />}
                        {data.truck_type === 'Container' && (
                          <img src={container} className="inline-block h-10" />
                        )}
                        {data.truck_type === 'Trailer' && <img src={trailer} className="inline-block h-10" />}
                        {data.truck_type === 'Hyva' && <img src={hyva} className="inline-block h-10" />}
                      </td>
                      <td className=" border px-2 py-4 text-center">
                        {data.capacity ? data.capacity : '-'} {data.capacity_type ? data.capacity_type : ''}
                      </td>
                      <td className=" border px-4 py-4 text-center">
                        {data.truck_number ? data.truck_number : '-'}
                      </td>
                      <td className=" border px-4 py-4 text-center">{data.truck_dimension}</td>
                      <td className=" border px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-4 text-2xl">
                          <RiDeleteBin6Line
                            className="cursor-pointer"
                            onClick={() => handleShowDeleteModal(data.id)}
                          />
                          <GrEdit className="cursor-pointer" onClick={() => handleEdit(data.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {truckData.length === 0 && (
              <div className="flex h-96 flex-col items-center justify-center bg-white">
                <img src={emptyBox} className="h-60" />
                <p>{`Start by creating a new truck using the 'Add Truck' button above.`}</p>
              </div>
            )}

            <div className="flex w-full justify-between bg-white p-2 text-sm">
              <div className="flex items-center gap-3 text-gray-500">
                <p>Showing</p>
                <select
                  id="select"
                  value={pageSize}
                  className="rounded-lg border-gray-300 px-1 py-0"
                  onChange={handleChange}>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                </select>
                <p>Entries</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`rounded border border-gray-300 px-2 py-0 text-lg ${
                    page === 1 ? 'cursor-not-allowed' : ''
                  }`}
                  onClick={handlePrevPage}
                  disabled={page === 1}>{`<`}</button>
                <button className="rounded bg-sky-500 px-2 py-1 text-sm text-white">{page}</button>
                <span className=" rounded px-2 py-0 text-sm">{page + 1}</span>
                <span className=" rounded px-2 py-0 text-sm">{page + 2}</span>
                <button
                  className="rounded border border-gray-300 px-2 py-0 text-center text-lg"
                  onClick={handleNextPage}>{`>`}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#24292e57]">
          <div className="flex h-36 w-64 flex-col items-center justify-center gap-4 rounded-lg bg-white px-4 text-sm font-medium">
            <p>Are you sure you want to remove this truck?</p>
            <div className="flex w-full justify-center gap-4">
              <button
                className="w-1/2 rounded-lg bg-sky-500 px-4 py-1 text-white"
                onClick={() => handleDelete(deleteId)}>
                Yes
              </button>
              <button className="w-1/2 rounded-lg bg-zinc-100 px-4 py-1" onClick={handleShowDeleteModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddTruck && (
        <AddTruckModal
          handleClose={handleClose}
          getTruckData={getTruckData}
          editData={editData}
          handleSetEdit={handleSetEdit}
          state={state}
        />
      )}
    </PageWithSidebar>
  );
}

export default TruckLists;
