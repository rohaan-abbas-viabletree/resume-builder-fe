/* eslint-disable */

import * as Types from '@/app/client-types';

import { useMutation, UseMutationOptions } from 'react-query';
import { fetchData } from '@/app/api/mutator/fetcherGraphql';
export type CreateResumeMutationVariables = Types.Exact<{
  data: Types.ResumeInput;
}>;


export type CreateResumeMutation = { __typename?: 'Mutation', createResume?: { __typename?: 'Resume', documentId: string } | null };

export type UpdateResumeMutationVariables = Types.Exact<{
  documentId: Types.Scalars['ID']['input'];
  data: Types.ResumeInput;
}>;


export type UpdateResumeMutation = { __typename?: 'Mutation', updateResume?: { __typename?: 'Resume', documentId: string } | null };



export const CreateResumeDocument = `
    mutation createResume($data: ResumeInput!) {
  createResume(data: $data) {
    documentId
  }
}
    `;

export const useCreateResumeMutation = <
      TError = any,
      TContext = unknown
    >(options?: UseMutationOptions<CreateResumeMutation, TError, CreateResumeMutationVariables, TContext>) => {
    
    return useMutation<CreateResumeMutation, TError, CreateResumeMutationVariables, TContext>(
      ['createResume'],
      (variables?: CreateResumeMutationVariables) => fetchData<CreateResumeMutation, CreateResumeMutationVariables>(CreateResumeDocument, variables)(),
      options
    )};

useCreateResumeMutation.getKey = () => ['createResume'];


useCreateResumeMutation.fetcher = (variables: CreateResumeMutationVariables, options?: RequestInit['headers']) => fetchData<CreateResumeMutation, CreateResumeMutationVariables>(CreateResumeDocument, variables, options);

export const UpdateResumeDocument = `
    mutation updateResume($documentId: ID!, $data: ResumeInput!) {
  updateResume(documentId: $documentId, data: $data) {
    documentId
  }
}
    `;

export const useUpdateResumeMutation = <
      TError = any,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateResumeMutation, TError, UpdateResumeMutationVariables, TContext>) => {
    
    return useMutation<UpdateResumeMutation, TError, UpdateResumeMutationVariables, TContext>(
      ['updateResume'],
      (variables?: UpdateResumeMutationVariables) => fetchData<UpdateResumeMutation, UpdateResumeMutationVariables>(UpdateResumeDocument, variables)(),
      options
    )};

useUpdateResumeMutation.getKey = () => ['updateResume'];


useUpdateResumeMutation.fetcher = (variables: UpdateResumeMutationVariables, options?: RequestInit['headers']) => fetchData<UpdateResumeMutation, UpdateResumeMutationVariables>(UpdateResumeDocument, variables, options);
