import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import React, { useContext, useState } from "react";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useMutation } from "react-query";
import {
  BUCKET_NAME,
  COGNITO_ENDPOINT,
  IDENTITY_POOL_ID,
  REGION,
} from "../../util/constants";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import LoginContext from "../../store/login-context";
const SUPPORTED_FORMATS = ["md", "mdx"];
function getExtension(fileName) {
 const extension = fileName.substring(fileName.lastIndexOf('.')+1);
 return extension;
}
export const validateImageType = (value) => {
  console.log(value);
  if(value) {
    let type = value.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]
    return SUPPORTED_FORMATS.includes(type)
  }
}
const schema = yup
  .object().shape({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    file: yup.mixed().required()
    .test("type", "Only markdown files are allowed", (value) => {
      
      return value && value.length>0 &&
          getExtension(value[0].name) === "md" 
      
  })
  });
const Blogs = () => {
  const { register, handleSubmit,reset, formState: { errors }  } = useForm({
    resolver: yupResolver(schema),
  });
  const { token, userName, cognitoId } = useContext(LoginContext);
  const [progress, setProgress] = useState(false);
  const { mutate, isLoading,error,isSuccess } = useMutation(postBlog, {
    onSuccess: (data) => {
     setProgress(false);
     reset();
    },
    onError: () => {
   setProgress(false);
    },
    onSettled: () => {
      // queryClient.invalidateQueries('assessmentDetails');
    },
  });
  async function postBlog(data) {
    const file = data.file[0];
    try {
      const s3 = new S3Client({
        region: "us-east-1",

        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({ region: "us-east-1" }),
          region: "us-east-1",
          clientConfig: { region: REGION },
          identityPoolId: IDENTITY_POOL_ID,
          logins: {
            [COGNITO_ENDPOINT]: token,
          },
        }),
      });

      //let today = new Date().toISOString().substring(0,19);
      
      const fileName = file.name;

      let key = `blogs/${fileName.substring(0,file.name.lastIndexOf('.'))}-${Date.now()}.${getExtension(fileName)}`;
     // let key = `blogs/${fileName}`;
    
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Region: REGION,
        Key: key,
        Body: file,
        Metadata: {
          title: data.title,
          description: data.description,
          cognitoid: cognitoId,
          user: userName,
        },
      };
      setProgress(true);

     await s3.send(new PutObjectCommand(uploadParams));
   
    } catch (err) {
    
      throw err;
    }
  }
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);

    mutate(data);
  };
  return (
    <div className="w-full max-w-md  pb-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-200 shadow-md rounded px-8 pt-6 pb-8  mt-2 "
      >
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
  <strong className="font-bold">Error in Uploading!</strong>
  
  <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
    <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
  </span>
</div>}
{isSuccess && <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
  <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
  <p>Blog Uploaded Successfully!</p>
</div>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 float-left">
            Title
          </label>
          <input
            {...register("title")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Title"
          />
          {errors.title && <p className="text-red-500 text-xs italic">Please enter Blog title.</p>} 
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2 float-left">
            Description
          </label>
          <textarea
            {...register("description")}
            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            rows="4"
          />
            {errors.description && <p className="text-red-500 text-xs italic">Please enter Blog Description.</p>} 
        </div>
        <div className="mb-4">
          <input
            type="file"
            {...register("file")}
            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
            {errors.file && <p className="text-red-500 text-xs italic">Please upload a markdown file.</p>} 
        </div>
        <div className="flex items-center justify-between ">
          <button
            type="submit"
            disabled={progress}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline float-right m-auto"
          >
            {progress ? (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                   
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </div>
            ) : (
              "Create Blog"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default Blogs;
