"use client";

import React, { useState } from "react";

import Confirmation from "./Confirmation";
import { useAppContext } from "@/context/AppContext";

function SignUp() {
  const {
    state: { userPoolClientId, email },
    dispatch,
    cognitoProvider,
  } = useAppContext();

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showConfirmationComponent, setShowConfirmationComponent] =
    useState(false);

  const sign = async () => {
    try {
      const response = await cognitoProvider.signUp({
        ClientId: userPoolClientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: "name", Value: name }],
      });
      if (response.$metadata.httpStatusCode === 200) {
        setShowConfirmationComponent(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {showConfirmationComponent ? (
        <Confirmation />
      ) : (
        <div className="max-w-sm mx-auto p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
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
          <div className="mb-4">
            <input
              className="w-full px-3 py-2 border rounded"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={sign}
          >
            Sign Up
          </button>
        </div>
      )}
    </>
  );
}

export default SignUp;
