"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { useAppContext } from "@/context/AppContext";

function Login() {
  const router = useRouter();

  const {
    state: { userPoolClientId, email },
    dispatch,
    cognitoProvider,
  } = useAppContext();

  const [password, setPassword] = useState("");

  const initiateAuthenticate = async () => {
    try {
      const response = await cognitoProvider.initiateAuth({
        ClientId: userPoolClientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
      if (
        response.$metadata.httpStatusCode === 200 &&
        response.AuthenticationResult
      ) {
        dispatch({
          type: "SET_AUTHENTICATION_RESULT",
          payload: response.AuthenticationResult,
        });
        console.log(response.AuthenticationResult.IdToken);
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <div className="mb-4">
        <input
          className="w-full px-3 py-2 border rounded"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            dispatch({ type: "SET_EMAIL", payload: e.target.value })
          }
        />
      </div>
      <div className="mb-4">
        <input
          className="w-full px-3 py-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        onClick={initiateAuthenticate}
      >
        Login
      </button>
    </div>
  );
}

export default Login;
