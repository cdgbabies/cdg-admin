import React, { useContext, useState } from "react";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { CLIENT_ID, USER_POOL_ID } from "../../util/constants";
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import LoginContext from "../../store/login-context";
const schema = yup.object({
    userName: yup.string().required("Name is required"),
    password: yup.string().required("Password is required")
  }).required();
const Login=()=>{
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
      });
      const [progress,setProgress]=useState(false);
      const context = useContext(LoginContext);
      const onSubmit = data =>{
      
        var authenticationData = {
            Username: data.userName,
            Password: data.password,
          };
          var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
          var poolData = {
            UserPoolId: USER_POOL_ID,
            ClientId: CLIENT_ID
          };
        
          var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
          var userData = {
            Username: data.userName,
            Pool: userPool
          };
          var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
          setProgress(true);
      
          cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
              var accessToken = result.getAccessToken().getJwtToken();
              var idToken = result.idToken.jwtToken;
              console.log("successful login");
              console.log(accessToken);
              localStorage.setItem('jwtToken', accessToken);
               
              const expirationTime = new Date(
                new Date().getTime() + +3600 * 1000
              );
           //   setProgress(false);
              context.login(idToken,accessToken, expirationTime);        
           
      
              /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
      
      
            },
      
            onFailure: function (err) {
              alert('Invalid credentials');
              setProgress(false);
             
      
            },
      
          });
      };

    return (
        <div className="w-full max-w-md m-auto pb-10">
<form onSubmit={handleSubmit(onSubmit)} className="bg-gray-200 shadow-md rounded px-8 pt-6 pb-8  mt-10 ">

  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2 float-left">
      Username
    </label>
    <input  {...register("userName")} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username"/>
    {errors.userName && <p className="text-red-500 text-xs italic">Please enter your UserName.</p>} 
  </div>
  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-bold mb-2 float-left" >
      Password
    </label>
    <input  {...register("password")} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************"/>
   {errors.password && <p className="text-red-500 text-xs italic">Please enter your Password.</p>} 
  </div>
  <div className="flex items-center justify-between ">
    <button type="submit" disabled={progress} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline float-right m-auto">
     {progress?<div className="flex justify-center items-center">
     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" ></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
  Signing in...
</div>:'Sign In'} 
    </button>
    
  </div>
</form>

</div>

    );
};
export default Login;


