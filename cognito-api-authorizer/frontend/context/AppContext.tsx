import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";

import React, { createContext, useContext, useReducer } from "react";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";

const cognitoProvider = new CognitoIdentityProvider({
  region: "us-west-2",
});

type State = {
  apiUrl: string;
  userPoolClientId: string;
  email: string;
  authenticationResult: AuthenticationResultType;
};

type Action =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_AUTHENTICATION_RESULT"; payload: AuthenticationResultType };

type Dispatch = (action: Action) => void;

const AppContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      cognitoProvider: CognitoIdentityProvider;
    }
  | undefined
>(undefined);

const initialState: State = {
  apiUrl: "https://e2za4vphd7.execute-api.us-west-2.amazonaws.com/prod",
  userPoolClientId: "7srvs8ami5hprv3qdfdejf2go7",
  email: "",
  authenticationResult: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_AUTHENTICATION_RESULT":
      return { ...state, authenticationResult: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch, cognitoProvider }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
