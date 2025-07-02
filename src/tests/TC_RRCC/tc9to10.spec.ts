import { test, expect  } from '@playwright/test';
import { readProperties, readTestData, getAccessToken, fileName } from '../../utils/commonutils';
import { ApiClient } from '../../utils/apiClient';

const apiClient = new ApiClient();


test('TC09-Successful Authentication', async ({ request }) => {
  const response = await request.post('https://sso.acs.org/auth/login', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'EngagementFactory',
      client_secret: '2aff380e1b4848f0ee1588b49726b1aa89d221121680ffe8f2bbb7b57b3f7fa0'
    }).toString()
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('access_token');
  expect(responseBody).toHaveProperty('token_type', 'Bearer');
  expect(responseBody).toHaveProperty('expires_in');
});

test('TC10-Missing Parameter in Authentication', async ({ request }) => {
  const response = await request.post('https://sso.acs.org/auth/login', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'EngagementFactory',
      
    }).toString()
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
expect(responseBody).toHaveProperty('error', 'invalid_request');
expect(responseBody).toHaveProperty('error_description', 'parameter missing or wrong');
});
