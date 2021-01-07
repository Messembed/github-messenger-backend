import { Octokit } from '@octokit/rest';

type PromiseResolveType<T> = T extends PromiseLike<infer U> ? U : T;

export type AuthenticatedGithubUserResponse = Extract<
  PromiseResolveType<ReturnType<Octokit['users']['getAuthenticated']>>['data'],
  { private_gists: never }
>;
