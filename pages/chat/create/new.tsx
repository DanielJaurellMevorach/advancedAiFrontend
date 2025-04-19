/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import router from 'next/router'
import React, { useState } from 'react'
import service from '../../../services/voiceChat.service';
import CheckIfSignedIn from '@/components/checkIfSignedIn';


const Form: React.FC = () => {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState(null)
  const [statusMessages, setStatusMessages] = useState('')


  const clearErrors = () => {
    setNameError(null)
    setStatusMessages('')
  }

  const validate = (): boolean => {
    let result = true

    if (!name && name.trim() === '') {
        setNameError(null)
      result = false
    }

    return result
  }

  const handleSubmit = async (event:any) => {
    event.preventDefault()

    clearErrors()

    if (!validate()) {
      return
    }

    const response = await service.createVoiceChat(name);

    if (response.status === 200) {
      const result  = await response.json();
      setStatusMessages('chat successfully added')
      setName('');
      setTimeout(() => {
        router.push('/chat');
      }, 2000);

    } else if (response.status === 400) {
      const result = await response.json()
      setStatusMessages('error')
    } else {
      setStatusMessages('error')
    }
  }

  return (
    <div className="max-w-sm m-auto">


      <CheckIfSignedIn
      redirectTo="/login"
      loadingComponent={<div></div>}
    >

      <div>
        <h3 className="px-0">Create Voice Chat</h3>
      </div>

      {statusMessages && (
        <div className="row">
          <ul className="list-none mb-3 mx-auto ">
            {statusMessages}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>

          <div>
            <label
              htmlFor="fieldInput"
              className="block mb-2 text-sm font-medium">
              name
            </label>
          </div>

          <div className="block mb-2 text-sm font-medium">
            <input
              id="fieldInput"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
            {nameError && <div className="text-red-800 ">{nameError}</div>}
          </div>

        </div>

        <div className="row">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            type="submit">
            create
          </button>
        </div>

      </form>
      </CheckIfSignedIn>
      </div>
  )
}

export default Form;