import axios from 'axios';
import API from '../utils/api';
import { CONTEST_ENDPOINTS } from '../config/endpoints';

export const getAllContestsByAdmin = async (params) => {
  try {
    const response = await API.get(CONTEST_ENDPOINTS.GET_ALL_CONTEST, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const createContest = async (contestData) => {
  try {
    const response = await API.post(CONTEST_ENDPOINTS.CREATE_CONTEST, contestData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateContest = async (id, contestData) => {
  try {
    const response = await API.put(CONTEST_ENDPOINTS.UPDATE_CONTEST(id), contestData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const deleteContest = async (id) => {
  try {
    const response = await API.delete(CONTEST_ENDPOINTS.DELETE_CONTEST(id));
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const addProblemToContest = async (contestId, data) => {
  try {
    const response = await API.post(CONTEST_ENDPOINTS.ADD_PROBLEM_TO_CONTEST(contestId), {addProblems: data});
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const toggleContestStatus = async (contestId) => {
  try {
    const response = await API.patch(CONTEST_ENDPOINTS.TOGGLE_STATUS(contestId));
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const codeChecking = async (codeData) => {
  try {
    const response = await API.post(CONTEST_ENDPOINTS.CODE_CHECKING, {code: codeData});
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getContestById = async (id) => {
  try {
    const response = await API.get(CONTEST_ENDPOINTS.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getContestStatistics = async () => {
  try {
    const response = await API.get(CONTEST_ENDPOINTS.STATS);
    return response.data;
  } catch (error) {
    throw error;
  }
}