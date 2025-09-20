"use client";

import { useState, useCallback } from "react";
import { handleError, handleSuccess, SuccessCategory } from "@/lib/ErrorHandler";

interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
  successCategory?: SuccessCategory;
}

interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export function useAsyncOperation<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: UseAsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    successCategory = SuccessCategory.COMPLETED,
  } = options;

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      setState({
        isLoading: true,
        error: null,
        isSuccess: false,
      });

      try {
        const result = await asyncFn(...args);

        setState({
          isLoading: false,
          error: null,
          isSuccess: true,
        });

        // Handle success
        if (successMessage) {
          handleSuccess(successCategory, successMessage);
        }
        onSuccess?.();

        return result;
      } catch (error) {
        const errorMsg = handleError(error, errorMessage);

        setState({
          isLoading: false,
          error: errorMsg,
          isSuccess: false,
        });

        onError?.(error);
        return null;
      }
    },
    [asyncFn, onSuccess, onError, successMessage, errorMessage, successCategory]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specialized hooks for common operations
export function useAsyncMutation<T extends any[], R>(
  mutationFn: (...args: T) => Promise<R>,
  options?: UseAsyncOperationOptions
) {
  return useAsyncOperation(mutationFn, {
    successCategory: SuccessCategory.SAVED,
    ...options,
  });
}

export function useAsyncQuery<T extends any[], R>(
  queryFn: (...args: T) => Promise<R>,
  options?: UseAsyncOperationOptions
) {
  return useAsyncOperation(queryFn, {
    ...options,
  });
}

export function useAsyncAction<T extends any[], R>(
  actionFn: (...args: T) => Promise<R>,
  options?: UseAsyncOperationOptions
) {
  return useAsyncOperation(actionFn, {
    successCategory: SuccessCategory.COMPLETED,
    ...options,
  });
}
