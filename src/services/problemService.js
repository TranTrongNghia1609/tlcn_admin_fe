import axios from 'axios';
import API from '../utils/api';
import { PROBLEM_ENDPOINTS } from '../config/endpoints';
export const getProblemById = async (id) =>{
  try{
      console.log('Get problem by Id 🆔');
      const data = await API.get(PROBLEM_ENDPOINTS.GET_PROLBEM_ID(id));
      console.log('Problem data: ', data);
      const payload = data.data;
      // const data = {
      //   _id: {
      //     "$oid": "68bf8d2b4759126242242442"
      //   },
      //   name: "Palindrome String",
      //   statement: "## Palindrome String\nCho một xâu ký tự **s**, hãy kiểm tra xem nó có phải là xâu đối xứng (palindrome) hay không.\n\n### Ràng buộc\n- $1 \\leq |s| \\leq 10^5$\n- Xâu chỉ gồm các ký tự chữ cái thường `a-z`.",
      //   input: "Một dòng chứa xâu `s`.",
      //   output: "In `YES` nếu `s` là palindrome, ngược lại in `NO`.",
      //   img: [],
      //   isPrivate: false,
      //   isPdf: false,
      //   time: 2,
      //   memory: 512,
      //   examples: [
      //     "**Input**\n```\nabba\n```\n\n**Output**\n```\nYES\n```",
      //     "**Input**\n```\nabc\n```\n\n**Output**\n```\nNO\n```"
      //   ],
      //   numberOfTestCases: 4,
      //   createdAt: {
      //     $date: "2025-09-09T02:12:59.774Z"
      //   },
      //   updatedAt: {
      //     $date: "2025-09-09T02:12:59.774Z"
      //   },
      //   tags: [
      //     "Tham lam",
      //     "Số học"
      //   ]
      // }
      return payload;
  }
  catch(err){
      console.log('Get problem error: ', err);
      throw err;
  }
}

export const getProblemStats = async () => {
  try {
    const response = await API.get(PROBLEM_ENDPOINTS.STATS);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getAllProblemsByAdmin = async (params) => {
  try {
    const response = await API.get(PROBLEM_ENDPOINTS.GET_ALL_ADMIN, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const toggleProblemStatus = async (problemId) => {
  try {
    const response = await API.patch(PROBLEM_ENDPOINTS.TOGGLE_STATUS(problemId));
    return response.data;
  }
  catch (error) {
    throw error;
  }
}

export const createProblem = async (problemData) => {
  try {
    const response = await API.post(PROBLEM_ENDPOINTS.CREATE_PROBLEM, problemData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const uploadTestCase = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await API.post(PROBLEM_ENDPOINTS.UPLOAD_TESTCASE(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateProblem = async (id, problemData) => {
  try {
    const response = await API.put(PROBLEM_ENDPOINTS.UPDATE_PROBLEM(id), problemData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

