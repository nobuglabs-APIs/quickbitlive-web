/**
 * Centralized API Error Handling and Mapping
 */

export interface FormattedError {
  status: number;
  message: string;
  detail?: any;
}

export function mapApiError(error: any): FormattedError {
  if (!error) {
    return {
      status: 500,
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  const status = error.status || error.statusCode || (error.response && error.response.status) || 500;
  const detail = error.detail || (error.response && error.response.data && error.response.data.detail) || error.message;

  let message = 'Something went wrong processing your request.';

  switch (status) {
    case 400:
      message = typeof detail === 'string' ? detail : 'Invalid request.';
      break;
    case 401:
      message = 'Session expired or unauthorized. Please log in again.';
      break;
    case 403:
      if (typeof detail === 'string' && detail.toLowerCase().includes('email')) {
        message = detail;
      } else {
        message = 'You do not have permission to perform this action.';
      }
      break;
    case 404:
      message = 'Resource not found on the server.';
      break;
    case 422:
      if (Array.isArray(detail)) {
        message = detail.map((d: any) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg || 'invalid'}`).join(', ');
      } else if (typeof detail === 'string') {
        message = detail;
      } else {
        message = 'Invalid data sent in the request.';
      }
      break;
    case 429:
      message = 'Rate limit exceeded. Please wait a moment.';
      break;
    case 500:
    case 502:
    case 503:
      message = 'Internal server error. Please try again later.';
      break;
    default:
      if (typeof detail === 'string') {
        message = detail;
      }
      break;
  }

  return {
    status,
    message,
    detail,
  };
}
