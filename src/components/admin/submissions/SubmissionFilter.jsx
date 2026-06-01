import React, { use, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { debounce } from 'lodash'
import { userService } from '@/services/userService'
import { getAllProblemsByAdmin } from '@/services/problemService'
import { getAllContestsByAdmin } from '@/services/contestService'
import { CircleX, X } from 'lucide-react'
import avatar from '@/assets/avatar.png';

function SubmissionFilter({ onFilterChange, onClose }) {
  const [filters, setFilters] = useState({
    problemId: null,
    userId: null,
    contestId: null,
    status: null,
  })

  const [filtersDisplay, setFiltersDisplay] = useState({
    problem: '',
    user: '',
    contest: '',
    status: '',
  })

  const handleInputChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
  }

  const [error, setError] = useState('');
  const [loadingGetUser, setLoadingGetUser] = useState(false);
  const [loadingGetProblem, setLoadingGetProblem] = useState(false);
  const [loadingGetContest, setLoadingGetContest] = useState(false);
  const [userList, setUserList] = useState([])
  const [problemList, setProblemList] = useState([])
  const [contestList, setContestList] = useState([])

  const handleUserInputChange =  useMemo(
          () =>
              debounce(async (q) => {
                  try{
                      if (q != ""){
                        const response = await userService.getAdminUsersList({search: q});
                        setUserList(response.data.users)
                      } 
                      setError('')
                  }
                  catch (error){
                      setError('Username này đã tồn tại')
                      console.log(error)
                  }
                  finally {
                    setLoadingGetUser(false)
                  }
              }, 1000),
              []
      )
  const handleProblemInputChange =  useMemo(
    () =>
        debounce(async (q) => {
            try{
                if (q != ""){
                  const response = await getAllProblemsByAdmin({name: q});

                  setProblemList(response.data.content)
                } 
                setError('')
            }
            catch (error){
                setError('Error')
                console.log(error)
            }
            finally {
              setLoadingGetProblem(false)
            }
        }, 1000),
        []
    )
  const handleContestInputChange =  useMemo(
    () =>
        debounce(async (q) => {
            try{
                if (q != ""){
                  const response = await getAllContestsByAdmin({name: q});

                  setContestList(response.data.content)
                } 
                setError('')
            }
            catch (error){
                setError('Error')
                console.log(error)
            }
            finally {
              setLoadingGetContest(false)
            }
        }, 1000),
        []
    )
  const handleApplyFilter = () => {
    if (filters.problemId === '') {
      filters.problemId = null
    }
    if (filters.userId === '') {
      filters.userId = null
    }
    if (filters.contestId === '') {
      filters.contestId = null
    }
    if (filters.status === '') {
      filters.status = null
    }
    console.log(filters);
    onFilterChange(filters);
    onClose();
  }

  const handleReset = () => {
    const resetFilters = {
      problemId: null,
      userId: null,
      contestId: null,
      status: null,
    }
    const resetFiltersDisplay = {
      problem: '',
      user: '',
      contest: '',
      status: '',
    }
    setFilters(resetFilters)
    setFiltersDisplay(resetFiltersDisplay)
    onFilterChange(resetFilters)
  }

  return (
    <div className='bg-white dark:bg-slate-800 rounded-lg shadow-md'>
      <div className='flex p-2'>
        <div className='hover:bg-gray-100 dark:hover:bg-slate-700 p-1 rounded-2xl'>
          <X className='cursor-pointer dark:text-slate-300' onClick={onClose}/>
        </div>
      </div>
    <div className="py-4 px-6 space-y-4 h-[100vh]">
      
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Filter Submissions</h2>
      
      <div className="flex-row space-y-4">
      <div className="relative space-y-1">
        <div className='space-y-2'>
          <Label htmlFor="problemId">Bài tập</Label>
          <Input
            id="problemId"
            placeholder="Nhập tên hoặc mã bài tập"
            value={filtersDisplay.problem}
            onChange={(e) => {
              if (e.target.value !== '') {
                setLoadingGetProblem(true)
              }
              setFiltersDisplay(prev => ({...prev, problem: e.target.value}))
              setFilters(prev => ({...prev, problemId: ''}))
              handleProblemInputChange(e.target.value)
            }}
            onBlur={() => {
              setTimeout(() => setProblemList([]), 200)
            }}
            onFocus={() => {
              if (filtersDisplay.problem !== '') {
                handleProblemInputChange(filtersDisplay.problem)
              }
            }}
          />
        </div>
        {(loadingGetProblem || problemList.length > 0) && (
          <div className='absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
            {loadingGetProblem ? (
              <div className="p-2 text-center text-gray-500 dark:text-slate-400">Loading...</div>
            ): (
              <div className='space-y-2'>
                {problemList.map((problem) => (
                  <div 
                    key={problem._id}
                    className='p-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex justify-start items-center gap-2'
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setFiltersDisplay(prev => ({...prev, problem: problem.name}))
                      setFilters(prev => ({...prev, problemId: problem._id}))
                      setProblemList([])
                    }}
                  >
                    <p className='text-sm font-medium dark:text-slate-200'>{problem.name}</p>
                  </div>
                ))}
              </div>
            )}            
          </div>
        )}
      </div>

        <div className="relative space-y-1">
          <div className='space-y-2'>
            <Label htmlFor="userId">Người dùng</Label>
            <Input
              id="userId"
              placeholder="Nhập tên hoặc username"
              value={filtersDisplay.user}
              onChange={(e) => {
                if (e.target.value !== '') {
                  setLoadingGetUser(true)
                }
                setFiltersDisplay(prev => ({...prev, user: e.target.value}))
                setFilters(prev => ({...prev, userId: ''}))
                handleUserInputChange(e.target.value)
              }}
              onBlur={() => {
                setTimeout(() => setUserList([]), 200)
              }}
              onFocus={() => {
                if (filtersDisplay.user !== '') {
                  handleUserInputChange(filtersDisplay.user)
                }
              }}
            />
          </div>
          {(loadingGetUser || userList.length > 0) && (
            <div className='absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
              {loadingGetUser ? (
                <div className="p-2 text-center text-gray-500 dark:text-slate-400">Loading...</div>
              ): (
                <div className='space-y-2'>
                  {userList.map((user) => (
                    <div 
                      key={user._id}
                      className='p-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex justify-start items-center gap-2'
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setFiltersDisplay(prev => ({...prev, user: user.userName}))
                        setFilters(prev => ({...prev, userId: user._id}))
                        setUserList([])
                      }}
                    >
                      <img src={user.avatar ? user.avatar : avatar} className='w-6 h-6 rounded-full' alt={avatar}></img>
                      <p className='text-sm dark:text-slate-200'>{user.userName}</p>
                    </div>
                  ))}
                </div>
              )}            
            </div>
          )}
        </div>

        <div className="relative space-y-1">
          <div className='space-y-2'>
            <Label htmlFor="contestId">Kỳ thi</Label>
            <Input
              id="contestId"
              placeholder="Nhập tiêu đề hoặc mã"
              value={filtersDisplay.contest}
              onChange={(e) => {
                if (e.target.value !== '') {
                  setLoadingGetContest(true)
                }
                setFiltersDisplay(prev => ({...prev, contest: e.target.value}))
                setFilters(prev => ({...prev, contestId: ''}))
                handleContestInputChange(e.target.value)
              }}
              onBlur={() => {
                setTimeout(() => setContestList([]), 200)
              }}
              onFocus={() => {
                if (filtersDisplay.contest !== '') {
                  handleContestInputChange(filtersDisplay.contest)
                }
              }}
            />
          </div>
          {(loadingGetContest || contestList.length > 0) && (
            <div className='absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
              {loadingGetContest ? (
                <div className="p-2 text-center text-gray-500 dark:text-slate-400">Loading...</div>
              ): (
                <div className='space-y-2'>
                  {contestList.map((contest) => (
                    <div 
                      key={contest._id}
                      className='p-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex justify-start items-center gap-2'
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setFiltersDisplay(prev => ({...prev, contest: contest.name}))
                        setFilters(prev => ({...prev, contestId: contest._id}))
                        setContestList([])
                      }}
                    >
                      <p className='text-sm font-medium dark:text-slate-200'>{contest.title}</p>
                    </div>
                  ))}
                </div>
              )}            
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Judging">Judging</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Wrong Answer">Wrong Answer</SelectItem>
              <SelectItem value="Time Limit Exceeded">Time Limit Exceeded</SelectItem>
              <SelectItem value="Compilation Error">Compilation Error</SelectItem>
              <SelectItem value="Runtime Error">Runtime Error</SelectItem>
              <SelectItem value="Internal Error">Internal Error</SelectItem>
              <SelectItem value="Memory Limit Exceeded">Memory Limit Exceeded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button className={'bg-blue-500 hover:bg-blue-700 cursor-pointer'} onClick={handleApplyFilter}>Apply Filters</Button>
        <Button variant="outline" onClick={handleReset}>Reset</Button>
      </div>
    </div>
    </div>
  )
}

export default SubmissionFilter