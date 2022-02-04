
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

axios.defaults.withCredentials = true;

function url(path) {
    return BASE_URL + path;
}

function checkJoinCode(code) {
    return axios.post(url('/check-code'), {
        code
    });
}

function getUserInfo(googleToken) {
    return axios.post(url('/user-info'), {
        googleToken
    });
}

function join(code, fullName, googleToken) {
    return axios.post(url('/join'), {
        code,
        fullName,
        googleToken
    });
}

function auth() {
    return axios.get(url('/auth'));
}

function signIn(gToken) {
    return axios.post(url('/signin'), {
        googleToken: gToken
    });
}

export { checkJoinCode, getUserInfo, join, auth, signIn };
