import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../../common/utils/env.config';
import OtpPopup from './OtpPopup';
import { homelogo, LogoRCSL } from '../../common/images';
// import { GoogleLogin } from 'react-google-login';
// import {gapi} from 'gapi-script'

export let type_user;

const LogIn = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [handlePopup, setHandlePopup] = useState(false);
  const [loginInput, setLoginInput] = useState({
    username: '',
    password: '',
  });
  const [userType, setUserType] = useState('user');
  type_user = userType;

  const handleChangeInput = (e) => {
    const { id, value } = e.target;
    setLoginInput({
      ...loginInput,
      [id]: value,
    });
  };

  const handleForgotPassword = () => {
    type_user = userType;
    // console.log("DATAAAAAAAAA",data)
    navigate('/forgotpassword');
  };
  //   var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

  //   function start() {
  //     gapi.client.init({
  //         clientId: "285163063974-00ubuj8sg12diejh6j2hn3mq845d5ngn.apps.googleusercontent.com",
  //         scope: SCOPES,
  //     });
  // }
  //   gapi.load("client:auth2", start);

  const handleSubmit = () => {
    if (loginInput.username === '' || loginInput.password === '') {
      toast('Email and Password both are required', { type: 'error' });
      return;
    }
    localStorage.setItem('user_email', loginInput.username);
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    console.log('username pass', loginInput.username, loginInput.password);
    console.log('backend url', BACKEND_URL);
    const apiURL = userType === 'user' ? '/login/access-token' : '/company/access-token';
    const otpURL = userType === 'user' ? '/login' : '/company';

    axios
      .post(
        BACKEND_URL + apiURL,
        {
          username: loginInput.username,
          password: loginInput.password,
        },
        { headers },
      )
      .then((response) => {
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('company_id', response.data.company_id);
        localStorage.setItem('is_company', response.data.is_company);
        localStorage.setItem('is_admin', response.data.is_admin);
        localStorage.setItem('balance', response.data.wallet_balance);
        localStorage.setItem('is_kyc', response.data.kyc_status_id);
        localStorage.setItem('is_super', response.data.user_type_id);
        localStorage.setItem('is_otpVerified', JSON.stringify(false));
        const user_id =
          userType === 'user' ? localStorage.getItem('user_id') : localStorage.getItem('company_id');
        if (response.data.access_token) {
          setUserId(response.data.user_id);
          setCompanyId(response.data.company_id);
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('user_name', response.data?.user_name?.split(' ')[0]);
          axios
            .post(
              BACKEND_URL + `${otpURL}/generate_otp?email_id=${loginInput.username}&user_id=${user_id}`,
              { email_id: String(loginInput.username), user_id: String(response.data.user_id) },
              { headers },
            )
            .then((otpResponse) => {
              setHandlePopup(true);
              console.log(otpResponse);
            })
            .catch((otpError) => {
              console.error('Error fetching OTP:', otpError);
              toast('Error generating OTP', { type: 'error' });
            });
          // toast('Login Success',{type:'success'})
          // navigate('/')
        } else if (response.data.msg) {
          toast(response.data.msg, { type: 'error' });
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        toast('An error occurred during login', { type: 'error' });
      });
  };
  // const onSuccess = (response) => {
  //   console.log('Login Success:', response);
  //   // Handle the response here, e.g., send it to your backend for authentication
  // };

  // const onError = (response) => {
  //   console.log('Login Failed:', response);
  //   // Handle the failed login here
  // };

  return (
    <>
      <div className="flex-column flex h-full">
        <div className="flex h-full w-[49%] flex-col items-center justify-center">
          <img src={homelogo} className="h-full w-[97%] object-cover" alt="Logo"></img>
        </div>
        <div className="mt-8 flex h-full w-[49%] flex-col items-center justify-center">
          <div className="mb-8 text-center text-4xl font-bold">
            <h1>Cloud Cargo</h1>
          </div>
          {!handlePopup && (
            <div className="bg-body mb-3 w-[95%] rounded-2xl bg-white px-12 py-6 shadow md:w-9/12">
              <div className="mb-2 text-center">
                <h3 className="m-0 text-xl font-medium">Login to Cloud Cargo</h3>
              </div>
              {/* <GoogleLogin
                clientId="285163063974-00ubuj8sg12diejh6j2hn3mq845d5ngn.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onError}
                cookiePolicy={"single_host_origin"}
            /> */}
              <div className="mb-3 flex flex-row">
                <div className="p-2">
                  <input
                    type="radio"
                    id="user"
                    name="userType"
                    value="user"
                    checked={userType === 'user'}
                    onChange={() => setUserType('user')}
                  />
                  <label className="ml-2 font-semibold" htmlFor="user">
                    User
                  </label>
                </div>
                <div className="p-2">
                  <input
                    type="radio"
                    id="company"
                    name="userType"
                    value="company"
                    checked={userType === 'company'}
                    onChange={() => setUserType('company')}
                  />
                  <label className="ml-2 font-semibold" htmlFor="company">
                    Company
                  </label>
                </div>
              </div>
              <span className="my-2 inline-flex w-full border border-dashed border-gray-400"></span>
              <form>
                <div className="mb-3">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Email ID
                  </label>
                  <input
                    type="email"
                    id="username"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your email ID"
                    value={loginInput.username}
                    onChange={handleChangeInput}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter password"
                    value={loginInput.password}
                    onChange={handleChangeInput}
                  />
                </div>
                <div className="mb-3 text-sm">
                  <Link onClick={handleForgotPassword} className="text-decoration-none text-red-700">
                    Forgot Password?
                  </Link>
                </div>
                <button
                  type="button"
                  className="dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 mb-2 w-full rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300"
                  onClick={handleSubmit}>
                  Login
                </button>
                {userType === 'company' && <div className="text-center">
                  <p className="text-sm">
                    New to Cloud Cargo?{' '}
                    {/* <Link to={'/signup'} className="text-decoration-none text-red-700">
                Sign Up Now
              </Link> */}
                    <Link
                      to={userType === 'user' ? '/signup-user' : '/signup'}
                      className="text-decoration-none text-red-700">
                      Sign Up Now
                    </Link>
                  </p>
                </div>}
              </form>
            </div>
          )}
          {handlePopup && (
            <OtpPopup
              userType={userType}
              username={loginInput.username}
              userId={userId}
              companyId={companyId}
            />
          )}
          <div className="ml-auto mt-4 flex flex-row items-end justify-between">
            <h1 className="ml-auto mr-4 text-xl font-bold text-red-700">Powered By</h1>
            <img src={LogoRCSL} className="h-25 mx-20 ml-auto mt-10 w-32" alt="Powered By Logo"></img>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogIn;
