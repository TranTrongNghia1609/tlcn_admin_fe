import React, { useEffect, useState } from 'react'
import ProblemHeader from '@/components/problems/ProblemHeader';
import ProblemStatement from '@/components/problems/ProblemStatement';
import ProblemExamples from '@/components/problems/ProblemExamples';
function PreviewProblem({problem}) {
  return (
    <div className='w-full'>
        <div className="flex-col justify-center items-center content-center">
          <div>
            <ProblemHeader title={problem.name || 'title'} tags={problem.tags} time={problem.time} memory={problem.memory}/>
          </div>
          <ProblemStatement statement={problem.statement} input={problem.input} output={problem.output}/>
          <ProblemExamples examplesInput={problem.examplesInput} examplesOutput={problem.examplesOutput}/>
        </div>
    </div>
  )
}

export default PreviewProblem