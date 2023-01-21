import React, { useContext, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  COGNITO_ENDPOINT,
  IDENTITY_POOL_ID,
  LIST_BLOGS_URL,
  REGION,
  BUCKET_NAME,
} from "../../util/constants";
import LoginContext from "../../store/login-context";
import axios from "axios";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import ConfirmationModal from "./ConfirmationModal";

async function getBlogs() {
  const { data } = await axios.get(LIST_BLOGS_URL);

  return data;
}
const BlogsList = () => {
  const [progress, setProgress] = useState(false);
  const { token, userName, cognitoId } = useContext(LoginContext);
  const [showConfirmationModal,setShowConfirmationModal] = useState(false);
  const [selectedBlog,setSelectedBlog]=useState();
  const { mutate, isLoading, error, isSuccess } = useMutation(deleteBlog, {
    onSuccess: (data) => {
      setProgress(false);
    },
    onError: () => {
      setProgress(false);
    },
    onSettled: () => {
      // queryClient.invalidateQueries('assessmentDetails');
    },
  });
  const {
    status: blogsFetchingStatus,
    data: blogs,

    isFetching: isBlogsFetching,
  } = useQuery("blogs", getBlogs, { refetchOnWindowFocus: true });
  async function deleteBlog(key) {
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

      const deleteParams = {
        Bucket: BUCKET_NAME,
        Region: REGION,
        Key: key,
      };
      setProgress(true);

      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (err) {
      throw err;
    }
  }
  const deleteFile = async (key) => {
    mutate(key);
  };
  function deleteFileHandler(key){
    setSelectedBlog(key);
    setShowConfirmationModal(true)
  }

  return (
    <>
    {isBlogsFetching && <div></div>}
    <table className="min-w-full border">
      <thead className="bg-white border-b">
        <tr>
          <th
            scope="col"
            className="text-sm font-medium text-gray-900 px-6 py-4 text-center border-r"
          >
            Title
          </th>

          <th
            scope="col"
            className="text-sm font-medium text-gray-900 px-6 py-4 text-center border-r"
          >
            Author
          </th>
          <th
            scope="col"
            className="text-sm font-medium text-gray-900 px-6 py-4 text-center border-r"
          >
            Date
          </th>
        </tr>
      </thead>
      <tbody>
        {blogsFetchingStatus === "success" &&
          blogs.map((blog) => {
            return (
              <tr className="bg-gray-100 border-b" key={blog.sk}>
                <td className="px-6 py-4  text-left whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                  {blog.title}
                </td>

                <td className="text-sm text-left text-gray-900 font-light px-6 py-4 whitespace-nowrap border-r">
                  {blog.author}
                </td>
                <td className="text-sm text-left text-gray-900 font-light px-6 py-4 whitespace-nowrap border-r">
                  {blog.createdDate.split("T")[0]}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => deleteFileHandler(blog.sk)}
                    disabled={progress}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline float-right m-auto"
                  >
                    Delete Blog
                  </button>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
    {showConfirmationModal && <ConfirmationModal blogKey={selectedBlog} onSubmit={deleteBlog}/>}
   </>
  );
};
export default BlogsList;
