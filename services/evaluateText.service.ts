const sendEvaluateText = async (text: string) => {
    // const token = JSON.parse(localStorage.getItem('loggedInUser') as string).token;
    return await fetch(
      process.env.NEXT_PUBLIC_API_URL + `/evaluate/english`,
      {
          method:"POST",
          headers:{
              'Content-Type': 'application/json',
              Accept: 'application/json',
              // Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            text
            
          })
  
    }
  );
  };

const evaluateTextService = {
    sendEvaluateText
    
  };
  
  export default evaluateTextService;