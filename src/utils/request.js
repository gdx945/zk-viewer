import fetch from 'dva/fetch';

const objUrl = document.getElementById('js-server-address').innerText;;

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  var finalUrl = url;
  if (!!objUrl) {
    finalUrl = objUrl + url;
    if (!options) {
      options = { method: 'GET' };
    }
    options.mode = 'cors';
    /** options.credentials = 'include'; */
    options.headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }
  return fetch(finalUrl, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => ({ data }))
    .catch(err => ({ err }));
}
