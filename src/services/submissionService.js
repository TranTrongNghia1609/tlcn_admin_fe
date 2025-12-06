import { SUBMISSION_ENDPOINTS } from "@/config/endpoints";
import API from "@/utils/api";

export const getAllSubmissionsByAdmin = async (params) => {
  try {
    const response = await API.get(SUBMISSION_ENDPOINTS.GET_SUBMISSIONS_ADMIN, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getSubmissionById = async (submissionId) => {
  try{
    const response = await API.get(SUBMISSION_ENDPOINTS.GET_SUBMISSION_BY_ID(submissionId));
    return response.data;
  }
  catch (error){
    console.error("Error getting submission by ID:", error);
    throw error;
  }
}

export const getSubmissionStats = async () => {
  try {
    const response = await API.get(SUBMISSION_ENDPOINTS.STATS);
    return response.data;
  } catch (error) {
    throw error;
  }
}