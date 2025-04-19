const signIn = async (username: string, password: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to sign in");
  }

  if (response === undefined) {
    throw new Error("Response is undefined");
  }

  return response;
};

const userService = {
  signIn,
};

export default userService;
