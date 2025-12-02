import { TokenEndpointOptions, TokenEndpointResponse } from './global';
import { DEFAULT_AUTH0_CLIENT } from './constants';
import { getJSON } from './http';
import { createQueryParams } from './utils';

export async function oauthToken(
  {
    baseUrl,
    timeout,
    audience,
    scope,
    auth0Client,
    useFormData,
    isFDSFlowEnabled,
    ...options
  }: TokenEndpointOptions,
  worker?: Worker
) {
  const body = useFormData
    ? createQueryParams(options)
    : JSON.stringify(options);

  const tokenEndpoint = isFDSFlowEnabled
    ? `${baseUrl}/token`
    : `${baseUrl}/oauth/token`;

  const requestHeaders: HeadersInit = {
    'Content-Type': useFormData
      ? 'application/x-www-form-urlencoded'
      : 'application/json'
  };

  // Conditionally add the 'Auth0-Client' header based on the 'isFDSFlowEnabled' flag.
  // If isFDSFlowEnabled is true, this header will be omitted.
  if (!isFDSFlowEnabled) {
    requestHeaders['Auth0-Client'] = btoa(
      JSON.stringify(auth0Client || DEFAULT_AUTH0_CLIENT)
    );
  }

  return await getJSON<TokenEndpointResponse>(
    tokenEndpoint,
    timeout,
    audience || 'default',
    scope,
    {
      method: 'POST',
      body,
      headers: requestHeaders
    },
    worker,
    useFormData
  );
}
