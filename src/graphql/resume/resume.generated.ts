/* eslint-disable */

import * as Types from '@/app/client-types';

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions } from 'react-query';
import { fetchData } from '@/app/api/mutator/fetcherGraphql';
export type GetResumesConnectionQueryVariables = Types.Exact<{
  filters?: Types.InputMaybe<Types.ResumeFiltersInput>;
  pagination?: Types.InputMaybe<Types.PaginationArg>;
  sort?: Types.InputMaybe<Array<Types.InputMaybe<Types.Scalars['String']['input']>> | Types.InputMaybe<Types.Scalars['String']['input']>>;
}>;


export type GetResumesConnectionQuery = { __typename?: 'Query', resumes_connection?: { __typename?: 'ResumeEntityResponseCollection', nodes: Array<{ __typename?: 'Resume', documentId: string, name?: string | null, createdAt?: any | null, updatedAt?: any | null }>, pageInfo: { __typename?: 'Pagination', page: number, pageSize: number, pageCount: number, total: number } } | null };

export type GetResumeByIdQueryVariables = Types.Exact<{
  documentId: Types.Scalars['ID']['input'];
}>;


export type GetResumeByIdQuery = { __typename?: 'Query', resume?: { __typename?: 'Resume', documentId: string, name?: string | null, createdAt?: any | null, updatedAt?: any | null, resume_ref_id?: string | null, designation?: string | null, introduction?: string | null, publishedAt?: any | null, education?: Array<{ __typename?: 'ComponentSharedEducation', date?: any | null, education_info?: any | null, education_name?: string | null, id: string } | null> | null, languages?: Array<{ __typename?: 'ComponentSharedLanguages', level?: number | null, level_name?: string | null, name?: string | null } | null> | null, major_projects?: Array<{ __typename?: 'ComponentSharedMajorProjects', name?: string | null, description?: string | null, project_list?: Array<{ __typename?: 'ComponentSharedProjectList', description?: string | null } | null> | null } | null> | null, skills?: Array<{ __typename?: 'ComponentSharedSkills', skill_level?: number | null, skill_name?: string | null } | null> | null, work_history?: Array<{ __typename?: 'ComponentSharedWorkHistory', date?: any | null, designation?: string | null, location?: string | null, description?: string | null, list?: Array<{ __typename?: 'ComponentSharedList', description?: string | null } | null> | null } | null> | null } | null };



export const GetResumesConnectionDocument = `
    query GetResumesConnection($filters: ResumeFiltersInput, $pagination: PaginationArg, $sort: [String]) {
  resumes_connection(filters: $filters, pagination: $pagination, sort: $sort) {
    nodes {
      documentId
      name
      createdAt
      updatedAt
    }
    pageInfo {
      page
      pageSize
      pageCount
      total
    }
  }
}
    `;

export const useGetResumesConnectionQuery = <
      TData = GetResumesConnectionQuery,
      TError = any
    >(
      variables?: GetResumesConnectionQueryVariables,
      options?: UseQueryOptions<GetResumesConnectionQuery, TError, TData>
    ) => {
    
    return useQuery<GetResumesConnectionQuery, TError, TData>(
      variables === undefined ? ['GetResumesConnection'] : ['GetResumesConnection', variables],
      fetchData<GetResumesConnectionQuery, GetResumesConnectionQueryVariables>(GetResumesConnectionDocument, variables),
      options
    )};

useGetResumesConnectionQuery.document = GetResumesConnectionDocument;

useGetResumesConnectionQuery.getKey = (variables?: GetResumesConnectionQueryVariables) => variables === undefined ? ['GetResumesConnection'] : ['GetResumesConnection', variables];

export const useInfiniteGetResumesConnectionQuery = <
      TData = GetResumesConnectionQuery,
      TError = any
    >(
      variables?: GetResumesConnectionQueryVariables,
      options?: UseInfiniteQueryOptions<GetResumesConnectionQuery, TError, TData>
    ) => {
    
    return useInfiniteQuery<GetResumesConnectionQuery, TError, TData>(
      variables === undefined ? ['GetResumesConnection.infinite'] : ['GetResumesConnection.infinite', variables],
      (metaData) => fetchData<GetResumesConnectionQuery, GetResumesConnectionQueryVariables>(GetResumesConnectionDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      options
    )};

useInfiniteGetResumesConnectionQuery.getKey = (variables?: GetResumesConnectionQueryVariables) => variables === undefined ? ['GetResumesConnection.infinite'] : ['GetResumesConnection.infinite', variables];


useGetResumesConnectionQuery.fetcher = (variables?: GetResumesConnectionQueryVariables, options?: RequestInit['headers']) => fetchData<GetResumesConnectionQuery, GetResumesConnectionQueryVariables>(GetResumesConnectionDocument, variables, options);

export const GetResumeByIdDocument = `
    query GetResumeById($documentId: ID!) {
  resume(documentId: $documentId) {
    documentId
    name
    createdAt
    updatedAt
    resume_ref_id
    designation
    designation
    education {
      date
      education_info
      education_name
      id
    }
    introduction
    languages {
      level
      level_name
      name
    }
    major_projects {
      name
      description
      project_list {
        description
      }
    }
    publishedAt
    skills {
      skill_level
      skill_name
    }
    work_history {
      date
      designation
      location
      description
      list {
        description
      }
    }
  }
}
    `;

export const useGetResumeByIdQuery = <
      TData = GetResumeByIdQuery,
      TError = any
    >(
      variables: GetResumeByIdQueryVariables,
      options?: UseQueryOptions<GetResumeByIdQuery, TError, TData>
    ) => {
    
    return useQuery<GetResumeByIdQuery, TError, TData>(
      ['GetResumeById', variables],
      fetchData<GetResumeByIdQuery, GetResumeByIdQueryVariables>(GetResumeByIdDocument, variables),
      options
    )};

useGetResumeByIdQuery.document = GetResumeByIdDocument;

useGetResumeByIdQuery.getKey = (variables: GetResumeByIdQueryVariables) => ['GetResumeById', variables];

export const useInfiniteGetResumeByIdQuery = <
      TData = GetResumeByIdQuery,
      TError = any
    >(
      variables: GetResumeByIdQueryVariables,
      options?: UseInfiniteQueryOptions<GetResumeByIdQuery, TError, TData>
    ) => {
    
    return useInfiniteQuery<GetResumeByIdQuery, TError, TData>(
      ['GetResumeById.infinite', variables],
      (metaData) => fetchData<GetResumeByIdQuery, GetResumeByIdQueryVariables>(GetResumeByIdDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      options
    )};

useInfiniteGetResumeByIdQuery.getKey = (variables: GetResumeByIdQueryVariables) => ['GetResumeById.infinite', variables];


useGetResumeByIdQuery.fetcher = (variables: GetResumeByIdQueryVariables, options?: RequestInit['headers']) => fetchData<GetResumeByIdQuery, GetResumeByIdQueryVariables>(GetResumeByIdDocument, variables, options);
