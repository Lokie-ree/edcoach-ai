import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { FunctionReference } from "convex/server";
import { Loader2 } from "lucide-react";

type AuthQueryResult<T> = {
  isLoading: boolean;
  isAuthenticated: boolean;
  data: T | null;
  error: Error | null;
};

export function useAuthQuery<T>(
  query: FunctionReference<"query">,
  args?: any
): AuthQueryResult<T> {
  const { isLoaded, isSignedIn } = useAuth();
  const queryResult = useQuery(query, args);

  // If auth is not loaded yet, show loading state
  if (!isLoaded) {
    return {
      isLoading: true,
      isAuthenticated: false,
      data: null,
      error: null,
    };
  }

  // If not signed in, return unauthenticated state
  if (!isSignedIn) {
    return {
      isLoading: false,
      isAuthenticated: false,
      data: null,
      error: null,
    };
  }

  // If query is loading, show loading state
  if (queryResult === undefined) {
    return {
      isLoading: true,
      isAuthenticated: true,
      data: null,
      error: null,
    };
  }

  // If we have an error, return it
  if (queryResult instanceof Error) {
    return {
      isLoading: false,
      isAuthenticated: true,
      data: null,
      error: queryResult,
    };
  }

  // Success case
  return {
    isLoading: false,
    isAuthenticated: true,
    data: queryResult as T,
    error: null,
  };
} 