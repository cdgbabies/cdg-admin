import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_GROUP } from '../util/constants';
import httpClient from '../util/http-client';
import { COGNITO_ENDPOINT, IDENTITY_POOL_ID, REGION } from '../util/constants';

import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
let logoutTimer;

const LoginContext = React.createContext({
  token: '',
  isLoggedIn: false, 
  userName: '',
  reqHeader:{},
  cognitoId:'',
  cognitoIdPoolIdentity:'',
  login: (token) => { },
  logout: () => { },

});

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  const remainingDuration = adjExpirationTime - currentTime;

  return remainingDuration;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem('jwtToken');
  const storedExpirationDate = localStorage.getItem('expirationTime');

  const remainingTime = calculateRemainingTime(storedExpirationDate);

  if (remainingTime <= 3600) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('expirationTime');
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const LoginContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  const[isAdmin,setisAdmin]=useState(false);
  const { location } = useLocation();

  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;
  }

  const [token, setToken] = useState(initialToken);  
  const navigate=useNavigate();
  const [reqHeader,setReqHeader]=useState({});
  const [loggedInUser,setLoggedInUser]=useState();
  const [cognitoId,setCognitoId]=useState();
  
  const[cognitoIdPoolIdentity,setcognitoIdPoolIdentity]=useState();



  const userIsLoggedIn =!!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('expirationTime');
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  
  });
  
  useEffect(()=>{
   
    console.log("userIsLoggedIn=="+userIsLoggedIn);
    console.log("isadmin in use effect"+isAdmin);
    if(userIsLoggedIn && isAdmin )
    navigate((location && location.path)??"/");
    
  },[userIsLoggedIn])

  function parseToken(token){
    if (!token) { return; }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonObj = JSON.parse(window.atob(base64));
    console.log("parsing user name");
    console.log(jsonObj);
    return jsonObj;
  }

  

  const loginHandler = async (idToken,accessToken, expirationTime) => {
  
    const tokenObject = parseToken(idToken);
    const cognitoId = tokenObject["sub"];
    const cognitoidentity = new CognitoIdentityClient({
      credentials:  fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
          identityPoolId: IDENTITY_POOL_ID,
            logins: {
                [COGNITO_ENDPOINT]:idToken
            }
      }),
  });


  var credentials = await cognitoidentity.config.credentials()

 
    setCognitoId(cognitoId);
    setcognitoIdPoolIdentity(credentials.identityId);
    const userName = tokenObject["cognito:username"];
    console.log("userName=="+userName);
        console.log(cognitoidentity);
    setLoggedInUser(userName);
    const isAdmin = !!tokenObject["cognito:groups"].find(x=>x===ADMIN_GROUP);
    console.log("isAdmin==="+isAdmin);
    setisAdmin(isAdmin);
    setToken(idToken);
   
    localStorage.setItem('jwtToken', accessToken);
   
    localStorage.setItem('expirationTime', expirationTime);

    const remainingTime = calculateRemainingTime(expirationTime);

    logoutTimer = setTimeout(logoutHandler, remainingTime);

    

  };

  useEffect(() => {
    if (tokenData) {
     
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);
  

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    userName:loggedInUser,
    login: loginHandler,
    logout: logoutHandler,  
    reqHeader:reqHeader,
    cognitoId:cognitoId,
    cognitoIdPoolIdentity:cognitoIdPoolIdentity


  };

  return (
    <LoginContext.Provider value={contextValue}>
      {props.children}
    </LoginContext.Provider>
  );
};

export default LoginContext;
